
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

import { supabase } from '../lib/supabase';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);


    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchProducts();
        } else {
            document.body.style.overflow = 'unset';
            // Clear search when closed if desired, or keep state
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchProducts = async () => {
        // data field mapping for joins might depend on exact setup (images:product_images vs just product_images)
        // Adjusting query to be safe, assuming foreign key setup matches the types or standard conventions
        // If product_images is the table name and product_id is the FK.
        const { data, error } = await supabase
            .from('products')
            .select('*, images:product_images(*)')
            .order('launch_date', { ascending: false });

        if (!error && data) {
            setProducts(data);
        }
    };

    // Derived Lists
    const newArrivals = React.useMemo(() => {
        return products.slice(0, 4);
    }, [products]);

    // Using "Featured" as a stand-in for "Recently Viewed" until history tracking is implemented
    const featuredProducts = React.useMemo(() => {
        return products.filter(p => p.featured).slice(0, 4);
    }, [products]);

    // Search Logic
    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        return products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);



    if (!mounted) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Centering Wrapper */}
                    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-16 md:pt-24 pointer-events-none">
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-[600px] bg-white rounded-lg shadow-2xl overflow-hidden max-h-[calc(100vh-8rem)] flex flex-col pointer-events-auto"
                        >
                            {/* Search Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                                <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                                <form onSubmit={handleSearch} className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-lg outline-none text-dark placeholder-gray-400 bg-transparent"
                                        autoFocus
                                    />
                                </form>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">

                                {searchQuery ? (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                            {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                                        </h3>

                                        {searchResults.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {searchResults.map((product, idx) => (
                                                    <Link to={`/product/${product.slug}`} key={`${product.id}-${idx}`} onClick={onClose} className="group cursor-pointer">
                                                        <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100 mb-2">
                                                            <img
                                                                src={product.images?.[0]?.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark line-clamp-2 leading-snug group-hover:text-primary transition-colors">{product.name}</h4>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {product.sale_price ? (
                                                                <>
                                                                    <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                                                    <span className="text-xs font-bold text-dark">₹{product.sale_price}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs font-bold text-dark">₹{product.price}</span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-lg font-medium text-gray-500">No products found</p>
                                                <p className="text-sm">Try searching for "Kurti", "Saree", or "Suit"</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Featured Products (was Recently Viewed) */}
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Featured Products</h3>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {featuredProducts.length > 0 ? featuredProducts.map(product => (
                                                    <Link to={`/product/${product.slug}`} key={product.id} onClick={onClose} className="group cursor-pointer">
                                                        <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100 mb-2">
                                                            <img
                                                                src={product.images?.[0]?.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark line-clamp-2 leading-snug group-hover:text-primary transition-colors">{product.name}</h4>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {product.sale_price ? (
                                                                <>
                                                                    <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                                                    <span className="text-xs font-bold text-dark">₹{product.sale_price}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs font-bold text-dark">₹{product.price}</span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                )) : (
                                                    <p className="text-sm text-gray-400 col-span-full">No featured products found.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* New Arrivals */}
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">New Arrivals</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {newArrivals.length > 0 ? newArrivals.map(product => (
                                                    <Link to={`/product/${product.slug}`} key={product.id} onClick={onClose} className="group cursor-pointer">
                                                        <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100 mb-2">
                                                            <img
                                                                src={product.images?.[0]?.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark line-clamp-2 leading-snug group-hover:text-primary transition-colors">{product.name}</h4>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-xs font-bold text-dark">₹{product.price.toLocaleString()}</span>
                                                        </div>
                                                    </Link>
                                                )) : (
                                                    <p className="text-sm text-gray-400 col-span-full">No products found.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
