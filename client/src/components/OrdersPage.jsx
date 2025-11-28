import React, { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderStorage";
import Button from "./Ui/Button";


const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, pending, completed
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState("newest"); // newest, oldest, amount-high, amount-low
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const loadOrders = async () => {
            const savedOrders = await getAllOrders();
            setOrders(savedOrders);
            setLoading(false);
        };
        loadOrders();
    }, []);

    // Фильтрация и сортировка
    const filteredOrders = orders
        .filter(order => {
            if (filter === "all") return true;
            return order.status === filter;
        })
        .filter(order => {
            const query = searchQuery.toLowerCase();
            if (!query) return true;
            return (
                order.name.toLowerCase().includes(query) ||
                order.phone.includes(query) ||
                order.id.includes(query)
            );
        })
        .sort((a, b) => {
            switch (sort) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "amount-high":
                    return b.total - a.total;
                case "amount-low":
                    return a.total - b.total;
                default:
                    return 0;
            }
        });

    // Пагинация
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    // Сброс на первую страницу при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery, sort]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500 text-lg">Загрузка заказов...</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📦 Заказы</h1>
                <p className="text-gray-600 mt-1">Управление заказами клиентов</p>
            </div>

            {/* Поиск, фильтры, сортировка */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Поиск по имени, телефону, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {["all", "pending", "completed"].map(status => (
                            <Button
                                key={status}
                                variant={filter === status ? "primary" : "outline"}
                                size="small"
                                onClick={() => setFilter(status)}
                                className="capitalize px-3 py-1.5 text-sm"
                            >
                                {status === "all" && "Все"}
                                {status === "pending" && "В обработке"}
                                {status === "completed" && "Выполнены"}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Сортировать:</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="newest">Новые</option>
                        <option value="oldest">Старые</option>
                        <option value="amount-high">Сумма: по убыванию</option>
                        <option value="amount-low">Сумма: по возрастанию</option>
                    </select>
                </div>
            </div>

            {/* Список заказов */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">
                        {searchQuery ? `Ничего не найдено по запросу "${searchQuery}"` : "Нет заказов в выбранной категории."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {currentOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer border border-gray-200 overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                            Заказ #{order.id.slice(0, 6).toUpperCase()}
                                        </h3>
                                        <span
                                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap
                                                ${order.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {order.status === "pending" ? "В обработке" : "Выполнен"}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 font-medium text-sm mb-1 truncate">
                                        {order.name}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {formatPhone(order.phone)}
                                    </p>
                                    <p className="text-gray-500 text-xs mb-3">
                                        {formatDate(order.createdAt)}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-blue-600">
                                            {order.total} ₽
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {order.items.length} товар(ов)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="small"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2"
                            >
                                Назад
                            </Button>

                            <span className="text-sm text-gray-600">
                                Страница {currentPage} из {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="small"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2"
                            >
                                Вперёд
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Модальное окно — без изменений */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Заказ #{selectedOrder.id.slice(0, 6).toUpperCase()}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => setSelectedOrder(null)}
                                    aria-label="Закрыть"
                                    className="!p-1.5"
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-5 text-sm text-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-gray-500">Клиент</p>
                                        <p className="font-semibold">{selectedOrder.name}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">Телефон</p>
                                        <p>{formatPhone(selectedOrder.phone)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">Адрес</p>
                                        <p>{selectedOrder.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">Время доставки</p>
                                        <p>{selectedOrder.deliveryTime || "Не указано"}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">Дата</p>
                                        <p>{formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">Статус</p>
                                        <span
                                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full
                                                ${selectedOrder.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {selectedOrder.status === "pending" ? "В обработке" : "Выполнен"}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="font-medium text-gray-800 mb-2">Товары в заказе</p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                        {selectedOrder.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between py-1 text-sm border-b border-gray-100 last:border-0"
                                            >
                                                <span className="text-gray-700">
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium text-gray-800">
                                                    {item.price * item.quantity} ₽
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                                    <span>Итого:</span>
                                    <span className="text-blue-600">{selectedOrder.total} ₽</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                {selectedOrder.status === "pending" && (
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => {
                                            updateOrderStatus(selectedOrder.id, "completed").then(() => {
                                                const updated = { ...selectedOrder, status: "completed" };
                                                setSelectedOrder(updated);
                                                setOrders(prev =>
                                                    prev.map(o => (o.id === updated.id ? updated : o))
                                                );
                                            });
                                        }}
                                        className="px-4 py-2"
                                    >
                                        Отметить как выполнен
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2"
                                >
                                    Закрыть
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;