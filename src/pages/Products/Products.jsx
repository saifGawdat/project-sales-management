// صفحة إدارة المنتجات
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { productsAPI, categoriesAPI, productTypesAPI } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    productTypeId: '',
    sku: '',
  });
  const [error, setError] = useState('');
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
      const [productsRes, categoriesRes, typesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        productTypesAPI.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setProductTypes(typesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      productTypeId: '',
      sku: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      categoryId: product.categoryId || '',
      productTypeId: product.productTypeId || '',
      sku: product.sku || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await productsAPI.delete(product.id);
        fetchData();
      } catch (error) {
        alert('فشل حذف المنتج');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
      } else {
        await productsAPI.create(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'فشل حفظ المنتج');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'غير محدد';
  };

  const getProductTypeName = (typeId) => {
    const type = productTypes.find((t) => t.id === typeId);
    return type?.name || 'غير محدد';
  };

  const columns = [
    { header: 'الاسم', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    {
      header: 'الفئة',
      accessor: 'categoryId',
      render: (value) => getCategoryName(value),
    },
    {
      header: 'النوع',
      accessor: 'productTypeId',
      render: (value) => getProductTypeName(value),
    },
    {
      header: 'السعر',
      accessor: 'price',
      render: (value) => `${value?.toFixed(2) || '0.00'} ر.س`,
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة منتج جديد
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفئة
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع المنتج
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.productTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, productTypeId: e.target.value })
                }
                required
              >
                <option value="">اختر النوع</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <Input
            label="الوصف"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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

export default Products;

