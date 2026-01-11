// API service for frontend
async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    if (!response.ok) {
        // include body text for debugging (trimmed)
        const snippet = text ? text.substring(0, 1000) : '';
        throw new Error(`API error ${response.status}: ${snippet}`);
    }
    if (contentType.includes('application/json')) {
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error('Failed to parse JSON response from API: ' + err.message);
        }
    }
    // If content-type not JSON, return text for debug
    throw new Error('Expected JSON response from API but received: ' + (text ? text.substring(0, 1000) : '[no body]'));
}

const API = {
    // Fetch products with optional filters
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/v1/products?${params}`);
        return await handleResponse(response);
    },

    // Fetch featured products
    async getFeaturedProducts() {
        const response = await fetch('/api/v1/products/featured');
        return await handleResponse(response);
    },

    // Fetch categories
    async getCategories() {
        const response = await fetch('/api/v1/products/categories');
        return await handleResponse(response);
    },

    // Fetch collections
    async getCollections() {
        const response = await fetch('/api/v1/products/collections');
        return await handleResponse(response);
    },

    // Fetch single product by slug
    async getProduct(slug) {
        const response = await fetch(`/api/v1/products/${slug}`);
        return await handleResponse(response);
    },

    // Search products
    async searchProducts(query) {
        const response = await fetch(`/api/v1/search?search=${encodeURIComponent(query)}`);
        return await handleResponse(response);
    }
};

export default API;
