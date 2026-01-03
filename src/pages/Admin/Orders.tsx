
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Search, Eye, ChevronDown, CheckCircle, Clock, XCircle, Phone, Mail, MapPin, Package } from 'lucide-react';

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
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.message || error.error_description || 'Unknown error'}`);
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

    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('orders').delete().eq('id', orderId);
            if (error) throw error;
            fetchOrders();
        } catch (error: any) {
            alert('Error deleting order: ' + error.message);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Orders</h1>
                    <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
                </div>
                {/* Filters */}
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
                                            <div className="relative inline-block">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.order_status)}`}>
                                                    {order.order_status === 'COMPLETED' && <CheckCircle size={12} />}
                                                    {order.order_status === 'PENDING' && <Clock size={12} />}
                                                    {order.order_status === 'CANCELLED' && <XCircle size={12} />}
                                                    <span>{order.order_status}</span>
                                                    <ChevronDown size={12} className="opacity-50" />
                                                </div>
                                                <select
                                                    value={order.order_status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    title="Change Status"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="COMPLETED">COMPLETED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {/* More/Delete Dropdown could go here, for now just a direct delete for 'Actions' request */}
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <XCircle size={18} />
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

            {/* View Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-dark">Order #{selectedOrder.order_number}</h3>
                                <p className="text-sm text-gray-500">{format(new Date(selectedOrder.created_at), 'MMMM d, yyyy h:mm a')}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-dark">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="font-bold text-dark mb-4 flex items-center gap-2">
                                        <CheckCircle size={18} className="text-primary" /> Customer Details
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="font-medium text-dark text-base">{selectedOrder.customer_name}</p>
                                        <p className="flex items-center gap-2"><Phone size={14} /> {selectedOrder.phone}</p>
                                        <p className="flex items-center gap-2"><Mail size={14} /> {selectedOrder.email || 'No email provided'}</p>
                                        <div className="flex items-start gap-2 mt-2">
                                            <MapPin size={14} className="mt-1 shrink-0" />
                                            <p className="whitespace-pre-wrap">{selectedOrder.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-dark mb-4 flex items-center gap-2">
                                        <Clock size={18} className="text-secondary" /> Order Summary
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Method</span>
                                            <span className="font-medium text-dark">{selectedOrder.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedOrder.order_status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {selectedOrder.order_status}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-dark">
                                            <span>Total Amount</span>
                                            <span>₹{selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="font-bold text-dark mb-4 border-b border-gray-100 pb-2">Order Items ({selectedOrder.items?.length || 0})</h4>
                            <div className="space-y-4">
                                {selectedOrder.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-center bg-white border border-gray-50 p-2 rounded-lg">
                                        <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-dark truncate">{item.name}</h5>
                                            <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-dark">₹{item.price * item.quantity}</p>
                                            <p className="text-xs text-gray-400">₹{item.price} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-dark hover:border-gray-300 transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
