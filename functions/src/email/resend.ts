import { Resend } from 'resend';

export async function sendOrderConfirmationEmail(order: any): Promise<void> {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY not configured. Skipping confirmation email.');
        return;
    }

    try {
        const resend = new Resend(resendApiKey);

        const itemsHtml = order.items.map((item: any) => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong>${item.name}</strong><br>
                    <span style="font-size: 12px; color: #666;">Size: ${item.size} ${item.color ? `| Color: ${item.color}` : ''} | Qty: ${item.quantity}</span>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                    ₹${item.price * item.quantity}
                </td>
            </tr>
        `).join('');

        await resend.emails.send({
            from: 'OLIRAA <orders@oliraa.com>',
            to: order.email,
            subject: `Order Confirmed: #${order.order_number} - OLIRAA`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D3028;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #737c60; letter-spacing: 2px; margin: 0;">OLIRAA</h1>
                        <p style="font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Modesty Made Modern</p>
                    </div>

                    <div style="background-color: #fff8ed; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                        <h2 style="margin-top: 0; font-size: 18px;">Thank You for Your Order, ${order.customer_name}!</h2>
                        <p style="font-size: 14px; color: #555;">We have received your order <strong>#${order.order_number}</strong> and are preparing it with utmost care.</p>
                    </div>

                    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #737c60;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                        ${itemsHtml}
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right;">₹${order.subtotal}</td>
                        </tr>
                        ${order.discount_amount > 0 ? `
                        <tr>
                            <td style="padding: 8px 0; color: #2e7d32;">Discount (${order.coupon_code || 'Promo'})</td>
                            <td style="padding: 8px 0; text-align: right; color: #2e7d32;">-₹${order.discount_amount}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 8px 0;">Shipping</td>
                            <td style="padding: 8px 0; text-align: right;">${order.shipping_fee > 0 ? `₹${order.shipping_fee}` : 'Free'}</td>
                        </tr>
                        <tr style="border-top: 2px solid #2D3028;">
                            <td style="padding: 12px 0; font-size: 16px; font-weight: bold;">Total</td>
                            <td style="padding: 12px 0; font-size: 16px; font-weight: bold; text-align: right;">₹${order.total}</td>
                        </tr>
                    </table>

                    <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; font-size: 13px; color: #555;">
                        <strong>Shipping Address:</strong><br>
                        ${order.customer_name}<br>
                        ${order.address}<br>
                        Phone: ${order.phone}
                    </div>

                    <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #999;">
                        If you have any questions, contact us via WhatsApp or reply to this email.<br>
                        © ${new Date().getFullYear()} OLIRAA. All rights reserved.
                    </div>
                </div>
            `
        });
        console.log(`Order confirmation email sent to ${order.email}`);
    } catch (err) {
        console.error('Failed to send order email:', err);
    }
}
