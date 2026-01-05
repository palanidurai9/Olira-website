import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Package, User as UserIcon, LogOut, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const Account: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            // Fetch orders by email because orders table might verify by email initially
            // Ideally should verify by user_id if column exists
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('email', user.email)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-20 pb-12 bg-neutral">
            <div className="container-custom">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-serif font-bold text-dark">My Account</h1>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                        <LogOut size={16} className="mr-2" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <UserIcon size={32} />
                                </div>
                                <div>
                                    <h2 className="font-serif font-bold text-lg text-dark">{profile?.full_name || 'Valued Customer'}</h2>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Shipping Address</p>
                                            <p className="text-sm text-gray-700">
                                                {profile?.address ? (
                                                    <>
                                                        {profile.address}<br />
                                                        {profile.city && `${profile.city}, `}{profile.pincode}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">No address saved yet.</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="lg:col-span-2">
                        <h2 className="font-serif font-bold text-xl text-dark mb-4">Order History</h2>

                        {loadingOrders ? (
                            <div className="text-center py-12 text-gray-400">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg text-center border border-gray-100">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                                <button onClick={() => navigate('/shop')} className="btn-primary">Start Shopping</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                            <div>
                                                <p className="text-sm font-bold text-dark">Order #{order.order_number}</p>
                                                <p className="text-xs text-gray-500">{format(new Date(order.created_at), 'MMMM d, yyyy')}</p>
                                            </div>
                                            <div className="mt-2 md:mt-0 flex items-center gap-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.order_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.order_status}
                                                </span>
                                                <p className="font-bold text-dark">₹{order.total}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {/* Preview only first 2 items */}
                                            {order.items && Array.isArray(order.items) && order.items.slice(0, 2).map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                                    <span className="text-gray-400 text-xs">Size: {item.selectedSize}</span>
                                                </div>
                                            ))}
                                            {order.items && order.items.length > 2 && (
                                                <p className="text-xs text-gray-400 italic">+{order.items.length - 2} more items</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
