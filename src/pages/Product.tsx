import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../services/productService';
import { getProductReviews } from '../services/reviewService';
import type { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import Reviews from '../components/Reviews';

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [activeImage, setActiveImage] = useState<string>('');
    const { addToCart } = useCart();
    const [error, setError] = useState<string | null>(null);

    // Review Stats
    const [reviewStats, setReviewStats] = useState({ count: 0, average: 0 });

    useEffect(() => {
        if (slug) fetchProduct(slug);
    }, [slug]);

    useEffect(() => {
        if (product?.id) fetchReviewStats(product.id);
    }, [product]);

    const fetchProduct = async (productSlug: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProductBySlug(productSlug);
            if (!data) {
                setError('Product not found');
                return;
            }

            const images = data.images && data.images.length > 0
                ? data.images
                : [{ id: 'placeholder', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000', order_index: 0 }];

            setProduct({ ...data, images });
            setActiveImage(images[0].image_url);

            // Default size selection if available
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0]);
            }
            if (data.colors && data.colors.length > 0) {
                setSelectedColor(data.colors[0]);
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewStats = async (productId: string) => {
        try {
            const reviews = await getProductReviews(productId);
            if (reviews && reviews.length > 0) {
                const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
                setReviewStats({
                    count: reviews.length,
                    average: Math.round((total / reviews.length) * 10) / 10
                });
            }
        } catch (e) {
            console.error('Error fetching review stats:', e);
        }
    };

    // Find active variant matching selected size and color
    const matchedVariant: ProductVariant | undefined = product?.variants?.find(v => {
        const matchSize = !v.size || v.size === selectedSize;
        const matchColor = !selectedColor || !v.color || v.color === selectedColor;
        return matchSize && matchColor;
    });

    const currentStock = matchedVariant ? matchedVariant.stock : (product?.stock || 0);
    const isOutOfStock = currentStock <= 0;

    const handleAddToCart = () => {
        if (!product) return;
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, selectedSize, quantity, selectedColor, matchedVariant?.id);
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, selectedSize, quantity, selectedColor, matchedVariant?.id);
        navigate('/checkout');
    };

    const scrollToReviews = () => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral">
                <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
                <Link to="/shop" className="btn-primary">Back to Shop</Link>
            </div>
        );
    }

    const price = matchedVariant?.price || product.sale_price || product.price;
    const originalPrice = (product.sale_price || matchedVariant?.price) ? (product.compare_at_price || product.price) : null;
    const discount = originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-neutral pb-20 overflow-x-hidden">
            <div className="container-custom pt-8 pb-16">
                {/* Breadcrumbs */}
                <div className="text-xs tracking-widest uppercase text-gray-500 mb-8 flex flex-wrap items-center gap-y-2">
                    <Link to="/" className="hover:text-black transition-colors whitespace-nowrap">Home</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <Link to="/shop" className="hover:text-black transition-colors whitespace-nowrap">Shop</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-dark font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-20">
                    {/* Image Section */}
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row-reverse lg:gap-4 lg:sticky lg:top-28 w-full">
                        {/* Main Image */}
                        <div className="w-full lg:flex-1 aspect-[3/4] bg-gray-100 overflow-hidden relative group">
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
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:flex-col lg:w-20 lg:h-[30rem] lg:overflow-y-auto lg:pb-0 w-full h-auto">
                                {product.images.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`w-20 lg:w-full aspect-[3/4] overflow-hidden border transition-all flex-shrink-0 ${activeImage === img.image_url ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col h-full w-full">
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h1 className="text-2xl lg:text-4xl font-serif text-dark mb-2 leading-tight break-words">{product.name}</h1>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xl font-medium text-dark">₹{price}</span>
                                    {originalPrice && originalPrice > price && (
                                        <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>
                                    )}
                                </div>
                                <div className="h-4 w-px bg-gray-200"></div>
                                <div
                                    className="flex items-center text-yellow-500 text-xs gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={scrollToReviews}
                                >
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < Math.round(reviewStats.average) ? "currentColor" : "none"}
                                                className={i < Math.round(reviewStats.average) ? "text-yellow-400" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-400 ml-1 underline decoration-gray-300 underline-offset-4 decoration-1 hover:text-dark">
                                        {reviewStats.count} Reviews
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Color Selector (if product has colors) */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <span className="font-semibold text-xs uppercase tracking-widest text-gray-900 mb-3 block">
                                    Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedColor === color
                                                ? 'bg-dark text-white border-dark'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Select Size */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-xs uppercase tracking-widest text-gray-900">Size</span>
                                <Link to="/size-guide" className="text-xs text-gray-500 underline underline-offset-4 hover:text-black transition-colors">Size Guide</Link>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map(size => {
                                    // Check variant stock for this specific size
                                    const variantForSize = product.variants?.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
                                    const sizeOutOfStock = variantForSize ? variantForSize.stock <= 0 : false;

                                    return (
                                        <button
                                            key={size}
                                            disabled={sizeOutOfStock}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 min-w-[3rem] px-3 flex items-center justify-center border text-sm transition-all ${selectedSize === size
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : sizeOutOfStock
                                                    ? 'bg-gray-100 text-gray-300 border-gray-200 line-through cursor-not-allowed'
                                                    : 'bg-white text-dark border-gray-200 hover:border-primary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-8">
                            <span className="font-semibold text-xs uppercase tracking-widest text-gray-900 mb-3 block">Quantity</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 h-10 w-32">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="flex-1 h-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    >
                                        -
                                    </button>
                                    <div className="w-10 text-center text-sm font-medium">{quantity}</div>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(Math.max(1, currentStock), q + 1))}
                                        disabled={quantity >= currentStock}
                                        className="flex-1 h-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <span className="text-xs text-red-600 font-medium mt-2 block">
                                {currentStock > 0
                                    ? currentStock < 10
                                        ? `Only ${currentStock} pieces left in stock!`
                                        : `Available stock: ${currentStock} pieces`
                                    : 'Out of Stock'
                                }
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="flex-1 bg-primary text-white py-4 font-medium hover:bg-secondary transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="flex-1 bg-dark text-white py-4 font-medium hover:bg-opacity-90 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Details Accordion */}
                        <div className="divide-y divide-gray-100 border-t border-gray-100 w-full">
                            <details className="group py-4 cursor-pointer" open>
                                <summary className="flex items-center justify-between font-medium text-sm text-dark list-none">
                                    Product Details
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-500 text-sm mt-3 leading-relaxed space-y-2">
                                    <div className="prose text-gray-500 mb-4 max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                                    {product.fabric && <p><span className="text-dark font-medium">Fabric:</span> {product.fabric}</p>}
                                    {product.care && <p><span className="text-dark font-medium">Care:</span> {product.care}</p>}
                                    {product.sku && <p><span className="text-dark font-medium">SKU:</span> {product.sku}</p>}
                                </div>
                            </details>
                            <details className="group py-4 cursor-pointer">
                                <summary className="flex items-center justify-between font-medium text-sm text-dark list-none">
                                    Shipping & Returns
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-500 text-sm mt-3 leading-relaxed">
                                    <div className="flex items-start gap-3 mb-2">
                                        <Truck size={18} className="mt-0.5 text-primary" />
                                        <span>Free standard shipping on orders over ₹2000. Estimated delivery 3-5 business days via Shiprocket.</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck size={18} className="mt-0.5 text-primary" />
                                        <span>Hassle-free returns within 7 days of delivery.</span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <Reviews productId={product.id} />
            </div>
        </div>
    );
};

export default ProductPage;
