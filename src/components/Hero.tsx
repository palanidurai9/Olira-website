
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import heroImg from '../assets/hero-kurti.png';

const Hero: React.FC = () => {
    return (
        <div className="relative h-[85vh] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroImg}
                    alt="Elegant Modest Fashion"
                    className="w-full h-full object-cover object-top"
                />
                {/* Dark overlay for text readability - Increased opacity for premium feel */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="container-custom relative z-10 text-center text-white pt-20">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xs tracking-widest uppercase text-white/80 mb-2"
                >
                    NEW COLLECTION
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 tracking-tight leading-none"
                >
                    Modesty Made <br className="hidden md:block" /> Modern
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-xl mx-auto text-lg md:text-xl text-gray-100 mb-10 font-light"
                >
                    Discover refined silhouettes and premium fabrics designed for the contemporary woman.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <Link
                        to="/shop"
                        className="inline-flex items-center bg-white text-dark px-8 py-3 text-xs md:text-sm uppercase tracking-widest font-medium hover:bg-secondary hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                        Discover OLIRAA <ArrowRight size={16} className="ml-2" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
