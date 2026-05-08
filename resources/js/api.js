import axios from 'axios';

// Cache configuration
const CACHE_PREFIX = 'attire_cache_';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Helper to get data from cache
const getCached = (key) => {
    try {
        const item = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;

        const { value, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > CACHE_TTL) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
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
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
        console.warn('Failed to cache data', e);
    }
};

// Helper to extract data from axios response
const getData = (response) => response.data;

// Fetch with caching strategy for GET requests
const fetchWithCache = async (url, params = {}) => {
    const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
    const queryString = new URLSearchParams(params).toString();
    const cacheKey = `${outlet}:${url}?${queryString}`;

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
    },

    async getOutOfStockItems() {
        const response = await axios.get('/api/v1/gift-items/out-of-stock');
        return getData(response);
    },

    async toggleGiftItemStock(itemId, isOutOfStock) {
        const response = await axios.post('/api/v1/admin/gift-items/toggle-stock', {
            item_id: itemId,
            is_out_of_stock: isOutOfStock
        });
        return getData(response);
    },

    // Subscribe to newsletter
    async subscribeNewsletter(data) {
        const response = await axios.post('/api/v1/newsletter-subscriptions', data);
        return getData(response);
    },

    // Validate a promo code
    async validatePromoCode(code) {
        const response = await axios.post('/api/v1/promocodes/validate', { code });
        return getData(response);
    },

    // Book an appointment
    async bookAppointment(data) {
        const response = await axios.post('/api/v1/appointments', data);
        return getData(response);
    },

    // --- Admin Endpoints ---

    // Admin: Users
    async getAdminUsers() {
        const response = await axios.get('/api/v1/admin/users');
        return getData(response);
    },

    async adminCreateUser(data) {
        const response = await axios.post('/api/v1/admin/users', data);
        return getData(response);
    },

    async adminUpdateUser(id, data) {
        const response = await axios.put(`/api/v1/admin/users/${id}`, data);
        return getData(response);
    },

    async adminDeleteUser(id) {
        const response = await axios.delete(`/api/v1/admin/users/${id}`);
        return getData(response);
    },

    // Admin: Products
    async adminCreateProduct(data) {
        const response = await axios.post('/api/v1/admin/products', data);
        return getData(response);
    },

    async adminUpdateProduct(id, data) {
        const response = await axios.put(`/api/v1/admin/products/${id}`, data);
        return getData(response);
    },

    async adminDeleteProduct(id) {
        const response = await axios.delete(`/api/v1/admin/products/${id}`);
        return getData(response);
    },

    async uploadImage(formData) {
        const response = await axios.post('/api/v1/admin/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return getData(response);
    },

    // Admin: Sales & Reports
    async getDailySalesReport(date) {
        const response = await axios.get('/api/v1/admin/sales-report/daily', { params: { date } });
        return getData(response);
    },

    // Admin: Appointments & Customers
    async getAdminAppointments(params = {}) {
        const response = await axios.get('/api/v1/admin/appointments', { params });
        return getData(response);
    },

    async getAdminCustomers(params = {}) {
        const response = await axios.get('/api/v1/admin/customer-profiles', { params });
        return getData(response);
    },

    // Admin: Promocodes
    async getAdminPromocodes() {
        const response = await axios.get('/api/v1/admin/promocodes');
        return getData(response);
    },

    async adminCreatePromocode(data) {
        const response = await axios.post('/api/v1/admin/promocodes', data);
        return getData(response);
    },

    async adminDeletePromocode(id) {
        const response = await axios.delete(`/api/v1/admin/promocodes/${id}`);
        return getData(response);
    },

    // Admin: POS
    async getPosInvoices(params = {}) {
        const response = await axios.get('/api/v1/admin/pos/invoices', { params });
        return getData(response);
    },

    // Auth
    async adminLogin(credentials) {
        const response = await axios.post('/api/v1/admin/login', credentials);
        return getData(response);
    },

    async adminLogout() {
        const response = await axios.post('/api/v1/admin/logout');
        return getData(response);
    },

    async getAdminMe() {
        const response = await axios.get('/api/v1/admin/me');
        return getData(response);
    }
};

export default API;
