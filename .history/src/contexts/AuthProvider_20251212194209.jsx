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
      console.log("[AuthProvider] Login attempt with:", { username: credentials.username || credentials.name });
      
      const response = await authAPI.login(credentials);
      console.log("[AuthProvider] Login response:", response.status);
      
      const { token } = response.data;

      if (!token) {
        throw new Error("لم يتم استلام Token من الخادم");
      }

      console.log("[AuthProvider] Token received, storing...");
      localStorage.setItem("token", token);

      // جلب معلومات المستخدم باستخدام التوكن
      console.log("[AuthProvider] Fetching user data...");
      const userResponse = await authAPI.getCurrentUser();
      const userData = userResponse.data;
      console.log("[AuthProvider] User data fetched:", userData);

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      console.log("[AuthProvider] Login successful!");
      return { success: true };
    } catch (error) {
      console.error("[AuthProvider] Login error:", error.response?.data || error.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "فشل تسجيل الدخول";
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // دالة إنشاء حساب جديد
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      console.log("[AuthProvider] Register attempt with:", { name: userData.name, email: userData.email });
      
      const response = await authAPI.register(userData);
      console.log("[AuthProvider] Registration successful:", response.status);
      
      return { success: true };
    } catch (error) {
      console.error("[AuthProvider] Register error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "فشل إنشاء الحساب";
      
      return {
        success: false,
        error: errorMessage,
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
