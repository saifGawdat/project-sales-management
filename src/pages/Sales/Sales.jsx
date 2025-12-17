// صفحة إدارة المبيعات (الطلبات)
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { salesAPI, productsAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    ProductID: "",
    quantity: "",
    price: "",
    customerName: "",
    customerPhone: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    fetchData();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch Sales
    try {
      const salesRes = await salesAPI.getAll();
      setSales(salesRes.data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
      // Don't let sales error stop products from loading
    }

    // Fetch Products
    try {
      const productsRes = await productsAPI.getAll();
      console.log("Fetched products:", productsRes.data); // Debug log
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSale(null);
    setFormData({
      ProductID: "",
      quantity: "",
      price: "",
      customerName: "",
      customerPhone: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      ProductID: sale.productID || sale.ProductID || "",
      quantity: sale.quantity || "",
      price: sale.price || "",
      customerName: sale.customerName || "",
      customerPhone: sale.customerPhone || "",
      date: sale.date
        ? sale.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: sale.notes || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (sale) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      try {
        const orderId = sale.id || sale.Id || sale.ID;
        await salesAPI.delete(orderId);
        setSales((prev) =>
          prev.filter((s) => (s.id || s.Id || s.ID) !== (orderId || sale.id))
        );
      } catch (error) {
        alert("فشل حذف الطلب");
        console.error(error);
      }
    }
  };

  const { user } = useAuth(); // Get current user

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userID = user?.id || user?.ID || user?.Id;
      if (!userID) {
        throw new Error("User not authenticated");
      }

      const data = {
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
        customerName: formData.customerName || "",
        productID: parseInt(formData.ProductID) || 0,
        userID: parseInt(userID),
      };

      if (editingSale) {
        // Update only accepts price and quantity
        const orderId = editingSale.id || editingSale.Id || editingSale.ID;
        await salesAPI.update(orderId, {
          price: parseFloat(formData.price) || 0,
          quantity: parseInt(formData.quantity) || 0,
        });
      } else {
        await salesAPI.create(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "فشل حفظ الطلب"
      );
    }
  };

  const getProductName = (productID) => {
    if (!productID) return "غير محدد";
    const product = products.find(
      (p) =>
        (p.id || p.Id || p.ID) == productID ||
        (p.id || p.Id || p.ID) == (productID.id || productID.Id || productID.ID)
    );
    return product?.name || product?.Name || "غير محدد";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA");
  };

  const columns = [
    {
      header: "المنتج",
      accessor: "productID",
      render: (value, row) =>
        getProductName(value || row.ProductID || row.productID),
    },
    { header: "الكمية", accessor: "quantity" },
    {
      header: "السعر",
      accessor: "price",
      render: (value) => `${value?.toFixed(2) || "0.00"} ر.س`,
    },
    {
      header: "الإجمالي",
      accessor: "total",
      render: (value, row) => {
        const total = (row.quantity || 0) * (row.price || 0);
        return `${total.toFixed(2)} ر.س`;
      },
    },
    { header: "اسم العميل", accessor: "customerName" },
    {
      header: "التاريخ",
      accessor: "date",
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المبيعات</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة طلب جديد
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={sales}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSale ? "تعديل الطلب" : "إضافة طلب جديد"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنتج
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.ProductID}
                onChange={(e) =>
                  setFormData({ ...formData, ProductID: e.target.value })
                }
                required
              >
                <option value="">اختر المنتج</option>
                {products.length > 0 ? (
                  products.map((product) => (
                    <option
                      key={product.id || product.Id || product.ID}
                      value={product.id || product.Id || product.ID}
                    >
                      {product.name || product.Name}
                    </option>
                  ))
                ) : (
                  <option disabled>لا توجد منتجات متاحة</option>
                )}
              </select>
            </div>

            <Input
              label="الكمية"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />

            <Input
              label="السعر"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />

            <Input
              label="التاريخ"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />

            <Input
              label="اسم العميل"
              name="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
            />

            <Input
              label="هاتف العميل"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
            />
          </div>

          <Input
            label="ملاحظات"
            name="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              حفظ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
