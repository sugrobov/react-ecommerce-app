import React, { useState } from "react";
import { authService } from "../services/auth";
import Button from "./Ui/Button";
import Input from "./Ui/Input";

const AuthModal = ({ onClose, onSuccess }) => {
       const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isForgotPassword) {
                await handleForgotPassword();
            } else if (isLogin) {
                await authService.login({
                    email: formData.email,
                    password: formData.password
                });
                setMessage('Успешный вход!');
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 1000);
            } else {
                // Валидация пароля
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Пароли не совпадают');
                }

                if (formData.password.length < 6) {
                    throw new Error('Пароль должен содержать минимум 6 символов');
                }

                await authService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });
                setMessage('Регистрация успешна!');
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при запросе сброса пароля');
            }

            const data = await response.json();
            setMessage(data.message || 'Инструкции по сбросу пароля отправлены на email');
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: ''
        });
        setError('');
        setMessage('');
    };

    const handleModeChange = (newIsLogin) => {
        setIsLogin(newIsLogin);
        setIsForgotPassword(false);
        resetForm();
    };

    const handleForgotPasswordClick = () => {
        setIsForgotPassword(true);
        resetForm();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {isForgotPassword ? 'Восстановление пароля' : (isLogin ? 'Вход' : 'Регистрация')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && !isForgotPassword && (
                        <>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                label="Имя"
                                placeholder="Введите ваше имя"
                                required
                                disabled={loading}
                            />
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                label="Телефон"
                                placeholder="+7 (999) 999-99-99"
                                required
                                disabled={loading}
                            />
                        </>
                    )}

                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        label="Email"
                        placeholder="Введите ваш email"
                        required
                        disabled={loading}
                    />

                    {!isForgotPassword && (
                        <>
                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                label="Пароль"
                                placeholder="Введите пароль"
                                required
                                disabled={loading}
                            />

                            {!isLogin && (
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    label="Подтвердите пароль"
                                    placeholder="Повторите пароль"
                                    required
                                    disabled={loading}
                                />
                            )}
                        </>
                    )}

                    <div className="flex space-x-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Загрузка...
                                </span>
                            ) : (
                                isForgotPassword ? 'Отправить' : (isLogin ? 'Войти' : 'Зарегистрироваться')
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-4 text-center space-y-2">
                    {!isForgotPassword ? (
                        <>
                            <button
                                onClick={() => handleModeChange(!isLogin)}
                                className="text-blue-600 hover:text-blue-800 text-sm block w-full"
                                disabled={loading}
                            >
                                {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                            </button>
                            <button
                                onClick={handleForgotPasswordClick}
                                className="text-blue-600 hover:text-blue-800 text-sm block w-full"
                                disabled={loading}
                            >
                                Забыли пароль?
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleModeChange(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            disabled={loading}
                        >
                            Назад к входу
                        </button>
                    )}
                </div>

                {/* Демо-данные для тестирования */}
                {process.env.NODE_ENV === 'development' && isLogin && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                        <p className="font-semibold mb-1">Демо-аккаунты:</p>
                        <p>test@test.com / password123</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthModal;