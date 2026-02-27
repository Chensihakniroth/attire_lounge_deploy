import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product, PaginatedResponse } from '../types';

// Base API URL with versioning
const API_BASE = '/api/v1';

interface ProductApiResponse extends PaginatedResponse<Product> {
    success: boolean;
}

export const useProducts = (filters: Record<string, any> = {}) => {
    return useQuery<ProductApiResponse>({
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

export const useCollections = () => {
    return useQuery<any[]>({
        queryKey: ['collections'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/products/collections`);
            return data.data;
        },
    });
};
