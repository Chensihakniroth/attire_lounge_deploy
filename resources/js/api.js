import axios from 'axios';

// Helper to extract data from axios response
const getData = (response) => response.data;

const API = {
    // Fetch products with optional filters
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/v1/products?${params}`);
        return getData(response);
    },

    // Fetch featured products
    async getFeaturedProducts() {
        const response = await axios.get('/api/v1/products/featured');
        return getData(response);
    },

    // Fetch categories
    async getCategories() {
        const response = await axios.get('/api/v1/products/categories');
        return getData(response);
    },

    // Fetch collections
    async getCollections() {
        const response = await axios.get('/api/v1/products/collections');
        return getData(response);
    },

    // Fetch single product by slug
    async getProduct(slug) {
        const response = await axios.get(`/api/v1/products/${slug}`);
        return getData(response);
    },

    // Search products
    async searchProducts(query) {
        const response = await axios.get(`/api/v1/search?search=${encodeURIComponent(query)}`);
        return getData(response);
    },

    // Submit a custom gift request
    async submitGiftRequest(giftData) {
        const response = await axios.post('/api/v1/gift-requests', giftData);
        return getData(response);
    },

    async getGiftRequests() {
        const response = await axios.get('/api/v1/gift-requests');
        return getData(response);
    },

    async updateGiftRequestStatus(id, status) {
        const response = await axios.patch(`/api/v1/gift-requests/${id}/status`, { status });
        return getData(response);
    },

    async deleteGiftRequest(id) {
        const response = await axios.delete(`/api/v1/gift-requests/${id}`);
        // Axios handles 204 automatically, returning undefined data usually, which is fine
        return getData(response);
    }
};

export default API;
