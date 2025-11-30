import localForage from 'localforage';
import { nanoid } from '@reduxjs/toolkit';

/**
 * LocalForage instance для хранения заказов
 * Использует IndexedDB или WebSQL в зависимости от поддержки браузером
 */
const orderStorage = localForage.createInstance({
    name: 'AquaLand',
    storeName: 'orders'
});

/**
 * Сохраняет новый заказ в локальное хранилище и (опционально) на сервер
 * @param {Object} order - Объект заказа для сохранения
 * @returns {Promise<Object>} Сохраненный заказ с добавленными id и timestamp
 */

export const saveOrder = async (order) => {

        const newOrder = {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...order
    };

    try {
        // 1. Сначала сохраняем локально 
        const orders = await getAllOrders();
        orders.push(newOrder);
        await orderStorage.setItem('orders', orders);

        // 2. Пытаемся отправить на сервер (если есть API)
        await sendOrderToServer(newOrder).catch((err) => {
            console.warn('Заказ сохранён локально, но не отправлен на сервер (оффлайн || отсутствует токен)', err);
            // дописать
        });

        return newOrder;
    } catch (err) {
        console.error('Ошибка при сохранении заказа:', err);
        throw err;
    }
};

// 2. Функция для отправки заказа на сервер
const sendOrderToServer = async (order) => {
    const token = localStorage.getItem('authToken');
    if (!token) return; // Нет токена

    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(order)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
};

/**
 * Получает все сохраненные заказы из локального хранилища
 * @returns {Promise<Array>} Массив всех заказов или пустой массив, если заказов нет
 * @example
 * const orders = await getAllOrders();
 * // Возвращает: [{id: '123', name: 'Иван', ...}, ...]
 */
export const getAllOrders = async () => {
    try {
        const orders = await orderStorage.getItem('orders');
        return Array.isArray(orders) ? orders : [];
    } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
        return [];
    }
};

/**
 * Находит заказ по его уникальному идентификатору
 * @param {string} id - Уникальный идентификатор заказа
 * @returns {Promise<Object|undefined>} Найденный заказ или undefined, если не найден
 * @example
 * const order = await getOrderById('abc123');
 * // Возвращает: {id: 'abc123', name: 'Иван', ...} или undefined
 */
export const getOrderById = async (id) => {
    const orders = await getAllOrders();
    return orders.find(order => order.id === id);
};

/**
 * Полностью очищает хранилище заказов
 * Удаляет все сохраненные заказы
 * @returns {Promise<void>}
 * @example
 * await clearOrders(); // Все заказы будут удалены
 */
export const clearOrders = async () => {
    await orderStorage.removeItem('orders');
};

/**
 * Получает заказы по статусу
 * @param {string} status - Статус заказа для фильтрации
 * @returns {Promise<Array>} Массив заказов с указанным статусом
 * @example
 * const pendingOrders = await getOrdersByStatus('pending');
 */
export const getOrdersByStatus = async (status) => {
    const orders = await getAllOrders();
    return orders.filter(order => order.status === status);
};

/**
 * Обновляет статус существующего заказа
 * @param {string} id - ID заказа для обновления
 * @param {string} newStatus - Новый статус заказа
 * @returns {Promise<Object|undefined>} Обновленный заказ или undefined, если заказ не найден
 * @example
 * const updatedOrder = await updateOrderStatus('abc123', 'completed');
 */
export const updateOrderStatus = async (id, newStatus) => {
    try {
        const orders = await getAllOrders();
        const orderIndex = orders.findIndex(order => order.id === id);
        
        if (orderIndex === -1) {
            console.warn(`Заказ с ID ${id} не найден`);
            return undefined;
        }
        
        orders[orderIndex] = {
            ...orders[orderIndex],
            status: newStatus,
            updatedAt: new Date().toISOString()
        };
        
        await orderStorage.setItem('orders', orders);
        return orders[orderIndex];
    } catch (err) {
        console.error('Ошибка обновления заказа:', err);
        throw err;
    }
};