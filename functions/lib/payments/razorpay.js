"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateRazorpayOrder = handleCreateRazorpayOrder;
exports.handleVerifyRazorpayPayment = handleVerifyRazorpayPayment;
const crypto = __importStar(require("crypto"));
const admin = __importStar(require("firebase-admin"));
const razorpay_1 = __importDefault(require("razorpay"));
const shiprocket_1 = require("../shipping/shiprocket");
const resend_1 = require("../email/resend");
function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    return new razorpay_1.default({ key_id: keyId, key_secret: keySecret });
}
/**
 * Validates cart prices from Firestore and creates Razorpay Order
 */
async function handleCreateRazorpayOrder(data) {
    const db = admin.firestore();
    let calculatedSubtotal = 0;
    // Server-side verification of item prices
    for (const item of data.items) {
        const pSnap = await db.collection('products').doc(item.id).get();
        if (!pSnap.exists) {
            throw new Error(`Product ${item.name} not found`);
        }
        const pData = pSnap.data();
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
                }
                else {
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
async function handleVerifyRazorpayPayment(data) {
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
    let orderDoc;
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
        (0, shiprocket_1.createShiprocketOrder)(orderDoc.id, orderData).catch(e => console.error('Shiprocket trigger error:', e));
        (0, resend_1.sendOrderConfirmationEmail)(orderData).catch(e => console.error('Email trigger error:', e));
    }
    return { success: true, order: orderData };
}
//# sourceMappingURL=razorpay.js.map