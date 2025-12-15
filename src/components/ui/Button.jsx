// مكون الزر - مكون قابل لإعادة الاستخدام للأزرار
import { forwardRef } from 'react';

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }, ref) => {
    // تحديد أنماط الزر حسب النوع والحجم
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`
          ${variants[variant]} 
          ${sizes[size]} 
          rounded-lg 
          font-medium 
          transition-all 
          duration-200 
          disabled:opacity-50 
          disabled:cursor-not-allowed
          focus:outline-none 
          focus:ring-2 
          focus:ring-offset-2 
          focus:ring-blue-500
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

