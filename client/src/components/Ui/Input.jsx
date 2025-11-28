import React, { forwardRef } from "react";

const Input = forwardRef(({
    type = 'text',
    value,
    onChange,
    placeholder = '',
    variant = 'default',
    size = 'medium',
    disabled = false,
    className = '',
    icon,
    checked,    //** для чекбокса */
    name,      //** для чекбокса */
    label,      //** для лейбла: текст метки */
    labelClassName, //** для лейбла: стили лейбла */
    error,
    success,
    autoFocus = false,
    ...props }, ref
) => {

    const baseClasses = type === 'radio' || type === 'checkbox'
        ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
        : 'w-full border rounded-lg focus:outline-none transition-colors';

    const getVariant = () => {
        if (error) return "error";
        if (success) return "success";
        return variant;
    };

    const currentVariant = getVariant();

    const variantClasses = {
        default: type === 'radio' || type === 'checkbox'
            ? 'text-blue-600'
            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        error: 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent',
        success: 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent',
    };

    const sizeClasses = {
        small: type === 'radio' || type === 'checkbox' ? 'w-4 h-4' : 'px-3 py-1.5 text-sm',
        medium: type === 'radio' || type === 'checkbox' ? 'w-5 h-5' : 'px-4 py-2 text-base',
        large: type === 'radio' || type === 'checkbox' ? 'w-6 h-6' : 'px-5 py-3 text-lg',
    };

    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';

    const combinedClasses = [
        baseClasses,
        variantClasses[currentVariant],
        sizeClasses[size],
        disabledClasses,
        className,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ');
    // Генерация уникального id, если не передан
    const inputId = props.id || `input-${name || Math.random().toString(36).substr(2, 9)}`;

    if (type === "radio" || type === "checkbox") {
        return (
            <div className="flex items-center space-x-2">
                <input
                    type={type}
                    id={inputId}
                    name={name}
                    checked={checked}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={combinedClasses}
                    ref={ref}
                    autoFocus={autoFocus}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} ${labelClassName || ''}`}
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} ${labelClassName || ''}`}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={combinedClasses}
                    ref={ref}
                    autoFocus={autoFocus}
                    {...props}
                />
                {icon && (
                    <div className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 transform text-gray-500">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {success && !error && <p className="text-green-500 text-xs mt-1">{success}</p>}
        </div>
    );
}
);

Input.displayName = "Input"; // добавляем имя для отладки
export default Input;