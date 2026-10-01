export interface ProductVariant {
    id: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    active: boolean;
    image?: string;
}

export interface ProductImage {
    id: string;
    product_id?: string;
    image_url: string;
    order_index: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    compare_at_price?: number;
    description?: string;
    short_description?: string;
    fabric?: string;
    care?: string;
    sizes: string[];
    colors?: string[];
    variants?: ProductVariant[];
    stock: number;
    featured: boolean;
    new_arrival?: boolean;
    bestseller?: boolean;
    status?: 'active' | 'inactive';
    sku?: string;
    tags?: string[];
    launch_date: string;
    category_id?: string;
    category_slug?: string;
    created_at?: string;
    updated_at?: string;
    images?: ProductImage[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
    order_index?: number;
    created_at?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
    role: 'customer' | 'admin' | 'superadmin';
    status?: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export interface Address {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
    isDefault: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    cartId: string;
    id: string;
    variantId?: string;
    name: string;
    slug?: string;
    price: number;
    sale_price?: number;
    selectedSize: string;
    selectedColor?: string;
    quantity: number;
    stock: number;
    sku?: string;
    fabric?: string;
    image?: string;
    images?: ProductImage[];
}

export interface Coupon {
    id?: string;
    code: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    min_order_value: number;
    max_discount_amount?: number;
    start_date?: string;
    end_date?: string;
    usage_limit?: number;
    used_count: number;
    is_active: boolean;
    applicable_categories?: string[];
    created_at?: string;
}

export interface OrderItem {
    product_id: string;
    variant_id?: string;
    name: string;
    slug?: string;
    size: string;
    color?: string;
    sku?: string;
    price: number;
    quantity: number;
    image?: string;
}

export type PaymentMethod = 'COD' | 'ONLINE' | 'RAZORPAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
export type ShippingStatus = 'PENDING' | 'READY_TO_SHIP' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface Order {
    id: string;
    order_number: string;
    userId: string;
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    shipping_address?: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    items: OrderItem[];
    subtotal: number;
    discount_amount: number;
    shipping_fee: number;
    tax?: number;
    total: number;
    coupon_code?: string | null;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    order_status: OrderStatus;
    shipping_status?: ShippingStatus;
    shipping_provider?: string;
    shiprocket_order_id?: string;
    shiprocket_shipment_id?: string;
    tracking_number?: string;
    tracking_url?: string;
    courier_name?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    created_at: string;
    updated_at?: string;
}

export interface Review {
    id: string;
    product_id: string;
    customer_name: string;
    user_id?: string;
    rating: number;
    comment: string;
    images?: string[];
    is_verified?: boolean;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface AdminLog {
    id: string;
    adminId: string;
    adminEmail: string;
    action: string;
    target: string;
    details?: Record<string, any>;
    timestamp: string;
}
