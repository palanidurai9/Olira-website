
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, ShoppingBag } from 'lucide-react';

interface ShopProps {
    forcedCategory?: string;
    pageTitle?: string;
    pageDescription?: string;
}

const Shop: React.FC<ShopProps> = ({ forcedCategory, pageTitle, pageDescription }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>(forcedCategory || 'all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        if (forcedCategory) {
            setSelectedCategory(forcedCategory);
        }
    }, [forcedCategory]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: catData } = await supabase.from('categories').select('*');

        let query = supabase.from('products').select('*');

        // Only show launched products
        const today = new Date().toISOString().split('T')[0];
        query = query.lte('launch_date', today);

        const { data: prodData } = await query;

        if (catData) setCategories(catData);
        if (prodData) setProducts(prodData);
        setLoading(false);
    };

    // Derived state for filtering/sorting
    const filteredProducts = products
        .filter(p => selectedCategory === 'all' || p.category_id === selectedCategory)
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            // newest default
            return new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime();
        });

    return (
        <div className="min-h-screen bg-white">

            {/* Header Banner */}
            <div className="bg-neutral py-12 md:py-20 text-center px-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-dark mb-4">{pageTitle || 'The Collection'}</h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base font-light">
                    {pageDescription || 'Explore our latest releases, designed with modesty and modernity in mind.'}
                </p>
            </div>

            <div className="container-custom py-12">
                {/* Desktop Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    {/* Categories (Desktop) */}
                    <div className="hidden md:flex items-center space-x-6 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`text-sm uppercase tracking-wide transition-colors ${selectedCategory === 'all' ? 'text-primary font-bold border-b-2 border-primary' : 'text-gray-500 hover:text-dark'}`}
                        >
                            All View
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`text-sm uppercase tracking-wide whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'text-primary font-bold border-b-2 border-primary' : 'text-gray-500 hover:text-dark'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="md:hidden flex items-center justify-center space-x-2 w-full border border-gray-200 py-3 text-sm uppercase font-medium"
                    >
                        <Filter size={16} /> <span>Filter & Sort</span>
                    </button>

                    {/* Sort Dropdown */}
                    <div className="hidden md:flex items-center space-x-2 relative group">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm font-medium text-dark bg-transparent border-none outline-none cursor-pointer hover:text-primary pr-4"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Filters Panel */}
                {mobileFiltersOpen && (
                    <div className="md:hidden bg-gray-50 p-4 rounded-lg mb-8 animate-fade-in">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2 text-sm uppercase">Category</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-3 py-1 text-xs border rounded-full ${selectedCategory === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        All
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1 text-xs border rounded-full ${selectedCategory === cat.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm uppercase">Sort</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 text-sm"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <div key={n} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
                                <div className="bg-gray-200 h-4 w-3/4 mb-2 mx-auto"></div>
                                <div className="bg-gray-200 h-4 w-1/4 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-500">No products found</h3>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
