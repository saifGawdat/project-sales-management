// صفحة إدارة أنواع المنتجات
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { productTypesAPI } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';

const ProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    fetchProductTypes();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const response = await productTypesAPI.getAll();
      setProductTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching product types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProductType(null);
    setFormData({ name: '', description: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (productType) => {
    setEditingProductType(productType);
    setFormData({
      name: productType.name || '',
      description: productType.description || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (productType) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النوع؟')) {
      try {
        await productTypesAPI.delete(productType.id);
        fetchProductTypes();
      } catch (error) {
        alert('فشل حذف النوع');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProductType) {
        await productTypesAPI.update(editingProductType.id, formData);
      } else {
        await productTypesAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchProductTypes();
    } catch (error) {
      setError(error.response?.data?.message || 'فشل حفظ النوع');
    }
  };

  const columns = [
    { header: 'الاسم', accessor: 'name' },
    { header: 'الوصف', accessor: 'description' },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة أنواع المنتجات</h1>
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
        title={editingProductType ? 'تعديل نوع المنتج' : 'إضافة نوع منتج جديد'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="اسم النوع"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

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

export default ProductTypes;

