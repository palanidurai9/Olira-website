import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';

export interface CartItem extends Product {
    cartId: string;
    selectedSize: string;
    quantity: number;
}

export interface Coupon {
    code: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    min_order_value: number;
    max_discount_amount?: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, size: string, quantity?: number) => void;
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
        const saved = localStorage.getItem('olira-cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [coupon, setCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        localStorage.setItem('olira-cart', JSON.stringify(cart));
    }, [cart]);

    // Recalculate coupon validity if cart changes (optional, but good for min_order_value check)
    useEffect(() => {
        if (coupon) {
            const subtotal = cart.reduce((total, item) => {
                const price = item.sale_price || item.price;
                return total + (price * item.quantity);
            }, 0);

            if (subtotal < coupon.min_order_value) {
                // Should we remove it automatically or just let the user know? 
                // For simplicity, let's just keep it but it won't apply discount if logic in discount calculation checks it.
                // But my discount calculation logic below handles it "silently" or we should explicitly remove it.
                // Let's explicitly remove if it violates.
                // Actually, let's just leave it there but make discount 0 or show error.
                // Decision: Auto-remove if subtotal drops.
                if (subtotal < coupon.min_order_value) {
                    setCoupon(null);
                }
            }
        }
    }, [cart, coupon]);


    const addToCart = (product: Product, size: string, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
            if (existing) {
                return prev.map(item =>
                    item.cartId === existing.cartId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, cartId: crypto.randomUUID(), selectedSize: size, quantity }];
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

    const cartSubtotal = cart.reduce((total, item) => {
        const price = item.sale_price || item.price;
        return total + (price * item.quantity);
    }, 0);

    // Calculate Discount
    let discountAmount = 0;
    if (coupon) {
        if (coupon.discount_type === 'FIXED') {
            discountAmount = coupon.discount_value;
        } else if (coupon.discount_type === 'PERCENTAGE') {
            discountAmount = (cartSubtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                discountAmount = coupon.max_discount_amount;
            }
        }

        // Final sanity check: if subtotal < min_order, discount is 0 (though we try to remove it in useEffect)
        if (cartSubtotal < coupon.min_order_value) {
            discountAmount = 0;
        }

        // Ensure discount doesn't exceed total (mostly relevant for fixed discounts)
        if (discountAmount > cartSubtotal) discountAmount = cartSubtotal;
    }

    const cartTotal = Math.max(0, cartSubtotal - discountAmount);

    const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
        if (!code) return { success: false, message: 'Please enter a code' };

        try {
            // 1. Fetch Coupon Logic
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { success: false, message: 'Invalid coupon code' };
            }

            const couponData = data;

            // 2. Validate Expiry
            const now = new Date();
            if (couponData.start_date && new Date(couponData.start_date) > now) {
                return { success: false, message: 'Coupon not yet active' };
            }
            if (couponData.end_date && new Date(couponData.end_date) < now) {
                return { success: false, message: 'Coupon expired' };
            }

            // 3. Validate Usage Limit
            if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
                return { success: false, message: 'Coupon usage limit reached' };
            }

            // 4. Validate Min Order Value
            if (cartSubtotal < couponData.min_order_value) {
                return { success: false, message: `Minimum order value of ₹${couponData.min_order_value} required` };
            }

            setCoupon({
                code: couponData.code,
                discount_type: couponData.discount_type,
                discount_value: couponData.discount_value,
                min_order_value: couponData.min_order_value,
                max_discount_amount: couponData.max_discount_amount
            });

            return { success: true, message: 'Coupon applied successfully!' };

        } catch (err) {
            console.error(err);
            return { success: false, message: 'Error checking coupon' };
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartTotal,
            cartSubtotal,
            coupon,
            discountAmount,
            applyCoupon,
            removeCoupon
        }}>
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
