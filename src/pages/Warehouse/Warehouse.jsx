// صفحة إدارة المستودع
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { warehouseAPI, productsAPI } from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const Warehouse = () => {
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    location: "",
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
    try {
      setLoading(true);
      const [warehouseRes, productsRes] = await Promise.all([
        warehouseAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setWarehouseItems(warehouseRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      productId: "",
      quantity: "",
      location: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const productId = item.productId || item.productID || item.ProductID;
    setFormData({
      productId: productId || "",
      quantity: item.quantity || item.stock || "",
      location: item.location || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    // Warehouse API doesn't have DELETE endpoint
    alert("واجهة برمجة التطبيقات لا تدعم حذف عناصر المستودع");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingItem) {
        // Use updateQuantity for existing items (primitive int body)
        const productId =
          editingItem.productId ||
          editingItem.productID ||
          editingItem.ProductID ||
          formData.productId;
        const quantity = parseInt(formData.quantity);

        if (!productId) {
          setError("معرف المنتج مطلوب");
          return;
        }

        if (isNaN(quantity) || quantity < 0) {
          setError("الكمية يجب أن تكون رقماً صحيحاً أكبر من أو يساوي الصفر");
          return;
        }

        await warehouseAPI.updateQuantity(productId, quantity);
        setIsModalOpen(false);
        fetchData();
      } else {
        // WareHouse API doesn't support create operation
        setError("لا يمكن إضافة عناصر جديدة. يرجى تحديث الكميات فقط.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "فشل حفظ العنصر"
      );
    }
  };

  const getProductName = (productId) => {
    if (!productId) return "غير محدد";
    const product = products.find(
      (p) =>
        (p.id || p.Id || p.ID) == productId ||
        (p.id || p.Id || p.ID) == (productId.id || productId.Id || productId.ID)
    );
    return product?.name || product?.Name || "غير محدد";
  };

  const columns = [
    {
      header: "المنتج",
      accessor: "productId",
      render: (value, row) =>
        getProductName(value || row.productID || row.ProductID),
    },
    {
      header: "الكمية",
      accessor: "quantity",
      render: (value, row) => value || row.stock || "0",
    },
    { header: "الموقع", accessor: "location" },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستودع</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة عنصر جديد
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={warehouseItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "تعديل عنصر المستودع" : "إضافة عنصر جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المنتج
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              required
            >
              <option value="">اختر المنتج</option>
              {products.map((product) => {
                const productId = product.id || product.Id || product.ID;
                const productName = product.name || product.Name;
                return (
                  <option key={productId} value={productId}>
                    {productName}
                  </option>
                );
              })}
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
            label="الموقع"
            name="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
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

export default Warehouse;
