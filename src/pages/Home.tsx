
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Craftsmanship from '../components/Craftsmanship';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch New Arrivals (Top 4)
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*, product_images(*)')
                    .order('launch_date', { ascending: false })
                    .limit(4);

                // Fetch Categories
                const { data: categoriesData } = await supabase
                    .from('categories')
                    .select('*');

                if (productsData) {
                    const mappedProducts = productsData.map((p: any) => ({
                        ...p,
                        images: p.product_images
                    }));
                    setNewArrivals(mappedProducts);
                }

                if (categoriesData) {
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
                <Hero />

                {/* New Arrivals Section */}
                <section className="section-padding bg-white">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <span className="text-secondary text-sm font-medium tracking-widest uppercase mb-2 block animate-fade-in-up">Latest Drops</span>
                            <h2 className="text-4xl font-serif font-bold text-dark animate-fade-in-up delay-100">New Arrivals</h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="animate-pulse">
                                        <div className="bg-gray-100 aspect-[3/4] rounded-lg mb-4"></div>
                                        <div className="bg-gray-100 h-4 w-3/4 mx-auto mb-2"></div>
                                        <div className="bg-gray-100 h-4 w-1/4 mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        ) : newArrivals.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {newArrivals.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400">No new arrivals yet. Check back soon!</p>
                        )}

                        <div className="text-center mt-12">
                            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
                                View All Collections <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="section-padding bg-neutral">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-serif font-bold text-dark">Shop by Category</h2>
                            <p className="text-gray-500 mt-2">Curated styles for every occasion</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="bg-white h-40 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-6">
                                {categories.map(category => (
                                    <Link
                                        key={category.id}
                                        to={`/shop`} // Ideally link to filtered view
                                        className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all w-40 h-40 md:w-56 md:h-64 flex flex-col items-center justify-center text-center p-4 border border-gray-100"
                                    >
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                            {/* If we had category images, we'd use them here. For now, first letter. */}
                                            {category.image_url ? (
                                                <img src={category.image_url} alt={category.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <span className="text-2xl font-serif text-primary font-bold">{category.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-dark group-hover:text-primary transition-colors">{category.name}</h3>
                                        <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center">
                                            Explore <ArrowRight size={12} className="ml-1" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <Craftsmanship />
            </main>
        </div>
    );
};

export default Home;
