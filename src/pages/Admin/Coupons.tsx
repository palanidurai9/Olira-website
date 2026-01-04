
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Search, Plus, Trash2, Tag, Percent, Calendar, CheckCircle, XCircle } from 'lucide-react';

const Coupons: React.FC = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('coupons').insert([{
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_order_value: parseFloat(formData.min_order_value) || 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                is_active: formData.is_active
            }]);

            if (error) throw error;

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
            alert('Coupon created successfully!');
        } catch (error: any) {
            alert('Error creating coupon: ' + error.message);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error: any) {
            alert('Error updating status: ' + error.message);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error: any) {
            alert('Error deleting coupon: ' + error.message);
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Coupons</h1>
                    <p className="text-gray-500 mt-1">Manage discounts and promo codes</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-dark text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Create Coupon</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-4 px-6">Code</th>
                                <th className="py-4 px-6">Discount</th>
                                <th className="py-4 px-6">Valid</th>
                                <th className="py-4 px-6">Usage</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                            ) : filteredCoupons.length > 0 ? (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 font-bold text-dark font-mono">{coupon.code}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1">
                                                {coupon.discount_type === 'PERCENTAGE' ? <Percent size={14} className="text-blue-500" /> : <span className="text-green-500 font-bold">₹</span>}
                                                <span>{coupon.discount_value}{coupon.discount_type === 'PERCENTAGE' ? '%' : ''} off</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Min Order: ₹{coupon.min_order_value}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                <Calendar size={12} />
                                                <div>
                                                    <div>{coupon.start_date ? format(new Date(coupon.start_date), 'MMM d') : 'Anytime'}</div>
                                                    <div className="text-gray-300">to</div>
                                                    <div>{coupon.end_date ? format(new Date(coupon.end_date), 'MMM d, yyyy') : 'Forever'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {coupon.used_count} / {coupon.usage_limit || '∞'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${coupon.is_active
                                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => deleteCoupon(coupon.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No coupons found. Create one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                            <Tag className="text-primary" /> Create New Coupon
                        </h2>

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono uppercase"
                                    placeholder="e.g. SUMMER2025"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_order_value}
                                        onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (Start empty for none)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.max_discount_amount}
                                        onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                        placeholder="Optional limit"
                                        disabled={formData.discount_type === 'FIXED'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Total)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.usage_limit}
                                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-dark text-white rounded-lg hover:bg-gray-900 transition-colors"
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
