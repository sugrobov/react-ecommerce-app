import { mockCategories, mockProducts, mockProductImages, mockProductVariations } from "./mockData";

const API_BASE = '';
const USE_MOCK_DATA = true; // переключатель между API и MOCK 

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
            return mockCategories;
        }

        try {
            const response = await fetch(`${API_BASE}/Categories`);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            return mockCategories;
        }
    },

    async getProducts(range = [0, 24], filters = {}, searchQuery = '') {
        if (USE_MOCK_DATA) {
            let filteredProducts = mockProducts;

            // Применяем фильтры по категории
            if (filters.category_id) {
                filteredProducts = filterData(filteredProducts, filters);
            }

            // Применяем поиск
            if (searchQuery) {
                filteredProducts = searchProducts(filteredProducts, searchQuery);
            }

            // Применяем диапазон
            return applyRange(filteredProducts, range);
        }

        try {
            const filterStr = encodeURIComponent(JSON.stringify(filters));
            const rangeStr = encodeURIComponent(JSON.stringify(range));
            const response = await fetch(
                `${API_BASE}/Products?range=${rangeStr}&filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            let filteredProducts = searchProducts(mockProducts, searchQuery);
            return applyRange(filteredProducts, range);
        }
    },

    async getProductImages(productIds) {
        if (USE_MOCK_DATA) {

            return mockProductImages.filter(img =>
                productIds.includes(img.product_id)
            );
        }

        try {
            const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds }));
            const response = await fetch(
                `${API_BASE}/ProductImages?filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            return mockProductImages.filter(img => productIds.includes(img.product_id));
        }
    },

    async getProductVariations(productIds) {
        if (USE_MOCK_DATA) {

            return mockProductVariations.filter(variation =>
                productIds.includes(variation.product_id)
            );
        }

        try {
            const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds }));
            const response = await fetch(
                `${API_BASE}/ProductVariations?filter=${filterStr}`
            );
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.warn('Using mock data due to API error:', error);
            return mockProductVariations.filter(variation =>
                productIds.includes(variation.product_id)
            );
        }
    },
}



