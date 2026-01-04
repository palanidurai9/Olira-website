
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, User, MessageSquare, Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
    id: string;
    customer_name: string;
    rating: number;
    comment: string;
    images?: string[];
    date: string; // created_at
}

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
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map to interface
            const mappedReviews = data.map((item: any) => ({
                id: item.id,
                customer_name: item.customer_name,
                rating: item.rating,
                comment: item.comment,
                images: item.images || [],
                date: item.created_at
            }));

            setReviews(mappedReviews);
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

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => {
            const newUrls = prev.filter((_, i) => i !== index);
            // Revoke old URL to avoid memory leaks
            URL.revokeObjectURL(prev[index]);
            return newUrls;
        });
    };

    const uploadImages = async (): Promise<string[]> => {
        if (selectedImages.length === 0) return [];
        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of selectedImages) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${productId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('reviews')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('reviews')
                    .getPublicUrl(filePath);

                uploadedUrls.push(data.publicUrl);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload some images. Please try again.");
        } finally {
            setUploading(false);
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.comment) return;

        setSubmitting(true);
        try {
            // Upload images first
            const uploadedImageUrls = await uploadImages();

            const { error } = await supabase.from('reviews').insert([{
                product_id: productId,
                customer_name: formData.name,
                rating: formData.rating,
                comment: formData.comment,
                images: uploadedImageUrls
            }]);

            if (error) throw error;

            // Reset form and refetch
            setFormData({ name: '', rating: 5, comment: '' });
            setSelectedImages([]);
            setImagePreviewUrls([]);
            fetchReviews();
            alert('Review submitted successfully!');
        } catch (error: any) {
            alert('Failed to submit review: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? "currentColor" : "none"}
                className={i < rating ? "text-yellow-400" : "text-gray-300"}
            />
        ));
    };

    return (
        <div className="py-12 border-t border-gray-100" id="reviews-section">
            <h3 className="text-2xl font-serif font-bold text-dark mb-8">Customer Reviews ({reviews.length})</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Reviews List */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="text-gray-500">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-dark text-sm">{review.customer_name}</p>
                                            <div className="flex gap-0.5 text-yellow-400">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(review.date), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed ml-10 mb-3">
                                    {review.comment}
                                </p>
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 ml-10">
                                        {review.images.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                                                <img src={img} alt={`Review ${idx}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                            <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No reviews yet. Be the first to write one!</p>
                        </div>
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-gray-50 p-6 rounded-xl h-fit">
                    <h4 className="font-bold text-dark mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-110"
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Review</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                                placeholder="How was the product? What did you like?"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Photos (Optional)</label>
                            <div className="flex gap-2 flex-wrap">
                                {imagePreviewUrls.map((url, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {selectedImages.length < 3 && (
                                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors text-gray-400">
                                        <ImageIcon size={20} />
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
                            <p className="text-[10px] text-gray-400 mt-1">Max 3 images.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-70"
                        >
                            {(submitting || uploading) ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>{uploading ? 'Uploading Images...' : 'Submitting...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Review</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
