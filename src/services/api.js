import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============ Axios Instance ============
const api = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ============ Request Interceptor ============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============ Response Interceptor ============
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      const isLoginRequest =
        error.config.url &&
        error.config.url.toLowerCase().includes("users/login");

      if (status === 401 && !isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }

      if (status === 403) {
        console.error("[API] Access forbidden - insufficient permissions");
        console.log(data);
      }

      if (status === 404) {
        console.error("[API] Resource not found");
      }

      if (status >= 500) {
        console.error("[API] Server error occurred");
      }
    } else if (error.request) {
      console.error(
        "[API] Network error - no response received",
        error.message
      );
    } else {
      console.error("[API] Error", error.message);
    }

    return Promise.reject(error);
  }
);

// ============ Helper Functions ============

const sendStringBody = {
  headers: { "Content-Type": "application/json" },
};

// ============ Authentication API ============

export const authAPI = {
  login: (credentials) => {
    return api.post("/Users/login", {
      name: credentials.username || credentials.name,
      password: credentials.password,
    });
  },

  register: (data) => {
    return api.post("/Users/register", {
      name: data.username || data.name,
      email: data.email,
      password: data.password,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  getCurrentUser: () => api.get("/Users/me").catch(() => null),

  deleteAccount: () => api.delete("/Users"),
};

// ============ Categories API ============

export const categoriesAPI = {
  getAll: () => api.get("/Categories"),

  create: (name) =>
    api.post("/Categories", JSON.stringify(name), sendStringBody),

  update: (id, name) =>
    api.put(`/Categories/${id}`, JSON.stringify(name), sendStringBody),

  delete: (categoryId) => api.delete(`/Categories/${categoryId}`),
};

// ============ Product Types API ============

export const productTypesAPI = {
  getByCategoryId: (categoryId) => api.get(`/ProductTypes/${categoryId}`),

  create: (categoryId, name) =>
    api.post(
      `/ProductTypes/${categoryId}`,
      JSON.stringify(name),
      sendStringBody
    ),

  update: (typeId, name) =>
    api.put(`/ProductTypes/${typeId}`, JSON.stringify(name), sendStringBody),

  delete: (typeId) => api.delete(`/ProductTypes/${typeId}`),

  getAll: async () => {
    try {
      const categoriesRes = await api.get("/Categories");
      const categories = categoriesRes.data || [];

      if (categories.length === 0) {
        return { data: [] };
      }

      const productTypesPromises = categories.map((cat) =>
        api
          .get(`/ProductTypes/${cat.id || cat.Id || cat.ID}`)
          .catch(() => ({ data: [] }))
      );

      const productTypesResults = await Promise.all(productTypesPromises);

      const allProductTypes = productTypesResults.reduce(
        (acc, result, index) => {
          const categoryId =
            categories[index].id ||
            categories[index].Id ||
            categories[index].ID;
          const types = (result.data || []).map((type) => ({
            ...type,
            categoryId: categoryId, // Inject categoryId
            CategoryID: categoryId, // Handle potential casing preference
          }));
          return acc.concat(types);
        },
        []
      );

      return { data: allProductTypes };
    } catch (error) {
      console.error("[API] Error fetching all product types:", error);
      return { data: [] };
    }
  },
};

// ============ Products API ============

export const productsAPI = {
  getByProductTypeId: (productTypeId) => api.get(`/Products/${productTypeId}`),

  create: (productTypeId, data) => {
    const payload = {
      name: data.name,
      stock: data.stock || 0,
      carModel: data.carModel || "", // API spec requires this field
    };
    console.log("[API] Creating product:", { productTypeId, payload });
    return api.post(`/Products/${productTypeId}`, payload);
  },

  update: (ProductID, data) => {
    const payload = {
      name: data.name,
      stock: data.stock || 0,
      carModel: data.carModel || "", // API spec requires this field
    };
    console.log("[API] Updating product:", { ProductID, payload });
    return api.put(`/Products/${ProductID}`, payload);
  },

  delete: (ProductID) => api.delete(`/Products/${ProductID}`),

  getAll: async () => {
    try {
      const productTypesRes = await productTypesAPI.getAll();
      const productTypes = productTypesRes.data || [];

      if (productTypes.length === 0) {
        console.log("[API] No product types found, returning empty products");
        return { data: [] };
      }

      console.log(
        "[API] Fetching products for",
        productTypes.length,
        "product types"
      );

      const productsPromises = productTypes.map((type) => {
        const typeId = type.id || type.Id || type.ID;
        return api
          .get(`/Products/${typeId}`)
          .then((response) => {
            console.log(`[API] Products for type ${typeId}:`, response.data);
            return response;
          })
          .catch((error) => {
            console.warn(
              `[API] Failed to fetch products for type ${typeId}:`,
              error.message
            );
            return { data: [] };
          });
      });

      const productsResults = await Promise.all(productsPromises);

      const allProducts = productsResults.reduce((acc, result, index) => {
        const productTypeId =
          productTypes[index].id ||
          productTypes[index].Id ||
          productTypes[index].ID;
        const categoryId =
          productTypes[index].categoryId || productTypes[index].CategoryID;

        const products = (result.data || []).map((product) => ({
          ...product,
          productTypeId: productTypeId,
          ProductTypeId: productTypeId,
          categoryId: categoryId,
          CategoryID: categoryId,
        }));
        return acc.concat(products);
      }, []);

      console.log("[API] Total products fetched:", allProducts.length);
      return { data: allProducts };
    } catch (error) {
      console.error("[API] Error fetching all products:", error);
      console.error("[API] Error details:", error.response || error.message);
      throw error; // Re-throw to let component handle it
    }
  },
};

// ============ Cars API ============

export const carsAPI = {
  getByProductID: (ProductID) => api.get(`/Cars/${ProductID}`),

  getAll: async () => {
    try {
      const productsRes = await productsAPI.getAll();
      const products = productsRes.data || [];

      if (products.length === 0) {
        return { data: [] };
      }

      const carsPromises = products.map((product) =>
        api
          .get(`/Cars/${product.id || product.Id || product.ID}`)
          .catch(() => ({ data: [] }))
      );

      const carsResults = await Promise.all(carsPromises);

      const allCars = carsResults.reduce((acc, result) => {
        return acc.concat(result.data || []);
      }, []);

      return { data: allCars };
    } catch (error) {
      console.error("[API] Error fetching all cars:", error);
      return { data: [] };
    }
  },
};

// ============ Orders (Sales) API ============

export const salesAPI = {
  getAll: () => api.get("/Orders"),

  create: (data) =>
    api.post("/Orders", {
      quantity: data.quantity || 0,
      price: data.price || 0,
      date: data.date || new Date().toISOString(),
      customerName: data.customerName || "",
      productID: data.productID || data.ProductID || 0,
      userID: data.userID || data.userId || 0,
    }),

  update: (orderId, data) =>
    api.put(`/Orders/${orderId}`, {
      price: data.price || 0,
      quantity: data.quantity || 0,
    }),

  delete: (orderId) => api.delete(`/Orders/${orderId}`),
};

// ============ Expenses API ============

export const expensesAPI = {
  getAll: () => api.get("/Expenses"),

  create: (data) =>
    api.post("/Expenses", {
      amount: data.amount || 0,
      name: data.name || data.description || "",
      date: data.date || new Date().toISOString(),
      message: data.message || data.notes || "",
    }),

  update: (id, data) =>
    api.put(`/Expenses/${id}`, {
      amount: data.amount || 0,
      name: data.name || data.description || "",
      date: data.date || new Date().toISOString(),
      message: data.message || data.notes || "",
    }),

  delete: (id) => api.delete(`/Expenses/${id}`),
};

// ============ Warehouse API ============

export const warehouseAPI = {
  getAll: () => api.get("/WareHouse"),

  updateQuantity: (ProductID, quantity) => {
    // API expects primitive integer (0) as body
    const qty = parseInt(quantity);
    return api.put(`/WareHouse/${ProductID}`, qty, {
      headers: { "Content-Type": "application/json" },
    });
  },
};

// ============ Profit API ============

export const profitAPI = {
  getByDay: (day, month, year) =>
    api.get("/Profit/day", { params: { day, Month: month, Year: year } }),

  getByMonth: (month, year) =>
    api.get("/Profit/month", { params: { month, year } }),
};

export default api;
