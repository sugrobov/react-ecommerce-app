import React from "react";

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    className = '',
    badge,  //** для бейджа */
    ...props
}) => {

    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative';

    const variantClasses = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
        product: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-200',
        captcha: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:ring-blue-500 border-0 shadow-none', // Для CAPTCHA
    };

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
        xlarge: 'px-8 py-4 text-xl font-bold w-full',
        captcha: 'p-2 text-sm', // Для CAPTCHA
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `.trim();

  // обработка CAPTCHA
      if (variant === 'captcha') {
        return (
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={combinedClasses}
                aria-label="Обновить CAPTCHA"
                {...props}
            >
                <span className="flex items-center justify-center">
                    <span className="text-base">🔄</span>
                    <span className="ml-1 hidden sm:inline">Обновить</span>
                </span>
            </button>
        );
    }

    return (

        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClasses}
            {...props}
        >
            {children}
            {/* Бейдж для отображения количества */}
            {badge !== undefined && badge !== null && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 transform scale-100">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </button>
    );
}

export default Button;