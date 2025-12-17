// الملف الرئيسي للتطبيق - يحتوي على توجيهات React Router
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";

// صفحات المصادقة
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// صفحات التطبيق
import Categories from "./pages/Categories/Categories";
import ProductTypes from "./pages/ProductTypes/ProductTypes";
import Products from "./pages/Products/Products";
import Sales from "./pages/Sales/Sales";
import Expenses from "./pages/Expenses/Expenses";
import ProfitSummary from "./pages/Profit/ProfitSummary";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* المسارات المحمية - تتطلب تسجيل الدخول */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* إعادة التوجيه الافتراضية إلى الفئات */}
            <Route index element={<Navigate to="/categories" replace />} />

            {/* صفحات التطبيق */}
            <Route path="categories" element={<Categories />} />
            <Route path="product-types" element={<ProductTypes />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="profit" element={<ProfitSummary />} />
          </Route>

          {/* إعادة التوجيه للمسارات غير المعرفة */}
          <Route path="*" element={<Navigate to="/categories" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
