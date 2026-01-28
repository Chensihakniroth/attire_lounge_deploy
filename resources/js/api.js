import axios from 'axios';

// Cache configuration
const CACHE_PREFIX = 'attire_cache_';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Helper to get data from cache
const getCached = (key) => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;
        
        const { value, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return value;
    } catch (e) {
        return null;
    }
};

// Helper to set data to cache
const setCached = (key, value) => {
    try {
        const item = { value, timestamp: Date.now() };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
        console.warn('Failed to cache data', e);
    }
};

// Helper to extract data from axios response
const getData = (response) => response.data;

// Fetch with caching strategy for GET requests
const fetchWithCache = async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const cacheKey = `${url}?${queryString}`;
    
    // Try cache first
    const cachedData = getCached(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // Fallback to network
    const response = await axios.get(url, { params });
    const data = getData(response);
    
    // Save to cache
    setCached(cacheKey, data);
    return data;
};

const API = {
    // Fetch products with optional filters (Cached)
    async getProducts(filters = {}) {
        return await fetchWithCache('/api/v1/products', filters);
    },

    // Fetch featured products (Cached)
    async getFeaturedProducts() {
        return await fetchWithCache('/api/v1/products/featured');
    },

    // Fetch categories (Cached)
    async getCategories() {
        return await fetchWithCache('/api/v1/products/categories');
    },

    // Fetch collections (Cached)
    async getCollections() {
        return await fetchWithCache('/api/v1/products/collections');
    },

    // Fetch single product by slug (Cached)
    async getProduct(slug) {
        return await fetchWithCache(`/api/v1/products/${slug}`);
    },

    // Search products (Network only - usually too dynamic to cache effectively without short TTL)
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
