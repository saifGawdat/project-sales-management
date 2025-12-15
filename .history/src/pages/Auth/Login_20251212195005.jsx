// صفحة تسجيل الدخول
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { gsap } from "gsap";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // إذا كان المستخدم مسجل دخول بالفعل، إعادة توجيهه
  useEffect(() => {
    console.log("[Login] Checking if authenticated:", { isAuthenticated, authLoading });
    if (isAuthenticated && !authLoading) {
      console.log("[Login] User is authenticated, navigating to /categories");
      navigate("/categories", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

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
      console.log("[Login] Submitting with:", { username: formData.username });
      const result = await login(formData);
      console.log("[Login] Login result:", result);

      if (!result.success) {
        console.error("[Login] Login failed:", result.error);
        setError(result.error || "فشل تسجيل الدخول");
        setLoading(false);
      }
      // If successful, the useEffect will handle navigation
    } catch (err) {
      console.error("[Login] Unexpected error:", err);
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول");
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
            نظام الإدارة
          </h1>
          <p className="text-gray-600">المخزون والمبيعات</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="اسم المستخدم"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
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
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{" "}
            <Link
              to="/auth/register"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
