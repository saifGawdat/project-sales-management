// صفحة إدارة المستودع
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { warehouseAPI, productsAPI } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';

const Warehouse = () => {
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    location: '',
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
      const [warehouseRes, productsRes] = await Promise.all([
        warehouseAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setWarehouseItems(warehouseRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      productId: '',
      quantity: '',
      location: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId || '',
      quantity: item.quantity || '',
      location: item.location || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      try {
        await warehouseAPI.delete(item.id);
        fetchData();
      } catch (error) {
        alert('فشل حذف العنصر');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      if (editingItem) {
        await warehouseAPI.update(editingItem.id, data);
      } else {
        await warehouseAPI.create(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'فشل حفظ العنصر');
    }
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || 'غير محدد';
  };

  const columns = [
    {
      header: 'المنتج',
      accessor: 'productId',
      render: (value) => getProductName(value),
    },
    { header: 'الكمية', accessor: 'quantity' },
    { header: 'الموقع', accessor: 'location' },
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
        title={editingItem ? 'تعديل عنصر المستودع' : 'إضافة عنصر جديد'}
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
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
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

