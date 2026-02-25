import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Base API URL with versioning
const API_BASE = '/api/v1';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    collection: string;
    collection_slug: string;
    featured: boolean;
    is_new: boolean;
    in_stock: boolean;
    sizes: string[] | string;
}

interface ProductResponse {
    success: boolean;
    data: Product[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export const useProducts = (filters = {}) => {
    return useQuery<ProductResponse>({
        queryKey: ['products', filters],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/products`, { params: filters });
            return data;
        },
    });
};

export const useProduct = (slug: string) => {
    return useQuery<Product>({
        queryKey: ['product', slug],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/products/${slug}`);
            return data.data;
        },
        enabled: !!slug,
    });
};

export const useFeaturedProducts = () => {
    return useQuery<Product[]>({
        queryKey: ['featured-products'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/products/featured`);
            return data.data;
        },
    });
};
