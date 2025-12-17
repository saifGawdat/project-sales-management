import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import {
  productsAPI,
  categoriesAPI,
  productTypesAPI,
} from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    carModel: "",
    productTypeId: "",
  });

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");

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

  // --- Fetch all data ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productTypesRes] = await Promise.all([
        categoriesAPI.getAll().catch(() => ({ data: [] })),
        productTypesAPI.getAll().catch(() => ({ data: [] })),
      ]);

      setCategories(categoriesRes.data || []);
      setProductTypes(productTypesRes.data || []);

      // جلب المنتجات لكل نوع
      const productsPromises = (productTypesRes.data || []).map((type) =>
        productsAPI.getByProductTypeId(type.id).catch(() => ({ data: [] }))
      );

      const productsResults = await Promise.all(productsPromises);
      const allProducts = productsResults.reduce((acc, res, index) => {
        const type = productTypesRes.data[index];
        const productsWithType = (res.data || []).map((p) => ({
          ...p,
          productTypeId: type.id,
          categoryId: type.categoryId,
        }));
        return acc.concat(productsWithType);
      }, []);

      setProducts(allProducts);
    } catch (err) {
      console.error(err);
      setError("فشل تحميل البيانات. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered products ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchName = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory =
        !selectedCategory || product.categoryId == selectedCategory;
      const matchType =
        !selectedProductType || product.productTypeId == selectedProductType;
      return matchName && matchCategory && matchType;
    });
  }, [products, searchTerm, selectedCategory, selectedProductType]);

  // --- Add product ---
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      stock: "",
      carModel: "",
      productTypeId: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  // --- Edit product ---
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      stock: product.stock || 0,
      carModel: product.carModel || "",
      productTypeId: product.productTypeId || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  // --- Delete product ---
  const handleDelete = async (product) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await productsAPI.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      alert("فشل حذف المنتج");
    }
  };

  // --- Save product ---
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const { name, stock, carModel, productTypeId } = formData;
    if (!name.trim()) {
      setError("اسم المنتج مطلوب");
      return;
    }
    if (!productTypeId) {
      setError("يرجى اختيار نوع المنتج");
      return;
    }

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, { name, stock, carModel });
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, name, stock, carModel } : p
          )
        );
      } else {
        const res = await productsAPI.create(productTypeId, {
          name,
          stock,
          carModel,
        });
        setProducts((prev) => [...prev, { ...res.data, productTypeId }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("فشل حفظ المنتج");
    }
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "غير محدد";
  const getProductTypeName = (id) =>
    productTypes.find((t) => t.id === id)?.name || "غير محدد";

  const columns = [
    { header: "الاسم", accessor: "name" },
    { header: "المخزون", accessor: "stock" },
    { header: "الفئة", accessor: "categoryId", render: getCategoryName },
    { header: "النوع", accessor: "productTypeId", render: getProductTypeName },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
        <Button onClick={handleAdd}>+ إضافة منتج جديد</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <Input
          placeholder="بحث بالاسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedProductType("");
          }}
        >
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedProductType}
          onChange={(e) => setSelectedProductType(e.target.value)}
        >
          <option value="">كل الأنواع</option>
          {productTypes
            .filter(
              (t) => !selectedCategory || t.categoryId == selectedCategory
            )
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="اسم المنتج"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="المخزون"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
          />
          <Input
            label="Car Model"
            value={formData.carModel}
            onChange={(e) =>
              setFormData({ ...formData, carModel: e.target.value })
            }
          />
          <div>
            <label className="block mb-1">نوع المنتج *</label>
            <select
              value={formData.productTypeId}
              onChange={(e) =>
                setFormData({ ...formData, productTypeId: e.target.value })
              }
              disabled={editingProduct}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">اختر النوع</option>
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
