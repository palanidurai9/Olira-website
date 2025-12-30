import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    // Prevent body scroll when cart is open
    React.useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-serif font-bold text-dark flex items-center">
                                <ShoppingBag className="mr-2" size={20} />
                                Your Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-50"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <p className="text-gray-500">Your cart is empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-primary font-medium hover:text-secondary underline underline-offset-4"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cartId} className="flex gap-4">
                                        <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                            <img
                                                src={item.images?.[0]?.image_url || 'https://placehold.co/400x600'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-dark line-clamp-2">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.cartId)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Size: {item.selectedSize}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-gray-200 rounded">
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, -1)}
                                                        disabled={item.quantity <= 1}
                                                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 py-1 text-sm text-gray-600 min-w-[2rem] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-dark">
                                                        ₹{(item.sale_price || item.price) * item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-xl font-bold text-primary">₹{cartTotal}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 text-center">
                                    Shipping & taxes calculated at checkout
                                </p>
                                <Link
                                    to="/checkout"
                                    onClick={() => setIsCartOpen(false)}
                                    className="block w-full bg-primary text-white text-center py-3.5 rounded-sm font-medium hover:bg-dark transition-all uppercase tracking-widest text-sm"
                                >
                                    Checkout Now
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={() => setIsCartOpen(false)}
                                    className="block w-full text-center py-2.5 mt-2 text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    View Cart
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
