import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import { authService } from "../services/auth";
import { saveOrder, syncPendingOrders } from "../services/orderStorage";
import AuthModal from "./AuthModal";

import Button from "./Ui/Button";
import Input from "./Ui/Input";

const OrderConfirmation = ({ orderData, onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        await authService.init();
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
            // Получаем статистику синхронизации
            const stats = await getSyncStats();
            setSyncStatus(stats);
            setMessage('Заказ сохранен и отправлен на сервер!');
        } else {
            setMessage('Заказ сохранен локально. Авторизуйтесь для синхронизации с сервером.');
        }
    };

    const handleSyncOrders = async () => {
        if (!authService.isAuthenticated()) {
            setMessage('Требуется авторизация для синхронизации заказов');
            return;
        }

        setLoading(true);
        try {
            const syncedOrders = await syncPendingOrders();
            setMessage(`Синхронизировано ${syncedOrders.length} заказов`);
            
            const stats = await getSyncStats();
            setSyncStatus(stats);
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            setMessage('Ошибка синхронизации заказов');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "Неверная дата";
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatPhone = (phone) => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length !== 11 || !digits.startsWith("7")) return phone;
        const n = digits.substring(1);
        return `+7 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 8)}-${n.slice(8)}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">✅ Заказ оформлен!</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="p-4 bg-green-50 rounded-lg mb-4">
                        <p className="text-green-700 font-medium">{message}</p>
                    </div>
                    
                    <h3 className="font-semibold mb-3 text-lg">Детали заказа:</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Номер заказа:</span>
                            <span className="font-medium">{orderData.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Клиент:</span>
                            <span className="font-medium">{orderData.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Телефон:</span>
                            <span className="font-medium">{formatPhone(orderData.phone)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Адрес:</span>
                            <span className="font-medium">{orderData.address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Время доставки:</span>
                            <span className="font-medium">{orderData.deliveryTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Дата создания:</span>
                            <span className="font-medium">{formatDate(orderData.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Товаров:</span>
                            <span className="font-medium">{orderData.items.length} шт.</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600 font-bold">Итого:</span>
                            <span className="font-bold text-blue-600 text-lg">{orderData.total} ₽</span>
                        </div>
                    </div>
                </div>

                {/* Статус аутентификации */}
                <div className="mb-4 p-3 rounded-lg border">
                    {isAuthenticated ? (
                        <div className="text-green-700">
                            <p className="font-semibold">✅ Вы авторизованы</p>
                            <p className="text-sm">Заказ синхронизирован с сервером</p>
                            {syncStatus && (
                                <div className="mt-2 text-xs">
                                    <p>Локальных заказов: {syncStatus.userOrdersCount}</p>
                                    <p>Синхронизировано: {syncStatus.synced}</p>
                                    <p>Ожидают синхронизации: {syncStatus.pending}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-yellow-700">
                            <p className="font-semibold">⚠️ Вы не авторизованы</p>
                            <p className="text-sm">Заказ сохранился только локально</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {isAuthenticated && syncStatus && syncStatus.pending > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleSyncOrders}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Синхронизация...' : `Синхронизировать заказы (${syncStatus.pending} ожидают)`}
                        </Button>
                    )}
                    
                    <Button
                        variant="primary"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full"
                    >
                        Понятно, закрыть
                    </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Вы можете просмотреть свои заказы в разделе "Мои заказы"
                </p>
            </div>
        </div>
    );
};

export default OrderConfirmation;