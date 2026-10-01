import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createCodOrder, initializeRazorpayOrder, verifyAndCompleteRazorpayPayment } from '../services/orderService';
import { getUserAddresses } from '../services/authService';
import type { Address } from '../types';
import { ArrowLeft, Loader2, CheckCircle, CreditCard, Banknote } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const Checkout: React.FC = () => {
    const { cart, cartTotal, clearCart, cartSubtotal, discountAmount, coupon, applyCoupon, removeCoupon } = useCart();
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [successOrder, setSuccessOrder] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

    // Saved Addresses
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        address: '',
        city: '',
        pincode: '',
    });

    // Populate user profile info when available
    useEffect(() => {
        if (profile || user) {
            setFormData(prev => ({
                ...prev,
                fullName: prev.fullName || profile?.fullName || '',
                email: prev.email || user?.email || '',
                phone: prev.phone || profile?.phone || ''
            }));
        }

        if (user) {
            getUserAddresses(user.uid).then(addrs => {
                setSavedAddresses(addrs);
                const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
                if (defaultAddr) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: prev.fullName || defaultAddr.fullName,
                        phone: prev.phone || defaultAddr.phone,
                        address: defaultAddr.addressLine1 + (defaultAddr.addressLine2 ? `, ${defaultAddr.addressLine2}` : ''),
                        city: defaultAddr.city,
                        pincode: defaultAddr.pincode
                    }));
                }
            });
        }
    }, [user, profile]);

    // Load Razorpay script dynamically
    useEffect(() => {
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponMessage(null);

        try {
            const result = await applyCoupon(couponCode);
            if (result.success) {
                setCouponMessage({ type: 'success', text: result.message });
                setCouponCode('');
            } else {
                setCouponMessage({ type: 'error', text: result.message });
            }
        } catch {
            setCouponMessage({ type: 'error', text: 'Failed to apply coupon' });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const shippingFee = cartTotal >= 2000 || cartTotal === 0 ? 0 : 100;
    const finalPayable = cartTotal + shippingFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setLoading(true);

        const orderParams = {
            userId: user?.uid || 'guest',
            customerName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            items: cart,
            subtotal: cartSubtotal,
            discountAmount: discountAmount || 0,
            shippingFee,
            total: finalPayable,
            couponCode: coupon?.code || null,
            paymentMethod: paymentMethod === 'ONLINE' ? ('RAZORPAY' as const) : ('COD' as const)
        };

        if (paymentMethod === 'COD') {
            try {
                const created = await createCodOrder(orderParams);
                setSuccessOrder(created);
                clearCart();
            } catch (error: any) {
                alert('Order failed: ' + (error.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        } else {
            // Razorpay Payment Flow
            try {
                const razorpayData = await initializeRazorpayOrder(orderParams);
                const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

                if (!window.Razorpay) {
                    alert('Razorpay SDK failed to load. Please check your internet connection.');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: razorpayKey,
                    amount: razorpayData.amount,
                    currency: razorpayData.currency || 'INR',
                    name: 'OLIRAA',
                    description: `Order ${razorpayData.orderId}`,
                    image: '/src/assets/olira-text-logo.png',
                    order_id: razorpayData.razorpayOrderId.startsWith('order_') && razorpayData.razorpayOrderId.length > 10 ? razorpayData.razorpayOrderId : undefined,
                    prefill: {
                        name: formData.fullName,
                        email: formData.email,
                        contact: formData.phone
                    },
                    theme: {
                        color: '#737c60'
                    },
                    handler: async function (response: any) {
                        try {
                            const verifiedOrder = await verifyAndCompleteRazorpayPayment({
                                razorpayOrderId: response.razorpay_order_id || razorpayData.razorpayOrderId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature || '',
                                orderParams
                            });
                            setSuccessOrder(verifiedOrder);
                            clearCart();
                        } catch (err: any) {
                            alert('Payment verification failed: ' + err.message);
                        } finally {
                            setLoading(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    alert('Payment Failed: ' + (response.error.description || 'Transaction cancelled'));
                    setLoading(false);
                });
                rzp.open();
            } catch (err: any) {
                alert('Could not start online payment: ' + err.message);
                setLoading(false);
            }
        }
    };

    if (cart.length === 0 && !successOrder) {
        return (
            <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <button onClick={() => navigate('/shop')} className="btn-primary">Go Shopping</button>
            </div>
        );
    }

    if (successOrder) {
        return (
            <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-dark mb-1">Order Confirmed!</h2>
                    <p className="text-sm font-mono text-primary font-bold mb-4">#{successOrder.order_number}</p>
                    <p className="text-gray-500 text-sm mb-6">
                        Thank you, {formData.fullName}. We have received your order and will prepare it for shipment shortly.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left text-xs text-gray-600 mb-6 space-y-1">
                        <p><span className="font-semibold text-dark">Payment Method:</span> {successOrder.payment_method}</p>
                        <p><span className="font-semibold text-dark">Total Amount:</span> ₹{successOrder.total}</p>
                        <p><span className="font-semibold text-dark">Deliver to:</span> {successOrder.address}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {user && (
                            <button onClick={() => navigate('/account')} className="btn-primary w-full py-3">
                                View Order in Account
                            </button>
                        )}
                        <button onClick={() => navigate('/')} className="btn-outline w-full py-3">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral">
            <div className="container-custom py-8">
                <button onClick={() => navigate('/cart')} className="flex items-center text-gray-500 hover:text-dark mb-8 text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Cart
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <div className="flex-1">
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif font-bold text-dark">Shipping Details</h2>
                                {!user && (
                                    <span className="text-xs text-gray-400">
                                        Checking out as Guest or <button onClick={() => navigate('/login')} className="text-primary underline">Sign In</button>
                                    </span>
                                )}
                            </div>

                            {/* Saved Addresses quick-select */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Saved Addresses</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {savedAddresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setFormData({
                                                    fullName: addr.fullName,
                                                    phone: addr.phone,
                                                    email: formData.email,
                                                    address: addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : ''),
                                                    city: addr.city,
                                                    pincode: addr.pincode
                                                })}
                                                className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-all text-xs bg-gray-50/50"
                                            >
                                                <p className="font-bold text-dark">{addr.fullName} {addr.isDefault && <span className="text-primary font-normal">(Default)</span>}</p>
                                                <p className="text-gray-500 line-clamp-1">{addr.addressLine1}</p>
                                                <p className="text-gray-400">{addr.city} - {addr.pincode}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                <label
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <Banknote size={18} className="ml-3 text-primary" />
                                    <span className="ml-2 font-medium text-dark text-sm">Cash on Delivery (COD)</span>
                                </label>
                                <label
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'ONLINE'}
                                        onChange={() => setPaymentMethod('ONLINE')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <CreditCard size={18} className="ml-3 text-primary" />
                                    <div className="ml-2">
                                        <span className="font-medium text-dark text-sm block">UPI / Card / Netbanking</span>
                                        <span className="text-[10px] text-gray-400">Powered by Razorpay</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="font-serif font-bold text-dark mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4 text-sm max-h-60 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex justify-between text-gray-600 text-xs">
                                        <span className="truncate max-w-[200px]">{item.name} ({item.selectedSize}) x {item.quantity}</span>
                                        <span className="font-medium">₹{(item.sale_price || item.price) * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Section */}
                            <div className="py-4 border-t border-gray-100">
                                {coupon ? (
                                    <div className="bg-green-50 border border-green-100 p-3 rounded-md flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Coupon Applied</p>
                                            <p className="text-xs text-green-600 font-mono mt-1">{coupon.code}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                removeCoupon();
                                                setCouponMessage(null);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Coupon Code"
                                                className="flex-1 border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-primary uppercase placeholder:normal-case"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode}
                                                className="bg-dark text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponMessage && (
                                            <p className={`text-xs ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                                {couponMessage.text}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartSubtotal}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Discount {coupon && `(${coupon.code})`}</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    {shippingFee === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        <span>₹{shippingFee}</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-lg mb-6">
                                <span>Total Payable</span>
                                <span>₹{finalPayable}</span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full btn-primary py-4 flex items-center justify-center font-bold tracking-widest disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : paymentMethod === 'ONLINE' ? 'Pay with Razorpay' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
