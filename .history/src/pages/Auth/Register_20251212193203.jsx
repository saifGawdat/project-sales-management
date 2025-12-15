// صفحة إنشاء حساب جديد
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { gsap } from "gsap";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // إذا كان المستخدم مسجل دخول بالفعل، إعادة توجيهه
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/categories");
    }
  }, [isAuthenticated, navigate]);

  // إضافة رسوم متحركة عند تحميل الصفحة
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, []);

  // معالجة تغيير الحقول
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        navigate("/auth/login");
      } else {
        setError(result.error || "فشل إنشاء الحساب");
      }
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إيشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600">نظام الإدارة - المخزون والمبيعات</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
          />

          <Input
            label="اسم المستخدم"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              لدي حساب بالفعل؟{" "}
              <Link
                to="/auth/login"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
