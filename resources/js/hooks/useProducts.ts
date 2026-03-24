import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product, PaginatedResponse } from '../types';

// Base API URL with versioning
const API_BASE = '/api/v1';

interface ProductApiResponse extends PaginatedResponse<Product> {
    success: boolean;
}

// Legacy single-page hook (kept for compatibility)
export const useProducts = (filters: Record<string, any> = {}) => {
    return useQuery<ProductApiResponse>({
        queryKey: ['products', filters],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/products`, { params: filters });
            return data;
        },
    });
};

// Infinite scroll hook — replaces manual page accumulation in ProductListPage
export const useInfiniteProducts = (filters: Omit<Record<string, any>, 'page'> = {}) => {
    return useInfiniteQuery<ProductApiResponse>({
        queryKey: ['products-infinite', filters],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await axios.get(`${API_BASE}/products`, {
                params: { ...filters, page: pageParam },
            });
            return data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.meta;
            return current_page < last_page ? current_page + 1 : undefined;
        },
        staleTime: 5 * 60 * 1000, // 5 min — product lists can change
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
