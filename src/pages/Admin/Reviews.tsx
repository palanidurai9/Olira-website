import React, { useEffect, useState } from 'react';
import { getAllReviewsForAdmin, updateReviewStatus, deleteReview } from '../../services/reviewService';
import type { Review } from '../../types';
import { Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ReviewsAdmin: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getAllReviewsForAdmin();
            setReviews(data);
        } catch (e) {
            console.error('Error fetching admin reviews:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateReviewStatus(id, status);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        } catch (e: any) {
            alert('Error updating review: ' + e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this customer review?')) return;
        try {
            await deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (e: any) {
            alert('Error deleting review: ' + e.message);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Review Moderation</h1>
                    <p className="text-xs text-gray-500 mt-1">Approve or reject customer reviews before they appear on the store</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Rating</th>
                                <th className="py-4 px-6">Feedback</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-5 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-40 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 w-16 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : reviews.length > 0 ? (
                                reviews.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-dark text-xs">{r.customer_name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">Product: {r.product_id?.substring(0, 10)}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(st => (
                                                    <Star
                                                        key={st}
                                                        size={12}
                                                        fill={st <= r.rating ? "currentColor" : "none"}
                                                        className={st <= r.rating ? "text-yellow-400" : "text-gray-200"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-xs text-xs text-gray-700">
                                            <p className="line-clamp-2 leading-relaxed">{r.comment}</p>
                                            {r.images && r.images.length > 0 && (
                                                <div className="flex gap-1.5 mt-2">
                                                    {r.images.map((img, i) => (
                                                        <a key={i} href={img} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border overflow-hidden">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                                            {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'approved' || !r.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {r.status || 'approved'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {r.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'approved')}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {r.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'rejected')}
                                                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                                        No reviews awaiting moderation.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReviewsAdmin;
