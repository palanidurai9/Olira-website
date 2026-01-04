
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, X, Tag } from 'lucide-react';

const Cart: React.FC = () => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartSubtotal,
        coupon,
        discountAmount,
        applyCoupon,
        removeCoupon
    } = useCart();

    const navigate = useNavigate();
    const [couponInput, setCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponInput.trim()) return;

        setIsApplying(true);
        setCouponMessage(null);

        const result = await applyCoupon(couponInput.trim());

        setIsApplying(false);
        setCouponMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
        });

        if (result.success) {
            setCouponInput('');
        }
    };

    return (
        <div className="min-h-screen bg-neutral flex flex-col">

            <div className="container-custom py-12 flex-grow">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-serif font-bold text-dark">Shopping Cart</h1>
                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-sm text-red-500 hover:text-red-600 font-medium underline"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <ShoppingBag size={64} strokeWidth={1} className="text-gray-300 mb-6" />
                        <h2 className="text-3xl font-serif font-bold text-dark mb-3">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything yet. Explore our collection to find your perfect style.</p>
                        <Link to="/shop" className="btn-primary inline-flex items-center px-8 py-3">
                            Start Shopping <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {cart.map((item) => (
                                <div key={item.cartId} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex gap-4 items-center">
                                    <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.images?.[0]?.image_url || '/src/assets/product-placeholder.png'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-dark">{item.name}</h3>
                                                <p className="text-sm text-gray-500">Size: {item.selectedSize} | Fabric: {item.fabric}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center border border-gray-200 rounded-md">
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, -1)}
                                                    className="px-3 py-1 text-gray-500 hover:bg-gray-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 py-1 font-medium text-dark min-w-[20px] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, 1)}
                                                    className="px-3 py-1 text-gray-500 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <span className="block font-bold text-dark">₹{(item.sale_price || item.price) * item.quantity}</span>
                                                {item.quantity > 1 && (
                                                    <span className="text-xs text-gray-400">₹{item.sale_price || item.price} each</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-96">
                            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-24">
                                <h3 className="font-serif font-bold text-lg text-dark mb-4">Order Summary</h3>

                                <div className="space-y-3 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{cartSubtotal}</span>
                                    </div>

                                    {/* Discount Row */}
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Discount {coupon && `(${coupon.code})`}</span>
                                            <span>-₹{discountAmount}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-dark">
                                        <span>Total</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                </div>

                                {/* Coupon Section */}
                                <div className="mb-6 pt-4 border-t border-gray-100">
                                    {coupon ? (
                                        <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <Tag size={16} />
                                                <span className="font-medium text-sm">{coupon.code} applied</span>
                                            </div>
                                            <button
                                                onClick={removeCoupon}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApplyCoupon} className="relative">
                                            <input
                                                type="text"
                                                placeholder="Coupon Code"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                className="w-full pl-3 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isApplying || !couponInput}
                                                className="absolute right-1 top-1 bottom-1 px-3 bg-dark text-white rounded text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                            >
                                                {isApplying ? '...' : 'APPLY'}
                                            </button>
                                        </form>
                                    )}
                                    {couponMessage && !coupon && (
                                        <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full btn-primary flex justify-center items-center py-4"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="mt-4 text-xs text-center text-gray-400">
                                    <p>Secure Checkout powered by Supabase</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
