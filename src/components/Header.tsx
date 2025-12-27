
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cart, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would implement actual search redirection, e.g., navigate to /shop?search=query
        console.log('Searching for:', searchQuery);
        setIsSearchOpen(false);
    };

    return (
        <>
            {/* Announcement Bar - Luxury Minimal */}
            <div className="bg-secondary text-primary text-[10px] md:text-[11px] text-center py-1.5 tracking-[0.2em] uppercase font-medium">
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
                        <img src="/src/assets/olira-text-logo.png" alt="OLIRA" className="w-full h-auto object-contain brightness-0 invert" />
                    </Link>

                    {/* Desktop Navigation - Editorial Style */}
                    <nav className="hidden md:flex items-center space-x-10">
                        {/* Standard Links */}
                        <Link to="/" className="text-white/90 hover:text-white font-medium text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        {/* Shop with Dropdown Hover */}
                        <div className="relative group">
                            <Link to="/shop" className="text-white/90 hover:text-white font-medium text-[11px] uppercase tracking-[0.15em] transition-all duration-300 py-4">
                                Shop Collection
                            </Link>

                            {/* Dropdown Menu - Sleek & Minimal */}
                            <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 rounded-sm overflow-hidden">
                                <div className="py-2 flex flex-col">
                                    {[
                                        { name: 'Sarees', path: '/sarees' },
                                        { name: 'Kurtis', path: '/kurtis' },
                                        { name: 'Dresses', path: '/dresses' },
                                        { name: 'Co-Ord Sets', path: '/coord-sets' },
                                        { name: 'All Products', path: '/shop' },
                                    ].map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            to={subItem.path}
                                            className="px-5 py-2.5 text-xs text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors uppercase tracking-wider text-left"
                                        >
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link to="/new-arrivals" className="text-white/90 hover:text-white font-medium text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            New Arrivals
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link to="/about" className="text-white/90 hover:text-white font-medium text-[11px] uppercase tracking-[0.15em] transition-all duration-300 relative group">
                            Our Story
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

                {/* Search Bar Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden"
                        >
                            <div className="container-custom py-4">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full bg-gray-50 border-none rounded-md px-4 py-3 pl-12 focus:ring-1 focus:ring-primary text-dark"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <button
                                        type="button"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-50 md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white z-[60] shadow-2xl md:hidden flex flex-col"
                        >
                            <div className="p-5 flex justify-between items-center border-b border-gray-100">
                                <span className="text-2xl font-serif font-bold text-primary">OLIRA</span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex flex-col p-6 space-y-4">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Home</Link>
                                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Shop Collection</Link>
                                <Link to="/new-arrivals" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">New Arrivals</Link>
                                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-dark border-b border-gray-50 pb-2">Our Story</Link>
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
        </>
    );
};

export default Header;
