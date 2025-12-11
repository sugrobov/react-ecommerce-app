import { mockCategories, mockProducts, mockProductImages, mockProductVariations } from "./mockData";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// базовый URL для API
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// 
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false; // переключатель между API и MOCK 

const filterData = (data, filters) => {
    if (!filters) return data;

    return data.filter(item => {
        for (const key in filters) {
            const filterValue = filters[key];
            const itemValue = item[key];

            if (Array.isArray(filterValue)) {
                if (!filterValue.includes(itemValue)) return false
            } else {
                if (itemValue !== filterValue) return false
            }

        }
        return true
    })
}

const applyRange = (data, range) => {
    if (!range) return data;

    const [start, end] = range;
    return data.slice(start, end + 1);
}

const searchProducts = (products, query) => {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();

    return products.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery)
    )
}

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

    getProducts: (range, filters, searchQuery) => {
        let filteredProducts = mockProducts;

        // Фильтрация по категории
        if (filters?.category_id) {
            filteredProducts = filteredProducts.filter(product => product.category_id === filters.category_id);
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
                // Получаем цену товара из вариаций
                const variation = mockProductVariations.find(v => v.product_id === product.id);
                const price = variation ? variation.price : 0;

                switch (filters.priceFilter.type) {
                    case 'less':
                        return price <= filters.priceFilter.max;
                    case 'greater':
                        return price >= filters.priceFilter.min;
                    case 'range':
                        return price >= filters.priceFilter.min && price <= filters.priceFilter.max;
                    default:
                        return true;
                }
            });
        }

        // Применяем диапазон (для пагинации)
        const start = range[0];
        const end = range[1];
        return filteredProducts.slice(start, end + 1);
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
            const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds }));
            const response = await fetch(
                `${API_BASE}/api/product-images?filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            const numericIds = productIds.map(id => parseInt(id));
            return mockProductImages.filter(img => numericIds.includes(img.product_id));
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
            const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds }));
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
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
    },

    async register(credentials) {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error('Registration failed');
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

}



