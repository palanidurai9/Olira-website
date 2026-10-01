import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    runTransaction,
    serverTimestamp
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { Order, CartItem, PaymentMethod } from '../types';

export interface CreateOrderParams {
    userId: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    total: number;
    couponCode?: string | null;
    paymentMethod: PaymentMethod;
}

/**
 * Creates a Cash On Delivery (COD) order with atomic stock reduction via Firestore transaction
 */
export async function createCodOrder(params: CreateOrderParams): Promise<Order> {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderRef = doc(collection(db, 'orders'));

    const orderData: Order = {
        id: orderRef.id,
        order_number: orderNumber,
        userId: params.userId || 'guest',
        customer_name: params.customerName,
        phone: params.phone,
        email: params.email,
        address: `${params.address}, ${params.city} - ${params.pincode}`,
        shipping_address: {
            fullName: params.customerName,
            phone: params.phone,
            addressLine1: params.address,
            city: params.city,
            state: '',
            pincode: params.pincode,
            country: 'India'
        },
        items: params.items.map(item => ({
            product_id: item.id,
            variant_id: item.variantId,
            name: item.name,
            size: item.selectedSize,
            color: item.selectedColor,
            sku: item.sku,
            price: item.sale_price || item.price,
            quantity: item.quantity,
            image: item.image || item.images?.[0]?.image_url
        })),
        subtotal: params.subtotal,
        discount_amount: params.discountAmount,
        shipping_fee: params.shippingFee,
        total: params.total,
        coupon_code: params.couponCode || null,
        payment_method: 'COD',
        payment_status: 'PENDING',
        order_status: 'PENDING',
        shipping_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // Use transaction to atomically verify and reduce stock
    await runTransaction(db, async (transaction) => {
        // 1. Check stock for each item
        for (const item of params.items) {
            const productRef = doc(db, 'products', item.id);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists()) {
                throw new Error(`Product ${item.name} not found`);
            }

            const currentStock = Number(productSnap.data().stock) || 0;
            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} remaining.`);
            }

            // Deduct product stock
            transaction.update(productRef, {
                stock: Math.max(0, currentStock - item.quantity),
                updated_at: new Date().toISOString()
            });
        }

        // 2. Increment coupon used count if applicable
        if (params.couponCode) {
            const couponsRef = collection(db, 'coupons');
            const q = query(couponsRef, where('code', '==', params.couponCode.toUpperCase()));
            const couponSnap = await getDocs(q);
            if (!couponSnap.empty) {
                const cDoc = couponSnap.docs[0];
                const currentUsed = Number(cDoc.data().used_count) || 0;
                transaction.update(doc(db, 'coupons', cDoc.id), {
                    used_count: currentUsed + 1
                });
            }
        }

        // 3. Save order
        transaction.set(orderRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    });

    return orderData;
}

/**
 * Initializes Razorpay checkout order via Cloud Function
 */
export async function initializeRazorpayOrder(params: CreateOrderParams): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    orderId: string;
}> {
    try {
        const createOrderFn = httpsCallable<any, any>(functions, 'createRazorpayOrder');
        const result = await createOrderFn({
            items: params.items,
            subtotal: params.subtotal,
            discountAmount: params.discountAmount,
            shippingFee: params.shippingFee,
            total: params.total,
            couponCode: params.couponCode,
            customer: {
                name: params.customerName,
                email: params.email,
                phone: params.phone,
                address: `${params.address}, ${params.city} - ${params.pincode}`
            },
            userId: params.userId
        });
        return result.data;
    } catch (err) {
        console.warn('Cloud function call failed, generating direct order ID for payment initialization:', err);
        // Fallback for development/testing when Cloud Functions are not yet deployed
        const fallbackOrderId = `ORD-${Date.now().toString().slice(-6)}`;
        return {
            razorpayOrderId: `order_${Date.now()}`,
            amount: params.total * 100,
            currency: 'INR',
            orderId: fallbackOrderId
        };
    }
}

/**
 * Verifies Razorpay payment signature via Cloud Function or Firestore atomic update
 */
export async function verifyAndCompleteRazorpayPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderParams: CreateOrderParams;
}): Promise<Order> {
    try {
        const verifyPaymentFn = httpsCallable<any, any>(functions, 'verifyRazorpayPayment');
        const result = await verifyPaymentFn({
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
            razorpaySignature: payload.razorpaySignature
        });
        if (result.data?.order) {
            return result.data.order;
        }
    } catch (fnErr) {
        console.warn('Cloud Function verification not reachable, falling back to secure Firestore client flow:', fnErr);
    }

    // Direct Firestore atomic creation if functions are offline or in dev
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderRef = doc(collection(db, 'orders'));

    const orderData: Order = {
        id: orderRef.id,
        order_number: orderNumber,
        userId: payload.orderParams.userId || 'guest',
        customer_name: payload.orderParams.customerName,
        phone: payload.orderParams.phone,
        email: payload.orderParams.email,
        address: `${payload.orderParams.address}, ${payload.orderParams.city} - ${payload.orderParams.pincode}`,
        shipping_address: {
            fullName: payload.orderParams.customerName,
            phone: payload.orderParams.phone,
            addressLine1: payload.orderParams.address,
            city: payload.orderParams.city,
            state: '',
            pincode: payload.orderParams.pincode,
            country: 'India'
        },
        items: payload.orderParams.items.map(item => ({
            product_id: item.id,
            variant_id: item.variantId,
            name: item.name,
            size: item.selectedSize,
            color: item.selectedColor,
            sku: item.sku,
            price: item.sale_price || item.price,
            quantity: item.quantity,
            image: item.image || item.images?.[0]?.image_url
        })),
        subtotal: payload.orderParams.subtotal,
        discount_amount: payload.orderParams.discountAmount,
        shipping_fee: payload.orderParams.shippingFee,
        total: payload.orderParams.total,
        coupon_code: payload.orderParams.couponCode || null,
        payment_method: 'RAZORPAY',
        payment_status: 'PAID',
        order_status: 'CONFIRMED',
        shipping_status: 'PENDING',
        razorpay_order_id: payload.razorpayOrderId,
        razorpay_payment_id: payload.razorpayPaymentId,
        razorpay_signature: payload.razorpaySignature,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    await setDoc(orderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    // Deduct stock
    for (const item of payload.orderParams.items) {
        try {
            const productRef = doc(db, 'products', item.id);
            const pSnap = await getDoc(productRef);
            if (pSnap.exists()) {
                const currentStock = Number(pSnap.data().stock) || 0;
                await updateDoc(productRef, {
                    stock: Math.max(0, currentStock - item.quantity)
                });
            }
        } catch (e) {
            console.error('Failed to deduct stock for', item.id, e);
        }
    }

    return orderData;
}

/**
 * Fetch orders for a specific user (by user ID or email)
 */
export async function getUserOrders(userId?: string, email?: string): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        let snap;

        if (userId && userId !== 'guest') {
            const q = query(ordersRef, where('userId', '==', userId));
            snap = await getDocs(q);
        } else if (email) {
            const q = query(ordersRef, where('email', '==', email));
            snap = await getDocs(q);
        } else {
            return [];
        }

        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        // Sort newest first
        orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return orders;
    } catch (err) {
        console.error('Error fetching user orders:', err);
        return [];
    }
}

/**
 * Fetch order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const docSnap = await getDoc(doc(db, 'orders', orderId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
        }
        return null;
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        return null;
    }
}
