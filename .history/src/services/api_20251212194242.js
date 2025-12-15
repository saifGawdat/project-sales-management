// ملف خدمة API - يحتوي على جميع طلبات HTTP للتواصل مع الخادم الخلفي
import axios from "axios";

// إعداد axios الأساسي مع عنوان API
// يستخدم متغير البيئة VITE_API_BASE_URL أو العنوان الافتراضي
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://autopartsdemo.runasp.net/api";

// إنشاء instance من axios مع إعدادات افتراضية
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// إضافة interceptor لإرفاق token في كل طلب
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

// إضافة interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان الخطأ 401، قم بتسجيل الخروج
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// ============ Authentication APIs ============
export const authAPI = {
  // تسجيل الدخول
  login: (credentials) => {
    const loginPayload = {
      name: credentials.username || credentials.name,
      password: credentials.password,
    };
    console.log("[API] Login request:", { name: loginPayload.name });
    return api.post("/Users/login", loginPayload);
  },
  // إنشاء حساب جديد
  register: (data) => {
    const registerPayload = {
      email: data.email,
      name: data.username || data.name,
      password: data.password,
    };
    console.log("[API] Register request:", {
      name: registerPayload.name,
      email: registerPayload.email,
    });
    return api.post("/Users/register", registerPayload);
  },
  // تسجيل الخروج - لا يوجد endpoint في Swagger، يتم التعامل معه محلياً
  logout: () => Promise.resolve(),
  // الحصول على معلومات المستخدم الحالي
  getCurrentUser: () => {
    console.log("[API] Fetching current user");
    return api.get("/Users/me");
  },
};

// ============ Categories APIs ============
export const categoriesAPI = {
  // الحصول على جميع الفئات
  getAll: () => api.get("/Categories"),
  // الحصول على فئة واحدة
  getById: (id) => api.get(`/Categories/${id}`),
  // إنشاء فئة جديدة
  create: (data) => api.post("/Categories", data),
  // تحديث فئة
  update: (id, data) => api.put(`/Categories/${id}`, data),
  // حذف فئة
  delete: (id) => api.delete(`/Categories/${id}`),
};

// ============ Product Types APIs ============
export const productTypesAPI = {
  getAll: () => api.get("/ProductTypes"),
  getById: (id) => api.get(`/ProductTypes/${id}`),
  create: (data) => api.post("/ProductTypes", data),
  update: (id, data) => api.put(`/ProductTypes/${id}`, data),
  delete: (id) => api.delete(`/ProductTypes/${id}`),
};

// ============ Products APIs ============
export const productsAPI = {
  getAll: () => api.get("/Products"),
  getById: (id) => api.get(`/Products/${id}`),
  create: (data) => api.post("/Products", data),
  update: (id, data) => api.put(`/Products/${id}`, data),
  delete: (id) => api.delete(`/Products/${id}`),
};

// ============ Warehouse APIs ============
export const warehouseAPI = {
  getAll: () => api.get("/Warehouse"),
  getById: (id) => api.get(`/Warehouse/${id}`),
  create: (data) => api.post("/Warehouse", data),
  update: (id, data) => api.put(`/Warehouse/${id}`, data),
  delete: (id) => api.delete(`/Warehouse/${id}`),
  // تحديث الكمية في المستودع
  updateQuantity: (id, quantity) =>
    api.put(`/Warehouse/${id}/quantity`, { quantity }),
};

// ============ Cars APIs ============
export const carsAPI = {
  getAll: () => api.get("/Cars"),
  getById: (id) => api.get(`/Cars/${id}`),
  create: (data) => api.post("/Cars", data),
  update: (id, data) => api.put(`/Cars/${id}`, data),
  delete: (id) => api.delete(`/Cars/${id}`),
};

// ============ Sales/Orders APIs ============
export const salesAPI = {
  getAll: () => api.get("/Sales"),
  getById: (id) => api.get(`/Sales/${id}`),
  create: (data) => api.post("/Sales", data),
  update: (id, data) => api.put(`/Sales/${id}`, data),
  delete: (id) => api.delete(`/Sales/${id}`),
  // الحصول على إحصائيات المبيعات
  getStatistics: () => api.get("/Sales/statistics"),
};

// ============ Expenses APIs ============
export const expensesAPI = {
  getAll: () => api.get("/Expenses"),
  getById: (id) => api.get(`/Expenses/${id}`),
  create: (data) => api.post("/Expenses", data),
  update: (id, data) => api.put(`/Expenses/${id}`, data),
  delete: (id) => api.delete(`/Expenses/${id}`),
  // الحصول على إحصائيات المصروفات
  getStatistics: () => api.get("/Expenses/statistics"),
};

// ============ Profit Summary APIs ============
export const profitAPI = {
  getSummary: (startDate, endDate) =>
    api.get("/Profit/summary", { params: { startDate, endDate } }),
  getReport: (startDate, endDate) =>
    api.get("/Profit/report", { params: { startDate, endDate } }),
};

export default api;
