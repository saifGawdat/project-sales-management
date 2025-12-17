// صفحة إدارة المصروفات
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { expensesAPI } from "../../services/api";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getAll();
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setFormData({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.name || expense.description || "",
      amount: expense.amount || "",
      category: expense.category || "",
      date: expense.date
        ? expense.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: expense.message || expense.notes || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (expense) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        const expenseId = expense.id || expense.Id || expense.ID;
        await expensesAPI.delete(expenseId);
        setExpenses((prev) =>
          prev.filter((e) => (e.id || e.Id || e.ID) !== expenseId)
        );
      } catch (error) {
        alert("فشل حذف المصروف");
        console.error(error);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = {
        amount: parseFloat(formData.amount) || 0,
        name: formData.description || "", // Swagger uses 'name' not 'description'
        date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
        message: formData.notes || "", // Swagger uses 'message' not 'notes'
      };

      if (editingExpense) {
        const expenseId =
          editingExpense.id || editingExpense.Id || editingExpense.ID;
        await expensesAPI.update(expenseId, data);
      } else {
        await expensesAPI.create(data);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      setError(error.response?.data?.message || "فشل حفظ المصروف");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA");
  };

  const columns = [
    {
      header: "الوصف",
      accessor: "name",
      render: (value, row) => value || row.description || "",
    },
    {
      header: "المبلغ",
      accessor: "amount",
      render: (value) => `${value?.toFixed(2) || "0.00"} ر.س`,
    },
    { header: "الفئة", accessor: "category" },
    {
      header: "التاريخ",
      accessor: "date",
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المصروفات</h1>
        <Button onClick={handleAdd} variant="primary">
          + إضافة مصروف جديد
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? "تعديل المصروف" : "إضافة مصروف جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="الوصف"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="المبلغ"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />

            <Input
              label="الفئة"
              name="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />

            <Input
              label="التاريخ"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
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

export default Expenses;
