import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-primary/10 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="relative z-10 text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-dark mb-4"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium"
                    >
                        Modesty Made Modern. Redefining elegance for the contemporary woman.
                    </motion.p>
                </div>
            </div>

            {/* Narrative Section */}
            <div className="container-custom py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-dark">The Art of Elegance</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                At <span className="font-bold text-primary">Oliraa</span>, we believe that modesty is not just a style choice—it's a statement of grace, confidence, and individuality. Founded with a vision to bridge the gap between traditional values and modern aesthetics, Oliraa is more than just a clothing brand; it's a celebration of the modern woman.
                            </p>
                            <p>
                                Our journey began with a simple observation: the search for high-quality, fashionable, and modest clothing was often a compromise. We set out to change that. Every piece in our collection is thoughtfully designed to offer the perfect blend of coverage, comfort, and chic style.
                            </p>
                            <p>
                                From our hand-picked fabrics to our intricate detailing, we pay attention to the little things that make a big difference. Whether it's a flowing saree for a festive occasion or a tailored kurti for everyday wear, Oliraa promises quality that you can feel and style that you can own.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 h-[500px] bg-gray-100 rounded-lg overflow-hidden relative">
                        <img
                            src="https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=2070&auto=format&fit=crop"
                            alt="Oliraa Fashion"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-primary/5 py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-dark mb-4">Our Core Values</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Driven by passion, defined by quality.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">Q</div>
                            <h3 className="text-xl font-bold text-dark mb-3">Uncompromised Quality</h3>
                            <p className="text-gray-600 text-sm">We source only the finest fabrics to ensure comfort and durability in every stitch.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">M</div>
                            <h3 className="text-xl font-bold text-dark mb-3">Modern Modesty</h3>
                            <p className="text-gray-600 text-sm">Contemporary designs that respect your values without sacrificing style.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">S</div>
                            <h3 className="text-xl font-bold text-dark mb-3">Sustainable Fashion</h3>
                            <p className="text-gray-600 text-sm">Committed to ethical production practices and reducing our environmental footprint.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter / CTA */}
            <div className="container-custom py-24 text-center">
                <h2 className="text-3xl font-serif font-bold text-dark mb-6">Join the Oliraa Family</h2>
                <p className="text-gray-600 max-w-xl mx-auto mb-8">
                    Stay updated with our latest collections, exclusive offers, and style tips.
                </p>
                {/* Placeholder for Newsletter Form */}
                <div className="max-w-md mx-auto flex gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                    />
                    <button className="bg-dark text-white px-6 py-3 rounded-md font-medium hover:bg-primary transition-colors">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default About;
