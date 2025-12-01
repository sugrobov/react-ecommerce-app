import localForage from 'localforage';

const authStorage = localForage.createInstance({
  name: 'AquaLand',
  storeName: 'auth'
});

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.isRefreshing = false;
    this.failedRequests = [];
  }

  async init() {
    try {
      const savedAuth = await authStorage.getItem('auth');
      if (savedAuth) {
        this.token = savedAuth.accessToken;
        this.user = savedAuth.user;
      }
      return savedAuth;
    } catch (error) {
      console.error('Ошибка инициализации аутентификации:', error);
      return null;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        // Пытаемся получить детальную ошибку от сервера
        let errorMessage = 'Ошибка авторизации';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Если не удалось распарсить JSON
          errorMessage = `HTTP ошибка: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      await this.setAuth(data);
      return data;
    } catch (error) {
      // Обработка сетевых ошибок
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Нет соединения с сервером. Проверьте подключение к интернету.');
      }
      
      // Обработка других ошибок
      if (error.name === 'AbortError') {
        throw new Error('Запрос был отменен');
      }
      
      throw error;
    }
  }

  async register(userData) {
    try {
      // Валидация на клиенте
      if (userData.password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка регистрации';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ошибка: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      await this.setAuth(data);
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Нет соединения с сервером. Проверьте подключение к интернету.');
      }
      throw error;
    }
  }

  async logout() {
    try {
      this.token = null;
      this.user = null;
      await authStorage.removeItem('auth');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже если произошла ошибка, очищаем локальные данные
      this.token = null;
      this.user = null;
    }
  }

  async refreshToken() {
    try {
      const savedAuth = await authStorage.getItem('auth');
      if (!savedAuth?.refreshToken) {
        throw new Error('Отсутствует refresh token');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: savedAuth.refreshToken })
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка обновления токена';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ошибка: ${response.status}`;
        }
        
        // Если refresh token невалиден, делаем логаут
        if (response.status === 403) {
          await this.logout();
        }
        
        throw new Error(errorMessage);
      }

      const { accessToken } = await response.json();
      this.token = accessToken;
      
      const updatedAuth = { ...savedAuth, accessToken };
      await authStorage.setItem('auth', updatedAuth);

      return accessToken;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Нет соединения с сервером');
      }
      
      // Если не удалось обновить токен, делаем логаут
      if (error.message.includes('refresh token')) {
        await this.logout();
      }
      
      throw error;
    }
  }

  async setAuth(authData) {
    try {
      this.token = authData.accessToken;
      this.user = authData.user;
      
      await authStorage.setItem('auth', {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Ошибка сохранения данных аутентификации:', error);
      throw error;
    }
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  isAuthenticated() {
    return !!this.token;
  }

    // Вспомогательный метод для проверки состояния аутентификации
  async checkAuthStatus() {
    if (!this.token) {
      return { authenticated: false, reason: 'No token' };
    }

    try {
      // Проверяем валидность токена, отправляя тестовый запрос
      const response = await fetch('/api/auth/test', {
        headers: this.getAuthHeader()
      });

      if (response.ok) {
        return { authenticated: true };
      } else if (response.status === 401 || response.status === 403) {
        // Токен истек или невалиден
        try {
          await this.refreshToken();
          return { authenticated: true, refreshed: true };
        } catch (refreshError) {
          await this.logout();
          return { authenticated: false, reason: 'Token refresh failed' };
        }
      } else {
        return { authenticated: false, reason: `Server error: ${response.status}` };
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { authenticated: false, reason: 'Network error' };
      }
      return { authenticated: false, reason: error.message };
    }
  }

    // Метод для безопасного выполнения запросов с автоматическим обновлением токена
  async authFetch(url, options = {}) {
    try {
      // Первая попытка с текущим токеном
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getAuthHeader()
        }
      });

      // Если токен истек, пытаемся обновить
      if (response.status === 401 || response.status === 403) {
        try {
          await this.refreshToken();
          
          // Повторяем запрос с новым токеном
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...this.getAuthHeader()
            }
          });
          
          return retryResponse;
        } catch (refreshError) {
          // Если не удалось обновить токен, выбрасываем ошибку
          throw new Error('Authentication required');
        }
      }

      return response;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();