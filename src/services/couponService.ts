import {
    collection,
    query,
    where,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { Coupon } from '../types';

export interface CouponValidationResult {
    valid: boolean;
    coupon: Coupon | null;
    discount: number;
    message: string;
}

/**
 * Validates a coupon code against current cart subtotal and Firestore records
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
        return { valid: false, coupon: null, discount: 0, message: 'Please enter a coupon code' };
    }

    const cleanCode = code.trim().toUpperCase();

    try {
        const couponsRef = collection(db, 'coupons');
        const q = query(couponsRef, where('code', '==', cleanCode), where('is_active', '==', true), limit(1));
        const snap = await getDocs(q);

        if (snap.empty) {
            return { valid: false, coupon: null, discount: 0, message: 'Invalid or inactive coupon code' };
        }

        const couponDoc = snap.docs[0];
        const data = couponDoc.data();
        const coupon: Coupon = {
            id: couponDoc.id,
            code: data.code,
            discount_type: data.discount_type || 'PERCENTAGE',
            discount_value: Number(data.discount_value) || 0,
            min_order_value: Number(data.min_order_value) || 0,
            max_discount_amount: data.max_discount_amount !== undefined ? Number(data.max_discount_amount) : undefined,
            start_date: data.start_date,
            end_date: data.end_date,
            usage_limit: data.usage_limit ? Number(data.usage_limit) : undefined,
            used_count: Number(data.used_count) || 0,
            is_active: Boolean(data.is_active)
        };

        const now = new Date();

        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return { valid: false, coupon: null, discount: 0, message: 'Coupon offer has not started yet' };
        }

        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return { valid: false, coupon: null, discount: 0, message: 'Coupon code has expired' };
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return { valid: false, coupon: null, discount: 0, message: 'Coupon usage limit has been reached' };
        }

        if (subtotal < coupon.min_order_value) {
            return {
                valid: false,
                coupon: null,
                discount: 0,
                message: `Minimum order value of ₹${coupon.min_order_value} required for this coupon`
            };
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'FIXED') {
            discount = coupon.discount_value;
        } else {
            discount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
                discount = coupon.max_discount_amount;
            }
        }

        if (discount > subtotal) {
            discount = subtotal;
        }

        return {
            valid: true,
            coupon,
            discount: Math.round(discount),
            message: 'Coupon applied successfully!'
        };
    } catch (err: any) {
        console.error('Error validating coupon:', err);
        return { valid: false, coupon: null, discount: 0, message: 'Error checking coupon validity' };
    }
}
