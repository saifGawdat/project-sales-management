// مكون الحماية للمسارات - يمنع الوصول للمسارات المحمية بدون تسجيل الدخول
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./ui/Loading";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log("[ProtectedRoute] Checking auth:", { isAuthenticated, loading });

  if (loading) {
    console.log("[ProtectedRoute] Loading...");
    return <Loading text="جاري التحقق من المصادقة..." />;
  }

  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Not authenticated, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  console.log("[ProtectedRoute] Authenticated! Rendering children");
  return children;
};

export default ProtectedRoute;
