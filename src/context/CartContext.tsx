import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, Coupon } from '../types';
import { validateCoupon } from '../services/couponService';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, size: string, quantity?: number, color?: string, variantId?: string) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, delta: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    cartTotal: number;
    cartSubtotal: number;
    coupon: Coupon | null;
    discountAmount: number;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('olira-cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [coupon, setCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('olira-cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
    }, [cart]);

    const cartSubtotal = cart.reduce((total, item) => {
        const price = item.sale_price || item.price;
        return total + (price * item.quantity);
    }, 0);

    // Active coupon is valid only if cartSubtotal meets min_order_value
    const activeCoupon = (coupon && cartSubtotal >= coupon.min_order_value) ? coupon : null;

    const addToCart = (
        product: Product,
        size: string,
        quantity: number = 1,
        color?: string,
        variantId?: string
    ) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id &&
                item.selectedSize === size &&
                (!color || item.selectedColor === color)
            );

            if (existing) {
                return prev.map(item =>
                    item.cartId === existing.cartId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            const mainImage = product.images?.[0]?.image_url || '/src/assets/product-placeholder.png';

            const newItem: CartItem = {
                cartId: `${product.id}-${size}-${color || 'default'}-${Date.now()}`,
                id: product.id,
                variantId,
                name: product.name,
                slug: product.slug,
                price: product.price,
                sale_price: product.sale_price,
                selectedSize: size,
                selectedColor: color,
                quantity,
                stock: product.stock,
                sku: product.sku,
                fabric: product.fabric,
                image: mainImage,
                images: product.images
            };

            return [...prev, newItem];
        });

        setIsCartOpen(true);
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
    };

    // Calculate discount amount
    let discountAmount = 0;
    if (activeCoupon) {
        if (activeCoupon.discount_type === 'FIXED') {
            discountAmount = activeCoupon.discount_value;
        } else if (activeCoupon.discount_type === 'PERCENTAGE') {
            discountAmount = (cartSubtotal * activeCoupon.discount_value) / 100;
            if (activeCoupon.max_discount_amount && discountAmount > activeCoupon.max_discount_amount) {
                discountAmount = activeCoupon.max_discount_amount;
            }
        }

        if (discountAmount > cartSubtotal) {
            discountAmount = cartSubtotal;
        }
    }

    const cartTotal = Math.max(0, cartSubtotal - Math.round(discountAmount));

    const applyCouponHandler = async (code: string): Promise<{ success: boolean; message: string }> => {
        const result = await validateCoupon(code, cartSubtotal);
        if (result.valid && result.coupon) {
            setCoupon(result.coupon);
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message };
    };

    const removeCouponHandler = () => {
        setCoupon(null);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                setIsCartOpen,
                cartTotal,
                cartSubtotal,
                coupon: activeCoupon,
                discountAmount: Math.round(discountAmount),
                applyCoupon: applyCouponHandler,
                removeCoupon: removeCouponHandler
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
