import localForage from 'localforage';
import { nanoid } from '@reduxjs/toolkit';
import { authService } from './auth';

const orderStorage = localForage.createInstance({
  name: 'AquaLand',
  storeName: 'orders'
});

// Флаг для предотвращения одновременных попыток синхронизации
let isSyncing = false;
// Очередь для повторных попыток
const retryQueue = [];
// Максимальное количество попыток
const MAX_RETRY_ATTEMPTS = 3;
// Задержка между попытками (в миллисекундах)
const RETRY_DELAY = 5000;

// Функция для безопасной отправки заказа на сервер
const sendOrderToServer = async (order, retryCount = 0) => {
  // Проверяем, не превышено ли максимальное количество попыток
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    console.warn(`Максимальное количество попыток отправки заказа ${order.id} достигнуто`);
    return null;
  }

  try {
    if (!authService.isAuthenticated()) {
      throw new Error('Not authenticated - требуется авторизация для отправки на сервер');
    }

    // Проверяем, принадлежит ли заказ текущему пользователю
    const currentUser = authService.user;
    if (!currentUser || !currentUser.id) {
      throw new Error('User information not available');
    }

    // Подготавливаем заказ для сервера (добавляем userId)
    const orderForServer = {
      ...order,
      userId: currentUser.id,
      // Удаляем временные поля, которые используются только локально
      synced: undefined,
      syncAttempts: undefined,
      // Сохраняем локальный ID для отслеживания
      localId: order.id
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader()
      },
      body: JSON.stringify(orderForServer),
      signal: AbortSignal.timeout(30000) // 30 секунд timeout
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }
      
      // Если это ошибка 401/403, возможно нужна повторная аутентификация
      if (response.status === 401 || response.status === 403) {
        try {
          // Пробуем обновить токен
          await authService.refreshToken();
          // Повторяем попытку с обновленным токеном
          return await sendOrderToServer(order, retryCount + 1);
        } catch (refreshError) {
          // Не удалось обновить токен, заказ остается локально
          throw new Error('Authentication failed - требуется повторная авторизация');
        }
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Добавляем serverId к результату
    return {
      ...result,
      localId: order.id // Сохраняем связь с локальным ID
    };
    
  } catch (error) {
    // Обрабатываем различные типы ошибок
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.warn(`Таймаут при отправке заказа ${order.id}, попытка ${retryCount + 1}`);
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn(`Сетевая ошибка при отправке заказа ${order.id}, попытка ${retryCount + 1}`);
    } else {
      console.warn(`Ошибка при отправке заказа ${order.id}:`, error.message);
    }

    // Если есть еще попытки, добавляем в очередь на повторную отправку
    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      const nextRetryDelay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      
      // Добавляем в очередь на повторную отправку
      retryQueue.push({
        order,
        retryCount: retryCount + 1,
        scheduledAt: Date.now() + nextRetryDelay
      });
      
      // Запускаем обработчик очереди, если он еще не запущен
      if (!isSyncing) {
        processRetryQueue();
      }
    }
    
    return null;
  }
};

// Фоновая обработка очереди повторных попыток
const processRetryQueue = async () => {
  if (isSyncing || retryQueue.length === 0) {
    return;
  }

  isSyncing = true;

  try {
    // Сортируем по времени отправки
    retryQueue.sort((a, b) => a.scheduledAt - b.scheduledAt);
    
    const now = Date.now();
    const readyToRetry = retryQueue.filter(item => item.scheduledAt <= now);

    for (const item of readyToRetry) {
      const index = retryQueue.indexOf(item);
      if (index > -1) {
        retryQueue.splice(index, 1);
        
        // Проверяем, авторизован ли пользователь перед отправкой
        if (!authService.isAuthenticated()) {
          console.warn('Пользователь не авторизован, пропускаем отправку заказа', item.order.id);
          continue;
        }
        
        // Отправляем заказ
        const result = await sendOrderToServer(item.order, item.retryCount);
        
        if (result) {
          // Обновляем локальный заказ
          await updateOrderInStorage(item.order.id, {
            ...item.order,
            synced: true,
            syncedAt: new Date().toISOString(),
            serverId: result.id, // ID с сервера
            userId: authService.user.id // ID пользователя
          });
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке очереди повторных попыток:', error);
  } finally {
    isSyncing = false;
    
    // Если в очереди еще есть элементы, планируем следующую обработку
    if (retryQueue.length > 0) {
      const nextItem = retryQueue.reduce((min, item) => 
        item.scheduledAt < min.scheduledAt ? item : min
      );
      
      const delay = Math.max(0, nextItem.scheduledAt - Date.now());
      setTimeout(processRetryQueue, delay);
    }
  }
};

// Синхронизация неотправленных заказов (только для авторизованных пользователей)
export const syncPendingOrders = async () => {
  if (isSyncing || !authService.isAuthenticated()) {
    console.log('Синхронизация невозможна: пользователь не авторизован или идет другая синхронизация');
    return [];
  }

  isSyncing = true;

  try {
    const orders = await getAllOrders();
    
    // Фильтруем заказы: только несинхронизированные, созданные без авторизации
    // или созданные текущим пользователем до авторизации
    const pendingOrders = orders.filter(order => {
      // Пропускаем уже синхронизированные
      if (order.synced) return false;
      
      // Если у заказа уже есть userId, проверяем, совпадает ли с текущим пользователем
      if (order.userId) {
        return order.userId === authService.user.id;
      }
      
      // Заказы без userId считаем "анонимными" и пробуем их синхронизировать
      // только если они не имеют другого userId
      return true;
    });
    
    if (pendingOrders.length === 0) {
      console.log('Нет заказов для синхронизации');
      return [];
    }

    console.log(`Начинаем синхронизацию ${pendingOrders.length} заказов для пользователя ${authService.user.email}`);

    // Используем Promise.allSettled для параллельной отправки с обработкой ошибок
    const syncPromises = pendingOrders.map(order => 
      sendOrderToServer(order, order.syncAttempts || 0).then(result => ({
        order,
        result,
        success: !!result
      })).catch(error => ({
        order,
        result: null,
        success: false,
        error
      }))
    );

    const results = await Promise.allSettled(syncPromises);

    // Обрабатываем результаты
    const syncedOrders = [];
    const failedOrders = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.result) {
        // Успешная отправка
        const updatedOrder = {
          ...result.value.order,
          synced: true,
          syncedAt: new Date().toISOString(),
          serverId: result.value.result.id,
          userId: authService.user.id,
          syncAttempts: (result.value.order.syncAttempts || 0) + 1
        };
        
        await updateOrderInStorage(result.value.order.id, updatedOrder);
        syncedOrders.push(updatedOrder);
      } else {
        // Неудачная отправка
        const order = result.value?.order || result.reason;
        const error = result.value?.error || result.reason;
        console.warn('Не удалось синхронизировать заказ:', order.id, error);
        
        // Обновляем счетчик попыток
        if (order && order.id) {
          await updateOrderInStorage(order.id, {
            ...order,
            syncAttempts: (order.syncAttempts || 0) + 1,
            lastSyncError: error?.message || 'Unknown error'
          });
        }
        failedOrders.push(order);
      }
    }

    console.log(`Синхронизировано: ${syncedOrders.length}, не удалось: ${failedOrders.length}`);

    return syncedOrders;
  } catch (error) {
    console.error('Ошибка при синхронизации заказов:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
};

// Автоматическая синхронизация при восстановлении соединения
const setupConnectionListener = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Соединение восстановлено, проверяем возможность синхронизации');
      // Проверяем авторизацию перед синхронизацией
      if (authService.isAuthenticated()) {
        syncPendingOrders().catch(error => 
          console.warn('Синхронизация при восстановлении соединения не удалась:', error)
        );
      }
    });
  }
};

// Инициализируем слушатель соединения
setupConnectionListener();

// Сохранение заказа (может быть вызвано без авторизации)
export const saveOrder = async (order) => {
  const newOrder = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    synced: false,
    syncAttempts: 0,
    // Если пользователь авторизован, сохраняем его ID
    userId: authService.isAuthenticated() ? authService.user.id : null,
    ...order
  };

  try {
    // 1. Сохраняем локально (это происходит мгновенно)
    const orders = await getAllOrders();
    orders.push(newOrder);
    await orderStorage.setItem('orders', orders);

    // 2. Если пользователь авторизован, запускаем фоновую отправку на сервер
    if (authService.isAuthenticated()) {
      console.log('Пользователь авторизован, запускаем фоновую отправку заказа');
      setTimeout(async () => {
        try {
          const serverOrder = await sendOrderToServer(newOrder, 0);
          
          if (serverOrder) {
            await updateOrderInStorage(newOrder.id, { 
              ...newOrder, 
              synced: true, 
              syncedAt: new Date().toISOString(),
              serverId: serverOrder.id,
              userId: authService.user.id
            });
            console.log('Заказ успешно отправлен на сервер:', newOrder.id);
          }
        } catch (serverError) {
          console.warn('Заказ сохранен локально, но не синхронизирован:', serverError.message);
        }
      }, 0); // Запускаем в следующем цикле event loop
    } else {
      console.log('Пользователь не авторизован, заказ сохранен только локально:', newOrder.id);
    }

    // 3. Возвращаем заказ клиенту немедленно
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
 * Если пользователь авторизован, показывает все заказы
 * Если не авторизован, показывает только заказы без userId или с userId=null
 */
export const getAllOrders = async () => {
    try {
        const orders = await orderStorage.getItem('orders');
        const allOrders = Array.isArray(orders) ? orders : [];
        
        // Если пользователь авторизован, показываем все его заказы
        // плюс "анонимные" заказы (без userId)
        if (authService.isAuthenticated()) {
          const userId = authService.user.id;
          return allOrders.filter(order => 
            !order.userId || order.userId === userId
          );
        } else {
          // Показываем только "анонимные" заказы
          return allOrders.filter(order => !order.userId);
        }
    } catch (err) {
        console.error('Ошибка загрузки заказов:', err);
        return [];
    }
};

/**
 * Находит заказ по его уникальному идентификатору
 * Проверяет права доступа
 */
export const getOrderById = async (id) => {
    const orders = await getAllOrders();
    return orders.find(order => order.id === id);
};

/**
 * Полностью очищает хранилище заказов
 */
export const clearOrders = async () => {
    await orderStorage.removeItem('orders');
};

/**
 * Получает заказы по статусу
 */
export const getOrdersByStatus = async (status) => {
    const orders = await getAllOrders();
    return orders.filter(order => order.status === status);
};

/**
 * Обновляет статус существующего заказа
 * Если заказ уже синхронизирован, пытается обновить на сервере
 */
export const updateOrderStatus = async (id, newStatus) => {
    try {
        const orders = await getAllOrders();
        const orderIndex = orders.findIndex(order => order.id === id);
        
        if (orderIndex === -1) {
            console.warn(`Заказ с ID ${id} не найден`);
            return undefined;
        }
        
        const updatedOrder = {
            ...orders[orderIndex],
            status: newStatus,
            updatedAt: new Date().toISOString()
        };
        
        orders[orderIndex] = updatedOrder;
        await orderStorage.setItem('orders', orders);
        
        // Если заказ уже синхронизирован и пользователь авторизован,
        // пытаемся обновить статус на сервере
        if (updatedOrder.synced && authService.isAuthenticated()) {
          setTimeout(async () => {
            try {
              await fetch(`/api/orders/${updatedOrder.serverId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  ...authService.getAuthHeader()
                },
                body: JSON.stringify({ status: newStatus })
              });
            } catch (error) {
              console.warn('Не удалось обновить статус заказа на сервере:', error);
            }
          }, 0);
        }
        
        return updatedOrder;
    } catch (err) {
        console.error('Ошибка обновления заказа:', err);
        throw err;
    }
};

/**
 * Получает статистику по синхронизации заказов
 */
export const getSyncStats = async () => {
  const allOrders = await orderStorage.getItem('orders');
  const orders = Array.isArray(allOrders) ? allOrders : [];
  
  const total = orders.length;
  const synced = orders.filter(order => order.synced).length;
  const pending = total - synced;
  const failed = orders.filter(order => 
    !order.synced && (order.syncAttempts || 0) >= MAX_RETRY_ATTEMPTS
  ).length;
  
  const userOrders = authService.isAuthenticated() 
    ? orders.filter(order => order.userId === authService.user.id)
    : orders.filter(order => !order.userId);

  return {
    total,
    synced,
    pending,
    failed,
    userOrdersCount: userOrders.length,
    retryQueueLength: retryQueue.length,
    isSyncing,
    isAuthenticated: authService.isAuthenticated()
  };
};

/**
 * Принудительная синхронизация всех несинхронизированных заказов
 * Только для авторизованных пользователей
 */
export const forceSyncOrders = async () => {
  if (!authService.isAuthenticated()) {
    throw new Error('Требуется авторизация для синхронизации заказов');
  }
  
  console.log('Запуск принудительной синхронизации заказов для пользователя:', authService.user.email);
  return await syncPendingOrders();
};

/**
 * Объединяет локальные заказы с заказами с сервера
 * Вызывается после успешной авторизации
 */
export const mergeOrdersOnAuth = async () => {
  if (!authService.isAuthenticated()) {
    return;
  }
  
  try {
    console.log('Объединение заказов после авторизации');
    
    // 1. Получаем локальные заказы
    const localOrders = await orderStorage.getItem('orders');
    const allLocalOrders = Array.isArray(localOrders) ? localOrders : [];
    
    // 2. Получаем заказы с сервера
    const response = await fetch('/api/orders');
    
    if (response.ok) {
      const serverData = await response.json();
      const serverOrders = serverData.orders || [];
      
      // 3. Объединяем заказы
      const mergedOrders = [...allLocalOrders];
      
      serverOrders.forEach(serverOrder => {
        // Ищем локальный заказ с таким же serverId
        const existingIndex = mergedOrders.findIndex(o => o.serverId === serverOrder.id);
        
        if (existingIndex !== -1) {
          // Обновляем существующий заказ
          mergedOrders[existingIndex] = {
            ...mergedOrders[existingIndex],
            ...serverOrder,
            synced: true,
            userId: authService.user.id
          };
        } else {
          // Добавляем новый заказ с сервера
          mergedOrders.push({
            ...serverOrder,
            id: nanoid(), // Генерируем уникальный ID
            synced: true,
            userId: authService.user.id,
            serverId: serverOrder.id
          });
        }
      });
      
      // 4. Обновляем локальное хранилище
      await orderStorage.setItem('orders', mergedOrders);
      
      // 5. Запускаем синхронизацию локальных заказов
      const synced = await syncPendingOrders();
      console.log('Объединение заказов завершено');
      
      return synced;
      
    }
  } catch (error) {
    console.warn('Ошибка при объединении заказов:', error);
    // В случае ошибки просто запускаем синхронизацию локальных заказов
     const synced = await syncPendingOrders();
    return synced;
  }
};
