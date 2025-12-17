// صفحة إدارة أنواع المنتجات
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { productTypesAPI, categoriesAPI } from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const ProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  // CategoryID is needed for Creation
  const [formData, setFormData] = useState({
    name: "",
    CategoryID: "",
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
      const [typesRes, catsRes] = await Promise.all([
        productTypesAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      // Debug logging
      console.log("[ProductTypes] Categories Response:", catsRes);
      console.log("[ProductTypes] Categories Data:", catsRes.data);
      console.log("[ProductTypes] Is Array?", Array.isArray(catsRes.data));
      console.log("[ProductTypes] Count:", catsRes.data?.length);

      setProductTypes(typesRes.data || []);
      setCategories(catsRes.data || []);

      // Debug state
      console.log(
        "[ProductTypes] Categories state set to:",
        catsRes.data || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProductType(null);
    setFormData({ name: "", description: "", CategoryID: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (productType) => {
    setEditingProductType(productType);
    setFormData({
      name: productType.name || "",
      description: productType.description || "",
      CategoryID: productType.CategoryID || "", // If API returns CategoryID
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (productType) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      try {
        const typeId = productType.id || productType.Id || productType.ID;
        await productTypesAPI.delete(typeId);
        setProductTypes((prev) =>
          prev.filter((t) => (t.id || t.Id || t.ID) !== typeId)
        );
      } catch (error) {
        alert("فشل حذف النوع");
        console.error(error);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingProductType) {
        // Update might only need name, check API
        const typeId =
          editingProductType.id ||
          editingProductType.Id ||
          editingProductType.ID;
        await productTypesAPI.update(typeId, formData.name);
      } else {
        // Create requires CategoryID and Name
        if (!formData.CategoryID) {
          setError("يرجى اختيار الفئة");
          return;
        }
        await productTypesAPI.create(formData.CategoryID, formData.name);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "فشل حفظ النوع");
    }
  };

  const columns = [
    { header: "الاسم", accessor: "name" },
    { header: "الوصف", accessor: "description" },
    {
      header: "المعرف",
      accessor: "id",
      render: (val) => <span className="text-gray-400 text-xs">#{val}</span>,
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          إدارة أنواع المنتجات
        </h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة نوع جديد
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={productTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProductType ? "تعديل نوع المنتج" : "إضافة نوع منتج جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Show Category Select only on Create? Or both? API update signature is update(id, name). 
                Ideally update shouldn't change category often or API doesn't support it. 
                Keeping it simple: Show always, but only use it for Create as per API signature. */}
          {!editingProductType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفئة
              </label>
              {console.log(
                "[Modal] Rendering categories dropdown. Categories:",
                categories,
                "Count:",
                categories.length
              )}
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.CategoryID}
                onChange={(e) => {
                  console.log("[Modal] Category selected:", e.target.value);
                  setFormData({ ...formData, CategoryID: e.target.value });
                }}
                required
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => {
                  const catId = cat.id || cat.Id || cat.ID;
                  const catName = cat.name || cat.Name;
                  return (
                    <option key={catId} value={catId}>
                      {catName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <Input
            label="اسم النوع"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
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

export default ProductTypes;
