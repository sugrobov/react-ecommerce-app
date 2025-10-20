const API_BASE = '';    // base API



export const api = {
    async getCategories() { 
        const response = await fetch(`${API_BASE}/Categories`);

        return await response.json()
    },

    async getProducts(range = [0, 24], filters = {}) {
        const filterStr = encodeURIComponent(JSON.stringify(filters));
        const rangeStr = encodeURIComponent(JSON.stringify(range));
        const response = await fetch(`${API_BASE}/Products?range=${rangeStr}&filter=${filterStr}`);

        return await response.json()

    },

    async getProductImages(productIds) {
        const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds })); 
        const response = await fetch(`${API_BASE}/ProductImages?filter=${filterStr}`);

        return await response.json()
    },

    async getProductVariations(productIds) {
        const filterStr = encodeURIComponent(JSON.stringify({ product_id: productIds }));
        const response = await fetch(`${API_BASE}/ProductVariations?filter=${filterStr}`);

        return await response.json()
    }


}


