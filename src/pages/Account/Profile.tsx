import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orderService';
import { getUserAddresses, addUserAddress, deleteUserAddress, updateUserProfile } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Package, User as UserIcon, LogOut, MapPin, Plus, Trash2, Truck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { Order, Address } from '../../types';

const Account: React.FC = () => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

    // Profile Edit State
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // New Address Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: true
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (profile) {
            setProfileName(profile.fullName || '');
            setProfilePhone(profile.phone || '');
        }

        const fetchData = async () => {
            try {
                setLoadingOrders(true);
                const [ordersData, addressesData] = await Promise.all([
                    getUserOrders(user.uid, user.email || undefined),
                    getUserAddresses(user.uid)
                ]);
                setOrders(ordersData);
                setAddresses(addressesData);
            } catch (err) {
                console.error('Error fetching account data:', err);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchData();
    }, [user, profile, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingProfile(true);
        try {
            await updateUserProfile(user.uid, {
                fullName: profileName,
                phone: profilePhone
            });
            await refreshProfile();
            alert('Profile updated successfully!');
        } catch (e: any) {
            alert('Error updating profile: ' + e.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await addUserAddress(user.uid, addressForm);
            const updated = await getUserAddresses(user.uid);
            setAddresses(updated);
            setIsAddressModalOpen(false);
            setAddressForm({
                fullName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India',
                isDefault: false
            });
        } catch (err: any) {
            alert('Error adding address: ' + err.message);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user || !confirm('Delete this address?')) return;
        await deleteUserAddress(user.uid, id);
        setAddresses(prev => prev.filter(a => a.id !== id));
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-20 pb-16 bg-neutral">
            <div className="container-custom">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-dark">My Account</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your profile, shipping addresses, and orders</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors self-start sm:self-auto"
                    >
                        <LogOut size={16} className="mr-2" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <UserIcon size={24} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-serif font-bold text-base text-dark truncate">{profile?.fullName || 'Valued Customer'}</h2>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package size={18} />
                                    <span>Orders ({orders.length})</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <MapPin size={18} />
                                    <span>Addresses ({addresses.length})</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <UserIcon size={18} />
                                    <span>Profile Details</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="font-serif font-bold text-xl text-dark mb-4">Order History</h2>

                                {loadingOrders ? (
                                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                                        <p className="text-gray-400 text-sm">Loading your orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white p-12 rounded-xl text-center border border-gray-100">
                                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders placed yet</h3>
                                        <p className="text-gray-500 mb-6 text-sm">Explore our collection and discover modest modern fashion.</p>
                                        <button onClick={() => navigate('/shop')} className="btn-primary">Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-50 gap-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-dark">Order #{order.order_number}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{order.created_at ? format(new Date(order.created_at), 'MMMM d, yyyy') : ''}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${order.order_status === 'DELIVERED' || order.order_status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                            order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.order_status}
                                                        </span>
                                                        <span className="font-bold text-dark">₹{order.total}</span>
                                                    </div>
                                                </div>

                                                {/* Tracking info if available */}
                                                {order.tracking_number && (
                                                    <div className="mb-4 p-3 bg-blue-50/50 rounded-lg flex items-center justify-between text-xs text-blue-900">
                                                        <div className="flex items-center gap-2">
                                                            <Truck size={16} className="text-blue-600" />
                                                            <span>Courier: <strong className="font-semibold">{order.courier_name || 'Shiprocket'}</strong> | AWB: <strong className="font-mono">{order.tracking_number}</strong></span>
                                                        </div>
                                                        {order.tracking_url && (
                                                            <a href={order.tracking_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                                                                Track <ExternalLink size={12} />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-4 items-center">
                                                            <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={item.image || '/src/assets/product-placeholder.png'}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-dark truncate">{item.name}</h4>
                                                                <p className="text-xs text-gray-500">Size: {item.size} {item.color && `| Color: ${item.color}`} | Qty: {item.quantity}</p>
                                                            </div>
                                                            <span className="text-sm font-medium text-dark">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif font-bold text-xl text-dark">Shipping Addresses</h2>
                                    <button
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="btn-outline flex items-center gap-2 text-xs py-2 px-4"
                                    >
                                        <Plus size={14} /> Add New Address
                                    </button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                                        <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500 mb-4">No shipping addresses saved yet.</p>
                                        <button onClick={() => setIsAddressModalOpen(true)} className="btn-primary text-xs py-2 px-4">
                                            Add Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="bg-white p-5 rounded-xl border border-gray-200 relative group">
                                                {addr.isDefault && (
                                                    <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded mb-2">
                                                        DEFAULT
                                                    </span>
                                                )}
                                                <h3 className="font-bold text-dark text-sm mb-1">{addr.fullName}</h3>
                                                <p className="text-xs text-gray-500 mb-1">{addr.phone}</p>
                                                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                                    {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                                <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                                                    >
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="font-serif font-bold text-xl text-dark mb-6">Profile Information</h2>
                                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            disabled
                                            value={user.email || ''}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md text-sm text-gray-500 cursor-not-allowed"
                                        />
                                        <span className="text-[10px] text-gray-400">Email is tied to your login credentials</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            className="w-full border border-gray-200 p-3 rounded-md text-sm outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profilePhone}
                                            onChange={e => setProfilePhone(e.target.value)}
                                            className="w-full border border-gray-200 p-3 rounded-md text-sm outline-none focus:border-primary"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="btn-primary py-3 px-6 text-xs uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {savingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 animate-fade-in">
                        <h3 className="text-xl font-serif font-bold text-dark mb-4">Add Shipping Address</h3>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.fullName}
                                    onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={addressForm.phone}
                                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.addressLine1}
                                    onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    placeholder="House/Flat No., Street, Landmark"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.pincode}
                                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    className="accent-primary"
                                />
                                <label htmlFor="isDefault" className="text-xs text-gray-600 cursor-pointer">
                                    Set as default shipping address
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary text-xs py-2 px-5">
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
