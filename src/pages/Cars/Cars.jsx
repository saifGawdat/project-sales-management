import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { carsAPI } from "../../services/api";
import Table from "../../components/ui/Table";
import Loading from "../../components/ui/Loading";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const carsData = response.data || [];

      // The API returns car data, filter out empty results
      const validCars = carsData.filter(
        (car) => car && (car.carModel || car.name)
      );

      setCars(validCars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "اسم المنتج", accessor: "name" },
    { header: "موديل السيارة", accessor: "carModel" },
    {
      header: "المخزون",
      accessor: "stock",
      render: (value) => value || "0",
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة السيارات</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
          💡 لإضافة سيارة جديدة، قم بإضافة منتج وحدد موديل السيارة
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : cars.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">لا توجد سيارات محددة في المنتجات</p>
          <p className="text-sm text-gray-500">
            قم بإضافة منتجات مع تحديد موديل السيارة لعرضها هنا
          </p>
        </div>
      ) : (
        <Table columns={columns} data={cars} />
      )}
    </div>
  );
};

export default Cars;
