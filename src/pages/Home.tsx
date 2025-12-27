
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Craftsmanship from '../components/Craftsmanship';
import Footer from '../components/Footer';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Hero />

                {/* Placeholder for New Arrivals */}
                <section className="section-padding bg-white">
                    <div className="container-custom text-center">
                        <span className="text-secondary text-sm font-medium tracking-widest uppercase mb-2 block">Latest Drops</span>
                        <h2 className="text-4xl font-serif font-bold text-dark mb-12">New Arrivals</h2>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                            Product Grid Component Coming Soon
                        </div>
                    </div>
                </section>

                {/* Placeholder for Categories */}
                <section className="section-padding bg-neutral">
                    <div className="container-custom text-center">
                        <h2 className="text-3xl font-serif font-bold text-dark mb-12">Shop by Category</h2>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-white text-gray-400">
                            Category Grid Component Coming Soon
                        </div>
                    </div>
                </section>

                <Craftsmanship />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
