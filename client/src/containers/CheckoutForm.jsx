import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import Button from "../components/Ui/Button";
import Input from "../components/Ui/Input";
import { saveOrder, syncPendingOrders } from "../services/orderStorage";
import { authService } from "../services/auth";
import AuthModal from "../components/AuthModal"; 

const CheckoutForm = ({ onClose }) => {
    const dispatch = useDispatch();
    const { items, totalAmount } = useSelector((state) => state.cart);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        time: "",
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const nameRef = useRef();

    // CAPTCHA
    const [captchaText, setCaptchaText] = useState("");
    const [userCaptcha, setUserCaptcha] = useState("");
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const [showCaptchaError, setShowCaptchaError] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    // Аутентификация
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Проверяем статус аутентификации при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            await authService.init();
            setIsAuthenticated(authService.isAuthenticated());
        };
        checkAuth();
    }, []);

    // Генерация CAPTCHA
    useEffect(() => {
        generateCaptcha();
    }, [success]);

    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let text = "";
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setUserCaptcha("");
        setIsCaptchaValid(false);
        setShowCaptchaError(false);
    };

    // Валидация CAPTCHA
    useEffect(() => {
        const isValid = userCaptcha.length === 6 && userCaptcha.toUpperCase() === captchaText.toUpperCase();
        setIsCaptchaValid(isValid);
        setShowCaptchaError(!isValid && userCaptcha.length === 6);
    }, [userCaptcha, captchaText]);

    // Блокировка
    useEffect(() => {
        if (success) {
            setIsBlocked(true);
            const timer = setTimeout(() => {
                setIsBlocked(false);
                setSuccess(false);
            }, 120000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Автофокус
    useEffect(() => {
        if (nameRef.current) {
            nameRef.current.focus();
        }
    }, []);

    // Обработчик успешной аутентификации
    const handleAuthSuccess = async () => {
        setIsAuthenticated(true);
        // Синхронизируем неотправленные заказы после авторизации
        try {
            await syncPendingOrders();
        } catch (error) {
            console.warn('Ошибка синхронизации заказов:', error);
        }
    };

    // Форматирование телефона
    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, "");
        let formattedNumbers = numbers;
        if (numbers.startsWith("7") || numbers.startsWith("8")) {
            formattedNumbers = numbers.substring(1);
        }
        const limitedNumbers = formattedNumbers.substring(0, 10);

        if (limitedNumbers.length === 0) return "";
        if (limitedNumbers.length <= 3) return `+7 (${limitedNumbers}`;
        if (limitedNumbers.length <= 6) return `+7 (${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3)}`;
        if (limitedNumbers.length <= 8) return `+7 (${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3, 6)}-${limitedNumbers.substring(6)}`;
        return `+7 (${limitedNumbers.substring(0, 3)}) ${limitedNumbers.substring(3, 6)}-${limitedNumbers.substring(6, 8)}-${limitedNumbers.substring(8, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const input = e.target.value;
        const formattedPhone = formatPhone(input);
        setFormData({ ...formData, phone: formattedPhone });
        setTouched({ ...touched, phone: true });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") {
            handlePhoneChange(e);
        } else {
            setFormData({ ...formData, [name]: value });
            setTouched({ ...touched, [name]: true });
        }
    };

    const handleCaptchaChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        setUserCaptcha(value);
    };

    // Валидация в реальном времени
    useEffect(() => {
        const newErrors = {};

        if (touched.name && !formData.name.trim()) newErrors.name = "Имя обязательно";
        if (touched.address && !formData.address.trim()) newErrors.address = "Адрес обязателен";
        if (touched.phone && !formData.phone.trim()) newErrors.phone = "Телефон обязателен";
        if (touched.time && !formData.time) newErrors.time = "Время доставки обязательно";

        if (touched.phone && formData.phone.trim()) {
            const digits = formData.phone.replace(/\D/g, "");
            if (digits.length !== 11 || !digits.startsWith("7")) {
                newErrors.phone = "Введите корректный номер (+7 XXX XXX-XX-XX)";
            }
        }

        setErrors(newErrors);
    }, [formData, touched]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Имя обязательно";
        if (!formData.address.trim()) newErrors.address = "Адрес обязателен";
        if (!formData.phone.trim()) newErrors.phone = "Телефон обязателен";
        if (!formData.time) newErrors.time = "Время доставки обязательно";
        if (!isCaptchaValid) newErrors.captcha = "Неверная CAPTCHA";
        if (items.length === 0) newErrors.items = "Корзина пуста";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({
            name: true,
            address: true,
            phone: true,
            time: true,
        });

        if (!validateForm()) return;
        if (isBlocked || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const orderData = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                deliveryTime: formData.time,
                items: items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                total: totalAmount,
                status: "pending",
                createdAt: new Date().toISOString(),
            };

            await saveOrder(orderData);

            console.log("📦 Новый заказ:", orderData);
            setSuccess(true);
            dispatch(clearCart());

            setTimeout(() => onClose(), 3000);
        } catch (err) {
            console.error("Ошибка:", err);
            setErrors({ submit: "Не удалось оформить заказ. Попробуйте позже." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Экран успеха — с анимацией
    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                    className="bg-white rounded-lg max-w-md w-full p-8 text-center transform transition-all duration-500 ease-out scale-100 opacity-100"
                >
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold mb-2">Заказ оформлен!</h2>
                    <p className="text-gray-600 mb-4">Спасибо за покупку.</p>
                    {!isAuthenticated && (
                        <p className="text-sm text-yellow-600 mb-2">
                            Заказ сохранен локально. Авторизуйтесь для синхронизации.
                        </p>
                    )}
                    <p className="text-sm text-gray-500">Окно закроется через 3 секунды...</p>
                </div>
            </div>
        );
    }

    // Основная форма — с анимацией появления
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                    className="transform transition-all duration-300 ease-out opacity-0 translate-y-4 scale-95 animate-appear">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <form onSubmit={handleSubmit} className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Оформление заказа</h2>

                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Блок аутентификации */}
                            {!isAuthenticated && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800 mb-2">
                                        🔒 Авторизуйтесь, чтобы синхронизировать заказы между устройствами
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAuthModal(true)}
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        Войти или Зарегистрироваться
                                    </Button>
                                </div>
                            )}

                            {isAuthenticated && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-800 flex items-center">
                                        <span className="mr-2">✅</span>
                                        Вы авторизованы. Заказы будут синхронизированы с сервером.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    label="Имя *"
                                    placeholder="Введите ваше имя"
                                    error={errors.name}
                                    ref={nameRef}
                                    autoFocus
                                />

                                <Input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    label="Адрес *"
                                    placeholder="Улица, дом, квартира"
                                    error={errors.address}
                                />

                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    label="Телефон *"
                                    placeholder="+7 (999) 999-99-99"
                                    error={errors.phone}
                                />

                                <Input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    label="Время доставки *"
                                    error={errors.time}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Введите текст с картинки *
                                    </label>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div
                                            className="flex-1 bg-gray-100 text-2xl font-bold text-center py-2 px-4 rounded select-none"
                                            style={{ fontFamily: "monospace", letterSpacing: "2px" }}
                                        >
                                            {captchaText}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="captcha"
                                            size="captcha"
                                            onClick={generateCaptcha}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Input
                                        type="text"
                                        value={userCaptcha}
                                        onChange={handleCaptchaChange}
                                        placeholder="Введите 6 символов"
                                        maxLength={6}
                                        error={showCaptchaError ? "Неверный текст" : errors.captcha}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold">Итого:</span>
                                    <span className="text-lg font-bold">{totalAmount} ₽</span>
                                </div>

                                <div className="flex space-x-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        Назад
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Оформление..." : "Сделать заказ"}
                                    </Button>
                                </div>

                                {isBlocked && (
                                    <p className="text-sm text-gray-500 text-center mt-2">
                                        Подождите 2 минуты перед следующим заказом
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Модальное окно аутентификации */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </>
    );
};

export default CheckoutForm;