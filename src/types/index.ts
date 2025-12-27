
export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    description?: string;
    fabric?: string;
    care?: string;
    sizes: string[];
    stock: number;
    featured: boolean;
    launch_date: string;
    category_id?: string;
    created_at?: string;
    images?: ProductImage[]; // UI helper
}

export interface ProductImage {
    id: string;
    product_id: string;
    image_url: string;
    order_index: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
}
