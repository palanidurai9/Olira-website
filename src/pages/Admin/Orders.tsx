import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateAdminOrderStatus, updateAdminShippingInfo, deleteAdminOrder } from '../../services/adminService';
import type { Order, ShippingStatus } from '../../types';
import { format } from 'date-fns';
import { Search, Eye, ChevronDown, CheckCircle, Clock, XCircle, Phone, Mail, MapPin, Package, Truck, ExternalLink } from 'lucide-react';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Shipping modal state
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [shippingData, setShippingData] = useState<{
        courier_name: string;
        tracking_number: string;
        tracking_url: string;
        shipping_status: ShippingStatus;
    }>({
        courier_name: 'Shiprocket / Delhivery',
        tracking_number: '',
        tracking_url: '',
        shipping_status: 'SHIPPED'
    });

    useEffect(() => {
        // Realtime Firestore Listener on orders collection
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
            setOrders(list);
            setLoading(false);
        }, (err) => {
            console.error('Realtime orders error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateAdminOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus as any } : null);
            }
        } catch (error: any) {
            alert(`Failed to update status: ${error.message}`);
        }
    };

    const handleSaveShipping = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        try {
            await updateAdminShippingInfo(selectedOrder.id, shippingData);
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? ({ ...o, ...shippingData } as Order) : o));
            setSelectedOrder(prev => prev ? ({ ...prev, ...shippingData } as Order) : null);
            setShippingModalOpen(false);
            alert('Shipping information updated!');
        } catch (err: any) {
            alert('Error updating shipping: ' + err.message);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
        try {
            await deleteAdminOrder(orderId);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
        } catch (err: any) {
            alert('Error deleting order: ' + err.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.order_status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            order.order_number?.toLowerCase().includes(searchLower) ||
            order.customer_name?.toLowerCase().includes(searchLower) ||
            order.phone?.includes(searchQuery) ||
            order.email?.toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
            case 'CONFIRMED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Orders</h1>
                    <p className="text-xs text-gray-500 mt-1">Real-time order management with Shiprocket & Razorpay tracking</p>
                </div>
                {/* Status Filters */}
                <div className="flex flex-wrap bg-white p-1 rounded-lg border border-gray-200 text-xs">
                    {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${filterStatus === st ? 'bg-dark text-white shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Orders Table */}
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
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-100 rounded-full"></div></td>
                                        <td className="py-4 px-6"><div className="h-6 w-12 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors group">
                                        <td className="py-4 px-6 font-mono font-bold text-dark text-xs">{order.order_number}</td>
                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-dark text-xs">{order.customer_name}</div>
                                            <div className="text-[10px] text-gray-400">{order.phone}</div>
                                        </td>
                                        <td className="py-4 px-6 text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-dark text-xs">₹{order.total}</td>
                                        <td className="py-4 px-6">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {order.payment_method} ({order.payment_status || 'PENDING'})
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="relative inline-block">
                                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.order_status)}`}>
                                                    <span>{order.order_status}</span>
                                                    <ChevronDown size={10} className="opacity-60" />
                                                </div>
                                                <select
                                                    value={order.order_status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    title="Change Status"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="CONFIRMED">CONFIRMED</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                                        No orders found.
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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-dark">Order #{selectedOrder.order_number}</h3>
                                <p className="text-xs text-gray-400">{selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'MMMM d, yyyy h:mm a') : ''}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-dark text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <CheckCircle size={14} className="text-primary" /> Customer Details
                                    </h4>
                                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-lg">
                                        <p className="font-bold text-dark text-sm">{selectedOrder.customer_name}</p>
                                        <p className="flex items-center gap-2"><Phone size={12} /> {selectedOrder.phone}</p>
                                        <p className="flex items-center gap-2"><Mail size={12} /> {selectedOrder.email || 'No email'}</p>
                                        <div className="flex items-start gap-2 pt-1 border-t border-gray-200 mt-2">
                                            <MapPin size={12} className="mt-0.5 shrink-0" />
                                            <p className="whitespace-pre-wrap">{selectedOrder.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-dark text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Clock size={14} className="text-primary" /> Order & Payment Info
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-3.5 space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Payment Method</span>
                                            <span className="font-bold text-dark">{selectedOrder.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Payment Status</span>
                                            <span className="font-bold text-green-700">{selectedOrder.payment_status}</span>
                                        </div>
                                        {selectedOrder.razorpay_payment_id && (
                                            <div className="flex justify-between font-mono text-[10px]">
                                                <span className="text-gray-400">Razorpay ID</span>
                                                <span className="truncate max-w-[150px]">{selectedOrder.razorpay_payment_id}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Order Status</span>
                                            <span className="font-bold text-dark">{selectedOrder.order_status}</span>
                                        </div>
                                        {selectedOrder.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount</span>
                                                <span>-₹{selectedOrder.discount_amount}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-dark">
                                            <span>Total Amount</span>
                                            <span>₹{selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information & Shiprocket Integration */}
                            <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                                        <Truck size={14} /> Shipping & Fulfillment
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setShippingData({
                                                courier_name: selectedOrder.courier_name || 'Shiprocket / Delhivery',
                                                tracking_number: selectedOrder.tracking_number || '',
                                                tracking_url: selectedOrder.tracking_url || '',
                                                shipping_status: (selectedOrder.shipping_status as any) || 'SHIPPED'
                                            });
                                            setShippingModalOpen(true);
                                        }}
                                        className="text-xs text-blue-700 font-bold hover:underline"
                                    >
                                        Update Shipping Details
                                    </button>
                                </div>
                                <div className="text-xs text-blue-800 space-y-1">
                                    <p>Courier: <span className="font-semibold">{selectedOrder.courier_name || 'Not assigned yet'}</span></p>
                                    <p>AWB / Tracking Number: <span className="font-mono font-semibold">{selectedOrder.tracking_number || 'Pending'}</span></p>
                                    {selectedOrder.tracking_url && (
                                        <a href={selectedOrder.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1 mt-1">
                                            Open Tracking Page <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Items breakdown */}
                            <div>
                                <h4 className="font-bold text-dark text-xs uppercase tracking-wider mb-3">Ordered Items ({selectedOrder.items?.length || 0})</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-center bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                                            <div className="w-12 h-14 bg-gray-200 rounded overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-xs">
                                                <p className="font-bold text-dark truncate">{item.name}</p>
                                                <p className="text-gray-500">Size: {item.size} {item.color && `| Color: ${item.color}`} | Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right text-xs">
                                                <p className="font-bold text-dark">₹{item.price * item.quantity}</p>
                                                <p className="text-[10px] text-gray-400">₹{item.price} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shipping Info Update Modal */}
            {shippingModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShippingModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative z-10 animate-fade-in">
                        <h3 className="text-lg font-serif font-bold text-dark mb-4">Update Shipping Information</h3>
                        <form onSubmit={handleSaveShipping} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Courier Partner</label>
                                <input
                                    type="text"
                                    value={shippingData.courier_name}
                                    onChange={e => setShippingData({ ...shippingData, courier_name: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-xs outline-none focus:border-primary"
                                    placeholder="e.g. Shiprocket - BlueDart"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">AWB / Tracking Number</label>
                                <input
                                    type="text"
                                    required
                                    value={shippingData.tracking_number}
                                    onChange={e => setShippingData({ ...shippingData, tracking_number: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-xs outline-none focus:border-primary font-mono"
                                    placeholder="e.g. 12839482910"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Tracking URL</label>
                                <input
                                    type="url"
                                    value={shippingData.tracking_url}
                                    onChange={e => setShippingData({ ...shippingData, tracking_url: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-xs outline-none focus:border-primary"
                                    placeholder="https://shiprocket.co/tracking/..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShippingModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-xs text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                                    Save Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
