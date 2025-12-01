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
const PORT = process.env.PORT || 3001;

// Временное хранилище (в продакшене заменим на БД)
const users = new Map();
const refreshTokens = new Map();
const passwordResetTokens = new Map();
const ordersDB = new Map(); // Хранилище заказов

app.use(cors({
  origin: 'http://localhost:3000', // URL фронтенда
  credentials: true
}));
app.use(express.json());

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
    // Для безопасности не сообщаем, что пользователь не существует
    return res.json({ message: 'Если пользователь существует, инструкции отправлены на email' });
  }

  const resetToken = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000); // 1 час

  passwordResetTokens.set(resetToken, {
    userId: user.id,
    expiresAt
  });

  // В реальном приложении отправить email
  console.log(`Reset token for ${email}: ${resetToken}`);

  res.json({
    message: 'Инструкции по сбросу пароля отправлены на email',
    resetToken // Только для разработки
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

// Создание заказа
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const order = {
      id: uuidv4(),
      userId: req.user.userId,
      ...req.body,
      synced: true,
      syncedAt: new Date().toISOString(),
      serverCreatedAt: new Date().toISOString()
    };

    // Сохраняем заказ в общей базе
    if (!ordersDB.has(req.user.userId)) {
      ordersDB.set(req.user.userId, []);
    }
    ordersDB.get(req.user.userId).push(order);

    console.log('Order saved to server for user:', req.user.userId, order);

    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Синхронизация локальных заказов
app.post('/api/orders/sync', authenticateToken, async (req, res) => {
  try {
    const { orders } = req.body;
    const syncedOrders = [];

    // Инициализируем хранилище для пользователя если нужно
    if (!ordersDB.has(req.user.userId)) {
      ordersDB.set(req.user.userId, []);
    }

    for (const localOrder of orders) {
      const syncedOrder = {
        ...localOrder,
        id: localOrder.id || uuidv4(),
        userId: req.user.userId,
        synced: true,
        syncedAt: new Date().toISOString(),
        serverSyncedAt: new Date().toISOString()
      };

      // Добавляем заказ в хранилище
      ordersDB.get(req.user.userId).push(syncedOrder);
      syncedOrders.push(syncedOrder);
    }

    console.log(`Synced ${syncedOrders.length} orders for user:`, req.user.userId);
    res.json({ syncedOrders });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Ошибка синхронизации' });
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

// Endpoint для просмотра всех пользователей (только для разработки)
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

// Endpoint для просмотра всех заказов (только для разработки)
app.get('/api/debug/orders', (req, res) => {
  const allOrders = [];
  for (const [userId, orders] of ordersDB.entries()) {
    allOrders.push(...orders.map(order => ({ ...order, userId })));
  }
  res.json({ orders: allOrders });
});

// Middleware для обработки 404 ошибок
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Middleware для обработки ошибок
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});