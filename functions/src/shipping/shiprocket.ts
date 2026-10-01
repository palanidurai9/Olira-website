import * as admin from 'firebase-admin';

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Authenticate with Shiprocket and retrieve bearer token
 */
async function getShiprocketToken(): Promise<string | null> {
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

        const data: any = await response.json();
        cachedToken = data.token;
        tokenExpiry = Date.now() + 240 * 60 * 1000; // 4 hours
        return cachedToken;
    } catch (err) {
        console.error('Error authenticating with Shiprocket:', err);
        return null;
    }
}

/**
 * Create order and shipment in Shiprocket
 */
export async function createShiprocketOrder(orderId: string, orderData: any): Promise<void> {
    const token = await getShiprocketToken();
    if (!token) return;

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
            order_items: orderData.items.map((item: any) => ({
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

        const result: any = await response.json();

        if (response.ok && result.order_id) {
            await admin.firestore().collection('orders').doc(orderId).update({
                shiprocket_order_id: String(result.order_id),
                shiprocket_shipment_id: String(result.shipment_id || ''),
                shipping_status: 'READY_TO_SHIP',
                updated_at: new Date().toISOString()
            });
            console.log(`Shiprocket order created for ${orderData.order_number}`);
        } else {
            console.error('Shiprocket order creation failed:', result);
        }
    } catch (err) {
        console.error('Error communicating with Shiprocket:', err);
    }
}
