// Common interfaces for Attire Lounge

export interface Product {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compare_price?: number | null;
    category: string;
    collection?: string;
    collectionSlug?: string;
    featured?: boolean;
    in_stock?: boolean;
    stock_quantity?: number;
    images: string[];
    sizes?: string[];
    colors?: string[];
    fabric?: string;
    fit?: string;
    discount_percent?: number;
    createdAt?: Date;
    popularity?: number;
    hidden?: boolean;
    detailed_description?: string;
    color?: string;
}

export interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    season?: string;
    year?: number;
    image_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}

export interface Appointment {
    id: number;
    name: string;
    email?: string;
    phone: string;
    service: string;
    appointment_type: string;
    date: string;
    time: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'done' | 'cancelled';
    favorite_item_image_url?: string[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'admin' | 'user';
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}
