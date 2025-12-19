import { mockCategories, mockProducts, mockProductImages, mockProductVariations } from "./mockData";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Используем Vite переменные окружения
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

export const api = {
    async getCategories() {
        if (USE_MOCK_DATA) {
            await delay(300);
            return mockCategories;
        }

        try {
            const response = await fetch(`${API_BASE}/api/categories`);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            return mockCategories;
        }
    },

    async getProducts(range = [0, 9], filters = {}, searchQuery = '') {
        if (USE_MOCK_DATA) {
            await delay(300);
            let filteredProducts = mockProducts;

            // Фильтрация по категории
            if (filters?.category_id) {
                filteredProducts = filteredProducts.filter(
                    product => product.category_id === filters.category_id
                );
            }

            // Фильтрация по поисковому запросу
            if (searchQuery) {
                filteredProducts = filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Фильтрация по цене
            if (filters?.priceFilter && filters.priceFilter.type !== 'any') {
                filteredProducts = filteredProducts.filter(product => {
                    const variation = mockProductVariations.find(
                        v => v.product_id === product.id
                    );
                    const price = variation ? variation.price : 0;

                    switch (filters.priceFilter.type) {
                        case 'less':
                            return price <= filters.priceFilter.max;
                        case 'greater':
                            return price >= filters.priceFilter.min;
                        case 'range':
                            return price >= filters.priceFilter.min && 
                                   price <= filters.priceFilter.max;
                        default:
                            return true;
                    }
                });
            }

            // Применяем диапазон (для пагинации)
            const [start, end] = range;
            return filteredProducts.slice(start, end + 1);
        }

        try {
            const response = await fetch(`${API_BASE}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ range, filters, searchQuery })
            });
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            // Вернуть пустой массив или базовые mock данные
            return [];
        }
    },

    async getProductImages(productIds) {
        if (USE_MOCK_DATA) {
            await delay(300);
            const numericIds = productIds.map(id => parseInt(id));
            return mockProductImages.filter(img =>
                numericIds.includes(img.product_id)
            );
        }

        try {
            const filterStr = encodeURIComponent(
                JSON.stringify({ product_id: productIds })
            );
            const response = await fetch(
                `${API_BASE}/api/product-images?filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            const numericIds = productIds.map(id => parseInt(id));
            return mockProductImages.filter(img => 
                numericIds.includes(img.product_id)
            );
        }
    },

    async getProductVariations(productIds) {
        if (USE_MOCK_DATA) {
            await delay(300);
            const numericIds = productIds.map(id => parseInt(id));
            return mockProductVariations.filter(variation =>
                numericIds.includes(variation.product_id)
            );
        }

        try {
            const filterStr = encodeURIComponent(
                JSON.stringify({ product_id: productIds })
            );
            const response = await fetch(
                `${API_BASE}/api/product-variations?filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            const numericIds = productIds.map(id => parseInt(id));
            return mockProductVariations.filter(variation =>
                numericIds.includes(variation.product_id)
            );
        }
    },

    async getProduct(id) {
        if (USE_MOCK_DATA) {
            await delay(300);
            return mockProducts.find(product => product.id === parseInt(id));
        }

        try {
            const response = await fetch(`${API_BASE}/api/products/${id}`);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            return mockProducts.find(product => product.id === parseInt(id));
        }
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Login failed');
        }
        return await response.json();
    },

    async register(credentials) {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Registration failed');
        }
        return await response.json();
    },

    async getOrders() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE}/api/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    },

    async forgotPassword(email) {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Forgot password failed');
        return await response.json();
    }
};