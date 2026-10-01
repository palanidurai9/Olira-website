import React, { useEffect, useState } from 'react';
import {
    getAdminCoupons,
    saveAdminCoupon,
    toggleAdminCouponStatus,
    deleteAdminCoupon
} from '../../services/adminService';
import type { Coupon } from '../../types';
import { Search, Plus, Trash2, X } from 'lucide-react';

const Coupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        discount_value: '',
        min_order_value: '0',
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await getAdminCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveAdminCoupon({
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_order_value: parseFloat(formData.min_order_value) || 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
                start_date: formData.start_date || undefined,
                end_date: formData.end_date || undefined,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
                is_active: formData.is_active,
                used_count: 0
            });

            fetchCoupons();
            setIsModalOpen(false);
            setFormData({
                code: '',
                discount_type: 'PERCENTAGE',
                discount_value: '',
                min_order_value: '0',
                max_discount_amount: '',
                start_date: '',
                end_date: '',
                usage_limit: '',
                is_active: true
            });
            alert('Coupon created successfully in Firestore!');
        } catch (error: any) {
            alert('Error creating coupon: ' + error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleAdminCouponStatus(id, currentStatus);
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        } catch (error: any) {
            alert('Error updating status: ' + error.message);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await deleteAdminCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error: any) {
            alert('Error deleting coupon: ' + error.message);
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Coupons & Discounts</h1>
                    <p className="text-xs text-gray-500 mt-1">Create promotional codes, seasonal discounts, and limits</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-4 font-bold uppercase tracking-wider"
                >
                    <Plus size={16} /> Create Coupon
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search coupon code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-xs outline-none w-full"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Code</th>
                                <th className="py-4 px-6">Discount</th>
                                <th className="py-4 px-6">Min. Order</th>
                                <th className="py-4 px-6">Usage</th>
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
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 w-12 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCoupons.length > 0 ? (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 font-mono font-bold text-dark text-xs">
                                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs font-semibold text-dark">
                                            {coupon.discount_type === 'PERCENTAGE'
                                                ? `${coupon.discount_value}% OFF`
                                                : `₹${coupon.discount_value} OFF`}
                                            {coupon.max_discount_amount && (
                                                <span className="block text-[10px] text-gray-400">Up to ₹{coupon.max_discount_amount}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            ₹{coupon.min_order_value || 0}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-600">
                                            {coupon.used_count || 0} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : 'used'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => coupon.id && toggleStatus(coupon.id, coupon.is_active)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${coupon.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {coupon.is_active ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => coupon.id && deleteCoupon(coupon.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs text-gray-400">
                                        No coupons created yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif font-bold text-dark">Create New Coupon</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-dark">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary font-mono uppercase"
                                    placeholder="e.g. OLIRAA10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Discount Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary bg-white"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Min. Order Value (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.min_order_value}
                                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Max. Discount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.max_discount_amount}
                                        onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full border border-gray-200 p-2 rounded-md text-xs outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full border border-gray-200 p-2 rounded-md text-xs outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Total Usage Limit</label>
                                <input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    placeholder="e.g. 100 (Leave empty for unlimited)"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary text-xs py-2 px-5 font-bold uppercase tracking-wider"
                                >
                                    Create Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
