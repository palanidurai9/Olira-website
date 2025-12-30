
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
                <div className="text-xs tracking-widest uppercase text-gray-500 mb-8 flex items-center">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-dark font-medium line-clamp-1">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Image Section */}
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row-reverse lg:gap-4 sticky top-24">
                        {/* Main Image */}
                        <div className="flex-1 aspect-[3/4] bg-gray-100 overflow-hidden relative group">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 bg-white text-black text-[10px] uppercase font-bold px-3 py-1 tracking-widest shadow-sm">
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:flex-col lg:w-20 lg:h-[calc(4*5rem)] lg:overflow-y-auto lg:pb-0">
                                {product.images.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`w-20 aspect-[3/4] overflow-hidden border transition-all flex-shrink-0 ${activeImage === img.image_url ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.image_url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col h-full">
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h1 className="text-3xl lg:text-4xl font-serif text-dark mb-2 leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xl font-medium text-dark">₹{price}</span>
                                    {originalPrice && <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>}
                                </div>
                                <div className="h-4 w-px bg-gray-200"></div>
                                <div className="flex items-center text-yellow-500 text-xs gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" className="text-yellow-400" />)}
                                    </div>
                                    <span className="text-gray-400 ml-1 underline decoration-gray-300 underline-offset-4 decoration-1 hover:text-dark cursor-pointer">12 Reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="prose text-gray-600 mb-8 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '' }} />

                        {/* Select Size */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-xs uppercase tracking-widest text-gray-900">Size</span>
                                <button className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`h-10 min-w-[3rem] px-3 flex items-center justify-center border text-sm transition-all ${selectedSize === size
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-dark border-gray-200 hover:border-black'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-8">
                            <span className="font-semibold text-xs uppercase tracking-widest text-gray-900 mb-3 block">Quantity</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 h-10 w-32">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        -
                                    </button>
                                    <div className="w-10 text-center text-sm font-medium">{quantity}</div>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {product.stock > 0 ? `${product.stock} pieces in stock` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-black text-white py-4 font-medium hover:bg-gray-800 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button className="w-12 flex items-center justify-center border border-gray-200 hover:border-black transition-colors text-gray-400 hover:text-black">
                                <Star size={18} />
                            </button>
                        </div>

                        {/* Details Accordion (Static for now, can be dynamic) */}
                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                            <details className="group py-4 cursor-pointer">
                                <summary className="flex items-center justify-between font-medium text-sm text-dark list-none">
                                    Product Details
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-500 text-sm mt-3 leading-relaxed space-y-2">
                                    {product.fabric && <p><span className="text-dark font-medium">Fabric:</span> {product.fabric}</p>}
                                    {product.care && <p><span className="text-dark font-medium">Care:</span> {product.care}</p>}
                                    <p>SKU: {product.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </details>
                            <details className="group py-4 cursor-pointer">
                                <summary className="flex items-center justify-between font-medium text-sm text-dark list-none">
                                    Shipping & Returns
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-500 text-sm mt-3 leading-relaxed">
                                    <div className="flex items-start gap-3 mb-2">
                                        <Truck size={18} className="mt-0.5" />
                                        <span>Free standard shipping on orders over ₹1999. Estimated delivery 3-5 business days.</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck size={18} className="mt-0.5" />
                                        <span>Easy resets within 7 days of delivery.</span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
