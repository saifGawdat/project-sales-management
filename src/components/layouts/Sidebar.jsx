// مكون الشريط الجانبي - قائمة التنقل الرئيسية
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  // قائمة الروابط في الشريط الجانبي
  const menuItems = [
    { path: "/categories", label: "الفئات", icon: "📁" },
    { path: "/product-types", label: "أنواع المنتجات", icon: "🏷️" },
    { path: "/products", label: "المنتجات", icon: "📦" },
    { path: "/warehouse", label: "المستودع", icon: "🏭" },
    { path: "/cars", label: "السيارات", icon: "🚗" },
    { path: "/sales", label: "المبيعات", icon: "💰" },
    { path: "/expenses", label: "المصروفات", icon: "💸" },
    { path: "/profit", label: "ملخص الأرباح", icon: "📊" },
  ];

  return (
    <>
      {/* Overlay للجوال */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          lg:static lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* العنوان */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">نظام الإدارة</h1>
            <p className="text-sm text-gray-400 mt-1">المخزون والمبيعات</p>
          </div>

          {/* قائمة التنقل */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* زر تسجيل الخروج */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            >
              <span>🚪</span>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
