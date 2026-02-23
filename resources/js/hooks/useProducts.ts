import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Product, Collection, Category, PaginatedResponse } from '../types';

// Fetch products with optional filters
export const useProducts = (filters: Record<string, any> = {}) => {
    // DEBUG: Log filters passed to useProducts
    console.log('useProducts: filters received:', filters);

    return useQuery<PaginatedResponse<Product>>({
        queryKey: ['products', filters],
        queryFn: async () => {
            console.log('useProducts: making axios GET request with filters:', filters); // DEBUG
            const { data } = await axios.get('/api/v1/products', { params: filters });
            return data;
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
};

// Fetch all collections
export const useCollections = () => {
    return useQuery<Collection[]>({
        queryKey: ['collections'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products/collections');
            return data.data; // API returns { success: true, data: [...] }
        },
        staleTime: 1000 * 60 * 60, // 1 hour (collections change rarely)
    });
};

// Fetch all categories
export const useCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products/categories');
            return data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// Fetch single product by slug
export const useProduct = (slug: string) => {
    return useQuery<Product>({
        queryKey: ['product', slug],
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/products/${slug}`);
            return data.data;
        },
        enabled: !!slug,
    });
};
