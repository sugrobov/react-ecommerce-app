import localForage from 'localforage';
import { nanoid } from '@reduxjs/toolkit';
import { authService } from './auth';

const orderStorage = localForage.createInstance({
  name: 'AquaLand',
  storeName: 'orders'
});

// Отправка заказа на сервер
const sendOrderToServer = async (order) => {
  if (!authService.isAuthenticated()) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Синхронизация неотправленных заказов
export const syncPendingOrders = async () => {
  if (!authService.isAuthenticated()) return [];

  try {
    const orders = await getAllOrders();
    const pendingOrders = orders.filter(order => !order.synced);
    
    if (pendingOrders.length === 0) return [];

    const response = await fetch('/api/orders/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader()
      },
      body: JSON.stringify({ orders: pendingOrders })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { syncedOrders } = await response.json();
    
    // Обновляем локальные заказы
    const allOrders = await getAllOrders();
    const updatedOrders = allOrders.map(order => {
      const syncedOrder = syncedOrders.find(so => so.id === order.id);
      return syncedOrder ? { ...order, ...syncedOrder } : order;
    });
    
    await orderStorage.setItem('orders', updatedOrders);
    
    return syncedOrders;
  } catch (error) {
    console.warn('Failed to sync orders:', error);
    throw error;
  }
};

export const saveOrder = async (order) => {
  const newOrder = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    synced: false,
    ...order
  };

  try {
    // 1. Сохраняем локально
    const orders = await getAllOrders();
    orders.push(newOrder);
    await orderStorage.setItem('orders', orders);

    // 2. Пытаемся отправить на сервер если авторизованы
    if (authService.isAuthenticated()) {
      try {
        const serverOrder = await sendOrderToServer(newOrder);
        await updateOrderInStorage(newOrder.id, { ...newOrder, synced: true, syncedAt: new Date().toISOString() });
        return serverOrder;
      } catch (serverError) {
        console.warn('Order saved locally but not synced:', serverError);
      }
    }

    return newOrder;
  } catch (err) {
    console.error('Ошибка при сохранении заказа:', err);
    throw err;
  }
};

// Вспомогательная функция для обновления заказа
const updateOrderInStorage = async (orderId, updates) => {
  const orders = await getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    orders[orderIndex] = { ...orders[orderIndex], ...updates };
    await orderStorage.setItem('orders', orders);
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
