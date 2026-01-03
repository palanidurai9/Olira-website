
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Search, Filter, Eye, MoreHorizontal, ChevronDown, CheckCircle, Clock, XCircle } from 'lucide-react';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();

        // Realtime subscription
        const subscription = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            // Fetch will be triggered by subscription, but we can also update locally if needed
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.order_status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchLower) ||
            order.customer_name.toLowerCase().includes(searchLower) ||
            order.phone?.includes(searchQuery);

        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Orders</h1>
                    <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'ALL' ? 'bg-dark text-white shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'PENDING' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'COMPLETED' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer or Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-dark text-sm font-medium px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Items</th>
                                <th className="py-4 px-6">Total</th>
                                <th className="py-4 px-6">Payment</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-40 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-6 w-24 bg-gray-100 rounded-full"></div></td>
                                        <td className="py-4 px-6"><div className="h-8 w-8 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-dark">{order.order_number}</td>
                                        <td className="py-4 px-6 text-gray-500">
                                            {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy') : '-'}
                                            <div className="text-xs text-gray-400 mt-0.5">{order.created_at ? format(new Date(order.created_at), 'hh:mm a') : ''}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-dark">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.phone}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-dark">₹{order.total}</td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                                {order.payment_method}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="relative group/status inline-block">
                                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.order_status)}`}>
                                                    {order.order_status === 'COMPLETED' && <CheckCircle size={12} />}
                                                    {order.order_status === 'PENDING' && <Clock size={12} />}
                                                    {order.order_status === 'CANCELLED' && <XCircle size={12} />}
                                                    {order.order_status}
                                                    <ChevronDown size={12} className="opacity-50" />
                                                </button>
                                                {/* Status Dropdown */}
                                                <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 hidden group-hover/status:block animate-fade-in">
                                                    {['PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => updateOrderStatus(order.id, status)}
                                                            className={`block w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 ${order.order_status === status ? 'text-primary' : 'text-gray-600'}`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-dark hover:bg-gray-100 rounded-full transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Search className="text-gray-300" size={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-dark mb-1">No orders found</h3>
                                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                                {searchQuery ? `No results found for "${searchQuery}"` : "You haven't received any orders yet."}
                                            </p>
                                        </div>
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

export default Orders;
