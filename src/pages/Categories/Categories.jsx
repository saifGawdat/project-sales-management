// صفحة إدارة الفئات - عرض وإدارة جميع الفئات
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { categoriesAPI } from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchCategories();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  // جلب جميع الفئات
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // فتح النافذة المنبثقة لإضافة فئة جديدة
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setError("");
    setIsModalOpen(true);
  };

  // فتح النافذة المنبثقة لتعديل فئة
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  // حذف فئة
  const handleDelete = async (category) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      try {
        await categoriesAPI.delete(category.id);
        fetchCategories();
      } catch (error) {
        alert("فشل حذف الفئة");
        alert(error.response?.data?.message);
      }
    }
  };

  // حفظ الفئة (إضافة أو تعديل)
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingCategory) {
        // Send name as string to match Create pattern
        await categoriesAPI.update(editingCategory.id, formData.name);
      } else {
        await categoriesAPI.create(formData.name);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error.response?.data?.message || "فشل حفظ الفئة");
    }
  };

  // تعريف أعمدة الجدول
  const columns = [
    { header: "الاسم", accessor: "name" },
    { header: "الوصف", accessor: "description" },
  ];

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* العنوان وأزرار الإجراءات */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الفئات</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة فئة جديدة
        </Button>
      </div>

      {/* شريط البحث */}
      <div className="max-w-md">
        <Input
          placeholder="بحث عن فئة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* الجدول */}
      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* النافذة المنبثقة للنموذج */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
        className="w-[500px] mt-20"
      >
        <form onSubmit={handleSave} className="space-y-8 mt-30!">
          <Input
            label="اسم الفئة"
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

export default Categories;
