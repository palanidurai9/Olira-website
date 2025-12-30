
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Star, Truck, ShieldCheck } from 'lucide-react';

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [activeImage, setActiveImage] = useState<string>('');
    const { addToCart } = useCart();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) fetchProduct(slug);
    }, [slug]);

    const fetchProduct = async (slug: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, product_images(*)')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            // Transform data to match interface if needed (mock logic for images since schema is separate)
            // For now, assuming product_images array comes joined or we use a placeholder if empty
            const images = data.product_images?.length ? data.product_images : [{ image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000' }];

            setProduct({ ...data, images });
            setActiveImage(images[0].image_url);
        } catch (err) {
            console.error(err);
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, selectedSize, quantity);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
            <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
    );

    const price = product.sale_price || product.price;
    const originalPrice = product.sale_price ? product.price : null;
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-white pb-20">

            <div className="container-custom pt-8 pb-16">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-400 mb-8 flex items-center">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/shop" className="hover:text-primary">Shop</Link>
                    <span className="mx-2">/</span>
                    <span className="text-dark font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative group">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`w-20 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img.image_url ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img.image_url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-end gap-3">
                                <span className="text-2xl font-bold text-dark">₹{price}</span>
                                {originalPrice && <span className="text-lg text-gray-400 line-through decoration-1">₹{originalPrice}</span>}
                            </div>
                            {/* Placeholder Rating */}
                            <div className="flex items-center text-yellow-500 text-sm">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <span className="text-gray-400 ml-2">(12 reviews)</span>
                            </div>
                        </div>

                        <div className="prose text-gray-600 mb-8 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />

                        {/* Attributes */}
                        <div className="space-y-4 mb-8">
                            {(product.fabric || product.care) && (
                                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-100">
                                    {product.fabric && <p><span className="font-semibold text-dark w-20 inline-block">Fabric:</span> {product.fabric}</p>}
                                    {product.care && <p><span className="font-semibold text-dark w-20 inline-block">Care:</span> {product.care}</p>}
                                </div>
                            )}
                        </div>

                        {/* Selector */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-sm uppercase tracking-wide">Select Size</span>
                                <button className="text-xs text-primary underline">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-12 w-12 flex items-center justify-center border font-medium transition-all rounded-md ${selectedSize === size ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-dark border-gray-200 hover:border-dark'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-sm uppercase tracking-wide">Quantity</span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 border border-gray-200 rounded-l-md flex items-center justify-center hover:bg-gray-50 text-dark"
                                >
                                    -
                                </button>
                                <div className="w-12 h-10 border-t border-b border-gray-200 flex items-center justify-center font-medium text-dark">
                                    {quantity}
                                </div>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    className="w-10 h-10 border border-gray-200 rounded-r-md flex items-center justify-center hover:bg-gray-50 text-dark"
                                >
                                    +
                                </button>
                                <span className="ml-4 text-xs text-gray-500">
                                    {product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-primary text-white py-4 rounded-lg font-medium hover:bg-secondary transition-all active:scale-[98%] shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
                            >
                                Add to Cart
                            </button>
                            {/* Wishlist Button Placeholder */}
                            <button className="w-14 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Star size={20} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <Truck size={20} className="text-dark" />
                                <span>Free Shipping above ₹1999</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-dark" />
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
