// API service for frontend
const API = {
    // Fetch products with optional filters
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/v1/products?${params}`);
        return await response.json();
    },

    // Fetch featured products
    async getFeaturedProducts() {
        const response = await fetch('/api/v1/products/featured');
        return await response.json();
    },

    // Fetch categories
    async getCategories() {
        const response = await fetch('/api/v1/products/categories');
        return await response.json();
    },

    // Fetch collections
    async getCollections() {
        const response = await fetch('/api/v1/products/collections');
        return await response.json();
    },

    // Fetch single product by slug
    async getProduct(slug) {
        const response = await fetch(`/api/v1/products/${slug}`);
        return await response.json();
    },

    // Search products
    async searchProducts(query) {
        const response = await fetch(`/api/v1/search?search=${encodeURIComponent(query)}`);
        return await response.json();
    }
};

export default API;
