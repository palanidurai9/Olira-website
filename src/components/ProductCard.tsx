
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Placeholder image if no images uploaded
    const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop';

    const isNew = new Date(product.launch_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // New if launched in last 30 days
    const isSale = !!product.sale_price && product.sale_price < product.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link to={`/product/${product.slug}`} className="block relative overflow-hidden rounded-lg bg-gray-100 aspect-[2/3]">
                {/* Badges */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col gap-1.5 md:gap-2">
                    {isNew && <span className="bg-dark text-white text-[8px] md:text-[10px] uppercase font-bold px-1.5 py-0.5 md:px-2 md:py-1 tracking-wide md:tracking-wider">New</span>}
                    {isSale && <span className="bg-red-600 text-white text-[8px] md:text-[10px] uppercase font-bold px-1.5 py-0.5 md:px-2 md:py-1 tracking-wide md:tracking-wider">Sale</span>}
                </div>

                {/* Image */}
                <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Quick Add Overlay (Desktop) */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                    <button className="w-full bg-white/90 backdrop-blur text-dark py-3 text-sm font-medium hover:bg-primary hover:text-white transition-colors uppercase tracking-widest">
                        View Details
                    </button>
                </div>
            </Link>

            <div className="mt-4 text-center">
                <Link to={`/product/${product.slug}`} title={product.name}>
                    <h3 className="text-dark font-medium text-base hover:text-primary transition-colors font-serif line-clamp-1 px-1">{product.name}</h3>
                </Link>

                <div className="flex items-center justify-center gap-2 mt-1 text-sm">
                    {isSale ? (
                        <>
                            <span className="text-gray-400 line-through">₹{product.price}</span>
                            <span className="text-red-700 font-medium">₹{product.sale_price}</span>
                        </>
                    ) : (
                        <span className="text-dark font-medium">₹{product.price}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
