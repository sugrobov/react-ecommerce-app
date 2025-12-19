import localForage from 'localforage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка авторизации';
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
      if (error.name === 'TypeError' && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Нет соединения с сервером. Проверьте подключение к интернету.');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Запрос был отменен');
      }
      
      throw error;
    }
  }

  async register(userData) {
    try {
      if (userData.password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const response = await fetch(`${API_BASE}/api/auth/register`, {
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
      if (error.name === 'TypeError' && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
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

      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
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
      if (error.name === 'TypeError' && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Нет соединения с сервером');
      }
      
      if (error.message.includes('refresh token') || error.message.includes('refreshToken')) {
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

  async checkAuthStatus() {
    if (!this.token) {
      return { authenticated: false, reason: 'No token' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/test`, {
        headers: this.getAuthHeader()
      });

      if (response.ok) {
        return { authenticated: true };
      } else if (response.status === 401 || response.status === 403) {
        try {
          await this.refreshToken();
          return { authenticated: true, refreshed: true };
        } catch (_error) { 
          await this.logout();
          return { authenticated: false, reason: 'Token refresh failed' };
        }
      } else {
        return { authenticated: false, reason: `Server error: ${response.status}` };
      }
    } catch (error) {
      if (error.name === 'TypeError' && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        return { authenticated: false, reason: 'Network error' };
      }
      return { authenticated: false, reason: error.message };
    }
  }

  async authFetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...this.getAuthHeader()
        }
      });

      if (response.status === 401 || response.status === 403) {
        try {
          await this.refreshToken();
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...this.getAuthHeader()
            }
          });
          
          return retryResponse;
        } catch (_error) { 
          throw new Error('Authentication required');
        }
      }

      return response;
    } catch (error) {
      if (error.name === 'TypeError' && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.');
      } else if (error.message === 'Authentication required') {
        throw error;
      } else {
        console.error('Unknown error in authFetch:', error);
        throw new Error('Произошла неизвестная ошибка');
      }
    }
  }
}

export const authService = new AuthService();