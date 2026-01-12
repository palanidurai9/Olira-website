import React from 'react';
import { motion } from 'framer-motion';
import aboutStoryImage from '../assets/about-story.png';

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
                        Modesty, made modern. Redefining Indian aesthetics for the modern woman.
                    </motion.p>
                </div>
            </div>

            {/* Narrative Section */}
            <div className="container-custom py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-dark">Modesty, Made Modern</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed text-justify">
                            <p>
                                <span className="font-bold text-primary">Oliraa</span> is an Indo-contemporary womenswear label founded by sisters <span className="font-medium text-dark">Arivunila Ravichandrran</span> and <span className="font-medium text-dark">Yogavani Ravichandrran</span>, shaped by a shared vision to redefine Indian aesthetics for the modern woman.
                            </p>
                            <p>
                                At Oliraa, we believe modesty is not restrictive—it is powerful. It is fluid, expressive, and deeply personal. Our philosophy, <span className="italic">"Modesty, made modern"</span>, reflects our belief that our designs blur the lines between traditional and modern. We believe Indian women can own both tradition and modernity effortlessly.
                            </p>
                            <p>
                                What sets Oliraa apart is our focus on clean silhouettes, refined details, and a balanced blend of tradition and modernity. Each outfit is thoughtfully designed to feel wearable, comfortable, and relevant—whether styled traditionally, worn in a modern way, or paired with western elements—proving that Indian wear is not bound by labels.
                            </p>
                            <p>
                                Oliraa is for women who express confidence quietly. Women who value heritage but dress for the present. Women who believe modesty and modernity are not opposites, but beautifully intertwined.
                            </p>
                            <div className="pt-4 border-l-4 border-primary pl-4 my-6">
                                <p className="text-lg font-serif italic text-dark">
                                    "This is not fashion driven by noise. This is style shaped by meaning. This is Oliraa."
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 h-[600px] bg-gray-100 rounded-lg overflow-hidden relative shadow-xl">
                        <img
                            src={aboutStoryImage}
                            alt="The Oliraa Woman"
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
