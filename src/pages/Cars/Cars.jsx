// صفحة إدارة السيارات (نظام العمل الداخلي)
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { carsAPI } from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    color: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCars();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carsAPI.getAll();
      setCars(response.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCar(null);
    setFormData({
      make: '',
      model: '',
      year: '',
      plateNumber: '',
      color: '',
      notes: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      make: car.make || '',
      model: car.model || '',
      year: car.year || '',
      plateNumber: car.plateNumber || '',
      color: car.color || '',
      notes: car.notes || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (car) => {
    if (window.confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      try {
        await carsAPI.delete(car.id);
        fetchCars();
      } catch (error) {
        alert('فشل حذف السيارة');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
      };

      if (editingCar) {
        await carsAPI.update(editingCar.id, data);
      } else {
        await carsAPI.create(data);
      }
      setIsModalOpen(false);
      fetchCars();
    } catch (error) {
      setError(error.response?.data?.message || 'فشل حفظ السيارة');
    }
  };

  const columns = [
    { header: 'الماركة', accessor: 'make' },
    { header: 'الموديل', accessor: 'model' },
    { header: 'السنة', accessor: 'year' },
    { header: 'رقم اللوحة', accessor: 'plateNumber' },
    { header: 'اللون', accessor: 'color' },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة السيارات</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة سيارة جديدة
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={cars}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? 'تعديل السيارة' : 'إضافة سيارة جديدة'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الماركة"
              name="make"
              value={formData.make}
              onChange={(e) =>
                setFormData({ ...formData, make: e.target.value })
              }
              required
            />

            <Input
              label="الموديل"
              name="model"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              required
            />

            <Input
              label="السنة"
              name="year"
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
            />

            <Input
              label="رقم اللوحة"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={(e) =>
                setFormData({ ...formData, plateNumber: e.target.value })
              }
            />

            <Input
              label="اللون"
              name="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
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

export default Cars;

