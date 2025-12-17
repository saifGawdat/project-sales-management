// صفحة ملخص الأرباح - عرض تقرير شامل للأرباح والخسائر
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { profitAPI, salesAPI, expensesAPI } from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const ProfitSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("month"); // 'day' or 'month'
  const [dateInput, setDateInput] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const containerRef = useRef(null);

  useEffect(() => {
    fetchSummary();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      // Always calculate from sales and expenses for accurate results
      const [salesRes, expensesRes] = await Promise.all([
        salesAPI.getAll().catch(() => ({ data: [] })),
        expensesAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const sales = salesRes.data || [];
      const expenses = expensesRes.data || [];

      // Filter by date range
      const filteredSales = sales.filter((sale) => {
        if (!sale.date) return false;
        const saleDate = new Date(sale.date);
        const saleMonth = saleDate.getMonth() + 1;
        const saleYear = saleDate.getFullYear();
        const saleDay = saleDate.getDate();

        if (viewMode === "day") {
          return (
            saleDay === dateInput.day &&
            saleMonth === dateInput.month &&
            saleYear === dateInput.year
          );
        } else {
          return saleMonth === dateInput.month && saleYear === dateInput.year;
        }
      });

      const filteredExpenses = expenses.filter((expense) => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth() + 1;
        const expenseYear = expenseDate.getFullYear();
        const expenseDay = expenseDate.getDate();

        if (viewMode === "day") {
          return (
            expenseDay === dateInput.day &&
            expenseMonth === dateInput.month &&
            expenseYear === dateInput.year
          );
        } else {
          return (
            expenseMonth === dateInput.month && expenseYear === dateInput.year
          );
        }
      });

      // Calculate totals from sales (quantity * price)
      const totalSales = filteredSales.reduce(
        (sum, sale) =>
          sum + parseFloat(sale.quantity || 0) * parseFloat(sale.price || 0),
        0
      );
      const totalExpenses = filteredExpenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount || 0),
        0
      );
      const profit = totalSales - totalExpenses;
      const profitPercentage = totalSales > 0 ? (profit / totalSales) * 100 : 0;

      setSummary({
        totalSales,
        totalExpenses,
        profit,
        profitPercentage,
        salesCount: filteredSales.length,
        expensesCount: filteredExpenses.length,
      });
    } catch (error) {
      console.error("Error fetching profit summary:", error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateInput({ ...dateInput, [field]: parseInt(value) || 0 });
  };

  const StatCard = ({ title, value, icon, color = "blue" }) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
          <div
            className={`${colors[color]} w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ملخص الأرباح</h1>

      {/* فلتر التاريخ */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setViewMode("day");
                setTimeout(() => fetchSummary(), 100);
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === "day"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              يومي
            </button>
            <button
              onClick={() => {
                setViewMode("month");
                setTimeout(() => fetchSummary(), 100);
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              شهري
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {viewMode === "day" && (
              <Input
                label="اليوم"
                type="number"
                min="1"
                max="31"
                value={dateInput.day}
                onChange={(e) => handleDateChange("day", e.target.value)}
              />
            )}
            <Input
              label="الشهر"
              type="number"
              min="1"
              max="12"
              value={dateInput.month}
              onChange={(e) => handleDateChange("month", e.target.value)}
            />
            <Input
              label="السنة"
              type="number"
              min="2000"
              max="2100"
              value={dateInput.year}
              onChange={(e) => handleDateChange("year", e.target.value)}
            />
            <div className="flex items-end">
              <Button
                onClick={fetchSummary}
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "جاري التحميل..." : "تحديث التقرير"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : summary ? (
        <>
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="إجمالي المبيعات"
              value={`${summary.totalSales.toFixed(2)} ر.س`}
              icon="💰"
              color="blue"
            />
            <StatCard
              title="إجمالي المصروفات"
              value={`${summary.totalExpenses.toFixed(2)} ر.س`}
              icon="💸"
              color="red"
            />
            <StatCard
              title="صافي الربح"
              value={`${summary.profit.toFixed(2)} ر.س`}
              icon="📊"
              color={summary.profit >= 0 ? "green" : "red"}
            />
            <StatCard
              title="نسبة الربح"
              value={`${summary.profitPercentage.toFixed(2)}%`}
              icon="📈"
              color="purple"
            />
          </div>

          {/* تفاصيل إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                معلومات المبيعات
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد الطلبات:</span>
                  <span className="font-medium">{summary.salesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">متوسط قيمة الطلب:</span>
                  <span className="font-medium">
                    {summary.salesCount > 0
                      ? (summary.totalSales / summary.salesCount).toFixed(2)
                      : "0.00"}{" "}
                    ر.س
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                معلومات المصروفات
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد المصروفات:</span>
                  <span className="font-medium">{summary.expensesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">متوسط قيمة المصروف:</span>
                  <span className="font-medium">
                    {summary.expensesCount > 0
                      ? (summary.totalExpenses / summary.expensesCount).toFixed(
                          2
                        )
                      : "0.00"}{" "}
                    ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-gray-500">
          لا توجد بيانات للعرض
        </div>
      )}
    </div>
  );
};

export default ProfitSummary;
