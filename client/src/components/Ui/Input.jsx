import React from "react";

const Input = ({
    type = 'text',
    value,
    onChange,
    placeholder = '',
    variant = 'default',
    size = 'medium',
    disabled = false,
    className = '',
    icon,
    ...props
}) => {

    const baseClasses = 'w-full border rounded-lg focus:outline-none transition-colors';

    const variantClasses = {
        default: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        error: 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent',
        success: 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent',
    };

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-5 py-3 text-lg',
    };

    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';

    const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `.trim();

    return (
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={combinedClasses}
                {...props}
            />
            {icon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {icon}
                </div>
            )}
        </div>
    );

}

export default Input;