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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShiprocketOrder = createShiprocketOrder;
const admin = __importStar(require("firebase-admin"));
let cachedToken = null;
let tokenExpiry = 0;
/**
 * Authenticate with Shiprocket and retrieve bearer token
 */
async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) {
        console.warn('Shiprocket credentials missing. Skipping automated shipping creation.');
        return null;
    }
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }
    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            console.error('Shiprocket auth failed:', await response.text());
            return null;
        }
        const data = await response.json();
        cachedToken = data.token;
        tokenExpiry = Date.now() + 240 * 60 * 1000; // 4 hours
        return cachedToken;
    }
    catch (err) {
        console.error('Error authenticating with Shiprocket:', err);
        return null;
    }
}
/**
 * Create order and shipment in Shiprocket
 */
async function createShiprocketOrder(orderId, orderData) {
    const token = await getShiprocketToken();
    if (!token)
        return;
    try {
        const payload = {
            order_id: orderData.order_number,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
            billing_customer_name: orderData.customer_name,
            billing_last_name: '',
            billing_address: orderData.address,
            billing_city: orderData.shipping_address?.city || 'Chennai',
            billing_pincode: orderData.shipping_address?.pincode || '600001',
            billing_state: orderData.shipping_address?.state || 'Tamil Nadu',
            billing_country: 'India',
            billing_email: orderData.email,
            billing_phone: orderData.phone,
            shipping_is_billing: true,
            order_items: orderData.items.map((item) => ({
                name: item.name,
                sku: item.sku || `SKU-${item.product_id.substring(0, 6)}`,
                units: item.quantity,
                selling_price: item.price
            })),
            payment_method: orderData.payment_method === 'COD' ? 'COD' : 'Prepaid',
            sub_total: orderData.total,
            length: 15,
            breadth: 15,
            height: 5,
            weight: 0.5
        };
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok && result.order_id) {
            await admin.firestore().collection('orders').doc(orderId).update({
                shiprocket_order_id: String(result.order_id),
                shiprocket_shipment_id: String(result.shipment_id || ''),
                shipping_status: 'READY_TO_SHIP',
                updated_at: new Date().toISOString()
            });
            console.log(`Shiprocket order created for ${orderData.order_number}`);
        }
        else {
            console.error('Shiprocket order creation failed:', result);
        }
    }
    catch (err) {
        console.error('Error communicating with Shiprocket:', err);
    }
}
//# sourceMappingURL=shiprocket.js.map