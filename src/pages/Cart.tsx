
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    // Better Context Logic needed for Decrement:
    // Let's rewrite the Cart Page assuming we will fix the Context to have 'updateQuantity(id, newQuantity)'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="container-custom py-12 flex-grow">
                <div className="flex items-center justify-between mb-8">
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
                                        {/* Show first image or placeholder */}
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
                                                {/* Note: Update Quantity Logic to be implemented in Context */}
                                                <span className="px-4 py-1 font-medium text-dark">{item.quantity}</span>
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
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-dark">
                                        <span>Total</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
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
