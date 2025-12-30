
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const Checkout: React.FC = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate Order Number
            const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

            // Create Order Payload
            const orderPayload = {
                order_number: orderNumber,
                customer_name: formData.fullName,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
                items: cart, // Storing full cart JSON
                total: cartTotal,
                payment_method: 'COD',
                payment_status: 'PENDING',
                order_status: 'PENDING'
            };

            const { error } = await supabase.from('orders').insert(orderPayload);

            if (error) throw error;

            // Success
            setSuccess(true);
            setTimeout(() => {
                clearCart();
                // Ideally redirect to a specific success page, but valid here too.
            }, 500);

        } catch (error: any) {
            alert('Order failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && !success) {
        // Empty cart redirect
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <button onClick={() => navigate('/shop')} className="btn-primary">Go Shopping</button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-dark mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 mb-8">Thank you, {formData.fullName}. Your order has been received and will be shipped shortly via Cash on Delivery.</p>
                    <button onClick={() => navigate('/')} className="w-full btn-outline">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container-custom py-8">
                <button onClick={() => navigate('/cart')} className="flex items-center text-gray-500 hover:text-dark mb-8 text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Cart
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <div className="flex-1">
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                            <h2 className="text-xl font-serif font-bold text-dark mb-6">Shipping Details</h2>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Full Name</label>
                                        <input
                                            type="text" name="fullName" required
                                            value={formData.fullName} onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                            placeholder="e.g. Fatima Ali"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Phone Number</label>
                                        <input
                                            type="tel" name="phone" required
                                            value={formData.phone} onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                            placeholder="e.g. 9876543210"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Email Address</label>
                                    <input
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleChange}
                                        className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                        placeholder="e.g. fatima@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Full Address</label>
                                    <textarea
                                        name="address" required
                                        value={formData.address} onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                        placeholder="Street, Building, Flat No..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">City</label>
                                        <input
                                            type="text" name="city" required
                                            value={formData.city} onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Pincode</label>
                                        <input
                                            type="text" name="pincode" required
                                            value={formData.pincode} onChange={handleChange}
                                            className="w-full border border-gray-200 p-3 rounded-md outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Payment & Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                            <h3 className="font-serif font-bold text-dark mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-4 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                                    <input type="radio" name="payment" checked readOnly className="text-primary focus:ring-primary" />
                                    <span className="ml-3 font-medium text-dark">Cash on Delivery (COD)</span>
                                </label>
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                                    <input type="radio" name="payment" disabled className="text-gray-300" />
                                    <span className="ml-3 text-gray-400">Online Payment (Coming Soon)</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="font-serif font-bold text-dark mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4 text-sm">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex justify-between text-gray-600">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{(item.sale_price || item.price) * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-lg mb-6">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full btn-primary py-4 flex items-center justify-center font-bold tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
