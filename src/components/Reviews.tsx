import React, { useEffect, useState } from 'react';
import { getProductReviews, submitCustomerReview } from '../services/reviewService';
import type { Review } from '../types';
import { Star, MessageSquare, Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewsProps {
    productId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        comment: ''
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getProductReviews(productId);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + selectedImages.length > 3) {
                alert("You can only upload up to 3 images.");
                return;
            }
            setSelectedImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => {
            const newUrls = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]);
            return newUrls;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.comment.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await submitCustomerReview(
                productId,
                {
                    customer_name: formData.name,
                    rating: formData.rating,
                    comment: formData.comment
                },
                selectedImages
            );

            setFormData({ name: '', rating: 5, comment: '' });
            setSelectedImages([]);
            setImagePreviewUrls([]);
            fetchReviews();
            alert('Thank you! Your review has been submitted.');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate rating stats
    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div id="reviews-section" className="mt-16 pt-12 border-t border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-dark mb-8 text-center">Customer Reviews</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Rating Overview */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="text-5xl font-serif font-bold text-dark mb-2">{averageRating}</div>
                    <div className="flex text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                fill={star <= Math.round(Number(averageRating)) ? "currentColor" : "none"}
                                className={star <= Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
                </div>

                {/* Review Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-serif font-bold text-lg text-dark mb-4 flex items-center gap-2">
                        <MessageSquare size={18} className="text-primary" /> Write a Review
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={24}
                                            fill={star <= formData.rating ? "currentColor" : "none"}
                                            className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Your Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Fatima Ali"
                                className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Review</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="How was the fit, fabric, and overall look?"
                                className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Attach Photos (Optional, max 3)</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="relative w-16 h-16 border rounded-md overflow-hidden group">
                                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {selectedImages.length < 3 && (
                                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary text-gray-400 hover:text-primary transition-colors">
                                        <ImageIcon size={20} />
                                        <span className="text-[10px] mt-1">Add</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">Be the first to review this product!</div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-dark text-sm block">{review.customer_name}</span>
                                    <div className="flex text-yellow-400 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                fill={star <= review.rating ? "currentColor" : "none"}
                                                className={star <= review.rating ? "text-yellow-400" : "text-gray-200"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {review.created_at ? format(new Date(review.created_at), 'MMMM d, yyyy') : ''}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-4">
                                    {review.images.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-16 h-16 rounded overflow-hidden border border-gray-100">
                                            <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
