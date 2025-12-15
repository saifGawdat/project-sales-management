import { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import { authAPI } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // دالة للتحقق من حالة المصادقة
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // دالة تسجيل الدخول
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      const { token } = response.data;

      if (!token) {
        throw new Error("لم يتم استلام Token من الخادم");
      }

      localStorage.setItem("token", token);

      // جلب معلومات المستخدم باستخدام التوكن
      const userResponse = await authAPI.getCurrentUser();
      const userData = userResponse.data;

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "فشل تسجيل الدخول",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // دالة إنشاء حساب جديد
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "فشل إنشاء الحساب",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // دالة تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
