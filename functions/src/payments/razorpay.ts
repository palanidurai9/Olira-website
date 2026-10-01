import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import { createShiprocketOrder } from '../shipping/shiprocket';
import { sendOrderConfirmationEmail } from '../email/resend';

function getRazorpayClient(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Validates cart prices from Firestore and creates Razorpay Order
 */
export async function handleCreateRazorpayOrder(data: any): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    orderId: string;
}> {
    const db = admin.firestore();
    let calculatedSubtotal = 0;

    // Server-side verification of item prices
    for (const item of data.items) {
        const pSnap = await db.collection('products').doc(item.id).get();
        if (!pSnap.exists) {
            throw new Error(`Product ${item.name} not found`);
        }
        const pData = pSnap.data()!;
        const verifiedPrice = Number(pData.sale_price !== undefined && pData.sale_price !== null ? pData.sale_price : pData.price);
        calculatedSubtotal += verifiedPrice * item.quantity;
    }

    // Server-side coupon verification
    let discount = 0;
    if (data.couponCode) {
        const cSnap = await db.collection('coupons').where('code', '==', data.couponCode.toUpperCase()).get();
        if (!cSnap.empty) {
            const coupon = cSnap.docs[0].data();
            if (coupon.is_active && calculatedSubtotal >= (coupon.min_order_value || 0)) {
                if (coupon.discount_type === 'FIXED') {
                    discount = Number(coupon.discount_value) || 0;
                } else {
                    discount = (calculatedSubtotal * Number(coupon.discount_value)) / 100;
                    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
                        discount = coupon.max_discount_amount;
                    }
                }
            }
        }
    }

    const shippingFee = (calculatedSubtotal - discount) >= 2000 ? 0 : 100;
    const finalTotal = Math.max(0, calculatedSubtotal - Math.round(discount) + shippingFee);

    const rzp = getRazorpayClient();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const rzpOrder = await rzp.orders.create({
        amount: Math.round(finalTotal * 100), // amount in paise
        currency: 'INR',
        receipt: orderNumber,
        notes: {
            customer_name: data.customer?.name || '',
            email: data.customer?.email || '',
            phone: data.customer?.phone || ''
        }
    });

    return {
        razorpayOrderId: rzpOrder.id,
        amount: Number(rzpOrder.amount),
        currency: rzpOrder.currency,
        orderId: orderNumber
    };
}

/**
 * Validates cryptographic signature and records paid order
 */
export async function handleVerifyRazorpayPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}): Promise<{ success: boolean; order: any }> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

    if (generatedSignature !== data.razorpaySignature) {
        throw new Error('Invalid Razorpay signature. Potential tampering detected.');
    }

    const db = admin.firestore();

    // Check idempotency: check if order already exists with this payment id
    const existingOrders = await db.collection('orders').where('razorpay_payment_id', '==', data.razorpayPaymentId).get();
    if (!existingOrders.empty) {
        return { success: true, order: existingOrders.docs[0].data() };
    }

    // Find order matching razorpay order id or create it
    const orderQuery = await db.collection('orders').where('razorpay_order_id', '==', data.razorpayOrderId).limit(1).get();

    let orderDoc: any;
    if (!orderQuery.empty) {
        orderDoc = orderQuery.docs[0];
        await orderDoc.ref.update({
            payment_status: 'PAID',
            order_status: 'CONFIRMED',
            razorpay_payment_id: data.razorpayPaymentId,
            razorpay_signature: data.razorpaySignature,
            updated_at: new Date().toISOString()
        });
    }

    const orderData = orderDoc ? (await orderDoc.ref.get()).data() : null;

    // Trigger Shiprocket shipment and confirmation email
    if (orderData) {
        createShiprocketOrder(orderDoc.id, orderData).catch(e => console.error('Shiprocket trigger error:', e));
        sendOrderConfirmationEmail(orderData).catch(e => console.error('Email trigger error:', e));
    }

    return { success: true, order: orderData };
}
