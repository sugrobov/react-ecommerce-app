import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Проверка секретных ключей
if (!process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET.includes('your-secret-key')) {
  console.warn('WARNING: Using default ACCESS_TOKEN_SECRET. In production, set a secure secret in .env file');
}

if (!process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.includes('your-secret-key')) {
  console.warn('WARNING: Using default REFRESH_TOKEN_SECRET. In production, set a secure secret in .env file');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Временное хранилище (в продакшене заменим на БД)
const users = new Map();
const refreshTokens = new Map();
const passwordResetTokens = new Map();
const ordersDB = new Map(); // Хранилище заказов

const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:5173'] 
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Логирование
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (users.has(email)) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      phone,
      createdAt: new Date().toISOString()
    };

    users.set(email, user);

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
      { expiresIn: '7d' }
    );

    refreshTokens.set(refreshToken, user.id);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
      { expiresIn: '7d' }
    );

    refreshTokens.set(refreshToken, user.id);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление токена
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: 'Неверный refresh token' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });

    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  });
});

// Запрос сброса пароля
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = users.get(email);

  if (!user) {
    return res.json({ message: 'Если пользователь существует, инструкции отправлены на email' });
  }

  const resetToken = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000);

  passwordResetTokens.set(resetToken, {
    userId: user.id,
    expiresAt
  });

  console.log(`Reset token for ${email}: ${resetToken}`);

  res.json({
    message: 'Инструкции по сбросу пароля отправлены на email',
    resetToken
  });
});

// Сброс пароля
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const resetData = passwordResetTokens.get(token);

  if (!resetData || resetData.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Неверный или просроченный токен' });
  }

  const user = Array.from(users.values()).find(u => u.id === resetData.userId);
  if (!user) {
    return res.status(400).json({ error: 'Пользователь не найден' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  users.set(user.email, user);
  passwordResetTokens.delete(token);

  res.json({ message: 'Пароль успешно изменен' });
});

// Получение заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = ordersDB.get(req.user.userId) || [];
  res.json({ orders: userOrders });
});

// Создание заказа с проверкой уникальности ID
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { id: clientOrderId, localId, ...orderData } = req.body;
    const userOrders = ordersDB.get(req.user.userId) || [];

    // Проверка обязательных полей
    const requiredFields = ['products', 'totalAmount'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({
          error: `Отсутствует обязательное поле: ${field}`
        });
      }
    }

    if (clientOrderId) {
      const existingOrder = userOrders.find(o => o.id === clientOrderId);
      if (existingOrder) {
        return res.status(409).json({
          error: 'Заказ с таким ID уже существует',
          existingOrder
        });
      }
    }

    const order = {
      id: clientOrderId || uuidv4(),
      localId: localId || null,
      userId: req.user.userId,
      ...orderData,
      synced: true,
      syncedAt: new Date().toISOString(),
      serverCreatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    userOrders.push(order);
    ordersDB.set(req.user.userId, userOrders);

    console.log('Order saved to server for user:', req.user.userId, order);
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Эндпоинт для очистки дубликатов заказов
app.post('/api/orders/cleanup', authenticateToken, (req, res) => {
  try {
    const userOrders = ordersDB.get(req.user.userId) || [];

    const uniqueOrders = [];
    const seenIds = new Set();

    for (const order of userOrders) {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id);
        uniqueOrders.push(order);
      }
    }

    ordersDB.set(req.user.userId, uniqueOrders);

    res.json({
      success: true,
      removedDuplicates: userOrders.length - uniqueOrders.length,
      totalOrders: uniqueOrders.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Ошибка очистки заказов' });
  }
});

// Получение конкретного заказа
app.get('/api/orders/:orderId', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const userOrders = ordersDB.get(req.user.userId) || [];
    const order = userOrders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Ошибка получения заказа' });
  }
});

// Обновление статуса заказа
app.patch('/api/orders/:orderId/status', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Неверный статус заказа',
        validStatuses
      });
    }

    const userOrders = ordersDB.get(req.user.userId) || [];
    const orderIndex = userOrders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    userOrders[orderIndex] = {
      ...userOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
      synced: true,
      syncedAt: new Date().toISOString()
    };

    ordersDB.set(req.user.userId, userOrders);

    console.log(`Order ${orderId} status updated to ${status} for user ${req.user.userId}`);
    res.json(userOrders[orderIndex]);

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Ошибка обновления статуса заказа' });
  }
});

// Массовая синхронизация заказов с обработкой конфликтов (ИСПРАВЛЕННАЯ ВЕРСИЯ)
app.post('/api/orders/sync', authenticateToken, (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Ожидается массив заказов' });
    }

    if (!ordersDB.has(req.user.userId)) {
      ordersDB.set(req.user.userId, []);
    }

    const userOrders = ordersDB.get(req.user.userId);
    const syncedOrders = [];

    const conflicts = [];
    const now = new Date().toISOString();

    for (const localOrder of orders) {
      const { id: clientId, localId: clientLocalId, ...orderData } = localOrder;

      // 1. Ищем существующий заказ
      let existingIndex = -1;
      let existingOrder = null;

      // Сначала ищем по clientId (если он есть)
      if (clientId) {
        existingIndex = userOrders.findIndex(o => o.id === clientId);
      }

      // Если не нашли по clientId, ищем по clientLocalId
      if (existingIndex === -1 && clientLocalId) {
        existingIndex = userOrders.findIndex(o => o.localId === clientLocalId);
      }

      // Если заказ найден
      if (existingIndex !== -1) {
        existingOrder = userOrders[existingIndex];

        // Проверяем конфликт
        const hasConflict = existingOrder.updatedAt &&
          localOrder.updatedAt &&
          existingOrder.updatedAt !== localOrder.updatedAt &&
          new Date(existingOrder.updatedAt) > new Date(localOrder.updatedAt);

        if (hasConflict) {
          // Регистрируем конфликт
          conflicts.push({
            serverOrder: existingOrder,
            clientOrder: localOrder,
            resolved: false,
            conflictAt: now
          });

          // Обновляем только syncedAt у существующего заказа
          userOrders[existingIndex] = {
            ...existingOrder,
            synced: true,
            syncedAt: now
          };

          syncedOrders.push(userOrders[existingIndex]);
          continue;
        }

        // Обновляем существующий заказ (нет конфликта или клиентская версия новее)
        const updatedOrder = {
          ...existingOrder,
          ...orderData,
          localId: clientLocalId !== undefined ? clientLocalId : existingOrder.localId,
          synced: true,
          syncedAt: now,
          updatedAt: now
        };

        userOrders[existingIndex] = updatedOrder;
        syncedOrders.push(updatedOrder);

      } else {
        // Создаем новый заказ
        const newId = clientId || uuidv4();
        const newOrder = {
          id: newId,
          localId: clientLocalId || null,
          userId: req.user.userId,
          ...orderData,
          synced: true,
          syncedAt: now,
          serverCreatedAt: now,
          createdAt: now,
          updatedAt: now
        };

        userOrders.push(newOrder);
        syncedOrders.push(newOrder);
      }
    }

    // Сохраняем обратно
    ordersDB.set(req.user.userId, userOrders);

    console.log(`Synced ${syncedOrders.length} orders for user ${req.user.userId}, conflicts: ${conflicts.length}`);

    res.json({
      success: true,
      syncedOrders,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      stats: {
        totalSynced: syncedOrders.length,
        conflicts: conflicts.length,
        serverTotal: userOrders.length
      },
      message: `Синхронизировано ${syncedOrders.length} заказов${conflicts.length > 0 ? ` (${conflicts.length} конфликтов)` : ''}`
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Ошибка синхронизации заказов' });
  }
});

// Тестовый endpoint для проверки аутентификации
app.get('/api/auth/test', authenticateToken, (req, res) => {
  res.json({
    message: 'Аутентификация работает!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Endpoint для проверки сервера
app.get('/api/test', (req, res) => {
  res.json({
    status: 'Server is running',
    usersCount: users.size,
    ordersCount: Array.from(ordersDB.values()).flat().length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    usersCount: users.size,
    ordersCount: Array.from(ordersDB.values()).flat().length
  });
});



// Endpoint для просмотра всех пользователей
app.get('/api/debug/users', (req, res) => {
  const usersArray = Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt
  }));
  res.json({ users: usersArray });
});

// Endpoint для просмотра всех заказов
app.get('/api/debug/orders', (req, res) => {
  const allOrders = [];
  for (const [userId, orders] of ordersDB.entries()) {
    allOrders.push(...orders.map(order => ({ ...order, userId })));
  }
  res.json({ orders: allOrders });
});

// ============================================
// ВРЕМЕННЫЕ ЭНДПОИНТЫ ДЛЯ ФРОНТЕНДА (магазин)
// ============================================

// Категории товаров
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Электроника', slug: 'electronics' },
    { id: 2, name: 'Одежда', slug: 'clothing' },
    { id: 3, name: 'Книги', slug: 'books' },
    { id: 4, name: 'Дом и сад', slug: 'home-garden' },
    { id: 5, name: 'Спорт', slug: 'sports' },
    { id: 6, name: 'Красота', slug: 'beauty' }
  ]);
});

// Товары с фильтрацией
app.get('/api/products', (req, res) => {
  const { category_id, search, limit = 20, offset = 0 } = req.query;
  
  // Моковые товары
  const mockProducts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Товар ${i + 1}`,
    description: `Описание товара ${i + 1}. Это качественный продукт с отличными характеристиками.`,
    category_id: (i % 6) + 1,
    rating: (Math.random() * 5).toFixed(1),
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
  }));

  let filteredProducts = mockProducts;

  // Фильтрация по категории
  if (category_id) {
    const catId = parseInt(category_id);
    filteredProducts = filteredProducts.filter(p => p.category_id === catId);
  }

  // Поиск по названию и описанию
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  // Пагинация
  const start = parseInt(offset);
  const end = start + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(start, end);

  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    has_more: end < filteredProducts.length
  });
});

// Получение конкретного товара
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  // Моковые данные товара
  const product = {
    id: parseInt(id),
    name: `Товар ${id}`,
    description: `Подробное описание товара ${id}. Это качественный продукт с отличными характеристиками, подходящий для повседневного использования.`,
    category_id: (parseInt(id) % 6) + 1,
    specifications: {
      material: 'Высококачественные материалы',
      weight: '1.2 кг',
      dimensions: '30x20x10 см',
      warranty: '12 месяцев'
    },
    created_at: new Date().toISOString()
  };

  if (id > 100) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(product);
});

// Изображения товаров
app.get('/api/product-images', (req, res) => {
  const { filter } = req.query;
  let productIds = [];

  if (filter) {
    try {
      const filters = JSON.parse(filter);
      productIds = filters.product_id || [];
    } catch (e) {
      console.error('Error parsing filter:', e);
    }
  }

  // Преобразуем строки в числа
  const numericIds = productIds.map(id => parseInt(id));

  // Моковые изображения
  const images = [];
  numericIds.forEach(productId => {
    // Добавляем 1-3 изображения для каждого товара
    const count = (productId % 3) + 1;
    for (let i = 1; i <= count; i++) {
      images.push({
        id: productId * 10 + i,
        product_id: productId,
        image_url: `https://picsum.photos/seed/product${productId}_${i}/600/400`,
        is_main: i === 1,
        order: i
      });
    }
  });

  res.json(images);
});

// Вариации товаров (цены, размеры, цвета)
app.get('/api/product-variations', (req, res) => {
  const { filter } = req.query;
  let productIds = [];

  if (filter) {
    try {
      const filters = JSON.parse(filter);
      productIds = filters.product_id || [];
    } catch (e) {
      console.error('Error parsing filter:', e);
    }
  }

  const numericIds = productIds.map(id => parseInt(id));

  // Моковые вариации
  const variations = numericIds.map(productId => ({
    id: productId,
    product_id: productId,
    sku: `SKU-${productId.toString().padStart(6, '0')}`,
    price: (Math.random() * 5000 + 100).toFixed(2),
    old_price: Math.random() > 0.7 ? (Math.random() * 6000 + 150).toFixed(2) : null,
    stock_quantity: Math.floor(Math.random() * 100),
    color: ['Красный', 'Синий', 'Черный', 'Белый'][productId % 4],
    size: ['S', 'M', 'L', 'XL'][productId % 4]
  }));

  res.json(variations);
});

// Поиск товаров (расширенный)
app.get('/api/products/search', (req, res) => {
  const { q, category, min_price, max_price, sort = 'popular' } = req.query;

  // Моковые результаты поиска
  const mockResults = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1000,
    name: q ? `Результат поиска "${q}" ${i + 1}` : `Товар ${i + 1}`,
    description: `Описание для поискового результата ${i + 1}`,
    category_id: (i % 6) + 1,
    price: (Math.random() * 5000 + 100).toFixed(2),
    image_url: `https://picsum.photos/seed/search${i}/300/200`,
    rating: (Math.random() * 5).toFixed(1),
    review_count: Math.floor(Math.random() * 100)
  }));

  let filtered = mockResults;

  // Применяем фильтры
  if (category) {
    const catId = parseInt(category);
    filtered = filtered.filter(p => p.category_id === catId);
  }

  if (min_price) {
    const min = parseFloat(min_price);
    filtered = filtered.filter(p => parseFloat(p.price) >= min);
  }

  if (max_price) {
    const max = parseFloat(max_price);
    filtered = filtered.filter(p => parseFloat(p.price) <= max);
  }

  // Сортировка
  if (sort === 'price_asc') {
    filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }

  res.json({
    results: filtered,
    total: filtered.length,
    query: q,
    filters_applied: {
      category,
      price_range: min_price || max_price ? `${min_price || '0'}-${max_price || '∞'}` : null
    }
  });
});

// ============================================
// КОНЕЦ ВРЕМЕННЫХ ЭНДПОИНТОВ
// ============================================

// Middleware для обработки 404 ошибок
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Middleware для обработки ошибок
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Создание тестового пользователя при запуске сервера
const createTestUser = async () => {
  const testEmail = 'test@test.com';

  if (!users.has(testEmail)) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = {
      id: uuidv4(),
      email: testEmail,
      password: hashedPassword,
      name: 'Тестовый пользователь',
      phone: '+79991234567',
      createdAt: new Date().toISOString()
    };

    users.set(testEmail, testUser);
    console.log('✅ Тестовый пользователь создан:', testEmail);
    console.log('🔑 Пароль: password123');
  }
};

// Вызов функции создания тестового пользователя
createTestUser();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log('Эндпоинты:');
  console.log(`  - POST /api/auth/login`);
  console.log(`  - POST /api/orders/sync (массовая синхронизация)`);
  console.log(`  - POST /api/orders/cleanup (очистка дубликатов)`);
});