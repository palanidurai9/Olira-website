
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import SearchModal from './SearchModal';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cart, setIsCartOpen } = useCart();

    return (
        <>
            {/* Announcement Bar - Luxury Minimal */}
            <div className="bg-secondary text-neutral text-[10px] md:text-[11px] text-center py-1.5 tracking-[0.2em] uppercase font-bold">
                Free Shipping on Orders Above ₹2000 | Modesty Made Modern
            </div>

            {/* Main Header - Editorial & Premium */}
            <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/5 transition-all duration-300">
                <div className="container-custom py-3 flex items-center justify-between">

                    {/* Mobile Menu Button - Sleek */}
                    <button
                        className="md:hidden p-1 text-white/90 hover:text-secondary transition-colors"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu size={22} strokeWidth={1.5} />
                    </button>

                    {/* Logo - Centered Mobile, Left Desktop */}
                    <Link to="/" className="w-28 md:w-36 opacity-100 hover:opacity-90 transition-opacity">
                        <img src="/src/assets/olira-text-logo.png" alt="Oliraa" className="w-full h-auto object-contain " />
                    </Link>

                    {/* Desktop Navigation - Editorial Style */}
                    <nav className="hidden md:flex items-center space-x-10">
                        {/* Standard Links */}
                        <Link to="/" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        {/* Shop with Dropdown Hover - Renamed to Women */}
                        <div className="relative group">
                            <Link to="/shop" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 py-4">
                                Women
                            </Link>

                            {/* Dropdown Menu - Sleek & Minimal */}
                            <div className="absolute top-full left-0 mt-3 w-48 bg-neutral border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 rounded-sm overflow-hidden">
                                <div className="py-2 flex flex-col">
                                    {[
                                        { name: 'All Women', path: '/shop' },
                                        { name: 'Maxi Dresses', path: '/shop?category=maxi-dress' },
                                        { name: 'Kurti Sets', path: '/shop?category=kurti-set' },
                                        { name: 'Tops', path: '/shop?category=tops' },
                                        { name: 'Shirts', path: '/shop?category=shirts' },
                                    ].map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            to={subItem.path}
                                            className="px-5 py-2.5 text-xs text-gray-500 hover:bg-primary hover:text-white transition-colors uppercase tracking-wider text-left"
                                        >
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Maternity Link - Separate as requested */}
                        <Link to="/shop?category=maternity-dress" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Maternity
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link to="/new-arrivals" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            New Arrivals
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link to="/about" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Our Story
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link to="/contact" className="text-white/90 hover:text-white font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Contact
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </nav>

                    {/* Icons - Minimalist */}
                    <div className="flex items-center space-x-5 md:space-x-7">
                        {/* Search Button */}
                        <button
                            className="text-white/90 hover:text-white transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search size={20} strokeWidth={1.5} />
                        </button>

                        {/* Phone Button */}
                        <a
                            href="tel:+919876543210"
                            className="hidden md:block text-white/90 hover:text-white transition-colors"
                            title="Call us: +91 98765 43210"
                        >
                            <Phone size={20} strokeWidth={1.5} />
                        </a>

                        {/* Cart Button */}
                        <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                            <ShoppingBag size={20} strokeWidth={1.5} className="text-white/90 group-hover:text-white transition-colors" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-primary text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>


            </header>

            {/* Mobile Menu Overlay - Moved outside header to avoid stacking context issues */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-[60] md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-neutral z-[70] shadow-2xl md:hidden flex flex-col"
                        >
                            <div className="p-5 flex justify-between items-center bg-primary">
                                <img src="/src/assets/olira-text-logo.png" alt="Oliraa" className="h-6 w-auto object-contain" />
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/80 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex flex-col p-6 space-y-4">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Home</Link>
                                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Women</Link>
                                <Link to="/shop?category=maternity-dress" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Maternity</Link>
                                <Link to="/new-arrivals" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">New Arrivals</Link>
                                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Our Story</Link>
                                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Contact</Link>
                            </nav>
                            <div className="mt-auto p-6 bg-gray-50">
                                <p className="text-sm text-gray-500 mb-2">Need help?</p>
                                <a href="tel:+919876543210" className="flex items-center text-primary font-medium">
                                    <Phone size={18} className="mr-2" />
                                    +91 98765 43210
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;
