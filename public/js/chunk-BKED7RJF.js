import {
  axios_default
} from "./chunk-M5DYWXOV.js";

// resources/js/api.js
var CACHE_PREFIX = "attire_cache_";
var CACHE_TTL = 15 * 60 * 1e3;
var getCached = (key) => {
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
var setCached = (key, value) => {
  try {
    const item = { value, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    console.warn("Failed to cache data", e);
  }
};
var getData = (response) => response.data;
var fetchWithCache = async (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `${url}?${queryString}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  const response = await axios_default.get(url, { params });
  const data = getData(response);
  setCached(cacheKey, data);
  return data;
};
var API = {
  // Fetch products with optional filters (Cached)
  async getProducts(filters = {}) {
    return await fetchWithCache("/api/v1/products", filters);
  },
  // Fetch featured products (Cached)
  async getFeaturedProducts() {
    return await fetchWithCache("/api/v1/products/featured");
  },
  // Fetch categories (Cached)
  async getCategories() {
    return await fetchWithCache("/api/v1/products/categories");
  },
  // Fetch collections (Cached)
  async getCollections() {
    return await fetchWithCache("/api/v1/products/collections");
  },
  // Fetch single product by slug (Cached)
  async getProduct(slug) {
    return await fetchWithCache(`/api/v1/products/${slug}`);
  },
  // Search products (Network only - usually too dynamic to cache effectively without short TTL)
  async searchProducts(query) {
    const response = await axios_default.get(`/api/v1/search?search=${encodeURIComponent(query)}`);
    return getData(response);
  },
  // Submit a custom gift request
  async submitGiftRequest(giftData) {
    const response = await axios_default.post("/api/v1/gift-requests", giftData);
    return getData(response);
  },
  async getGiftRequests() {
    const response = await axios_default.get("/api/v1/gift-requests");
    return getData(response);
  },
  async updateGiftRequestStatus(id, status) {
    const response = await axios_default.patch(`/api/v1/gift-requests/${id}/status`, { status });
    return getData(response);
  },
  async deleteGiftRequest(id) {
    const response = await axios_default.delete(`/api/v1/gift-requests/${id}`);
    return getData(response);
  }
};
var api_default = API;

export {
  api_default
};
//# sourceMappingURL=chunk-BKED7RJF.js.map
