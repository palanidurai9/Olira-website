import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Total Sales', value: '₹0', icon: DollarSign, change: '+100%', color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: '0', icon: ShoppingBag, change: '+100%', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Products', value: '0', icon: TrendingUp, change: 'Active', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Customers', value: '0', icon: Users, change: 'Registered', color: 'text-orange-600', bg: 'bg-orange-100' },
    ]);
    const [dailySales, setDailySales] = useState<{ date: Date; shortDate: string; total: number }[]>([]);
    const [maxSales, setMaxSales] = useState(100);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();

            setStats([
                { label: 'Total Sales', value: `₹${data.totalSales.toLocaleString()}`, icon: DollarSign, change: 'Revenue', color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Total Orders', value: data.totalOrders.toString(), icon: ShoppingBag, change: 'All Time', color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Active Products', value: data.totalProducts.toString(), icon: TrendingUp, change: 'Catalog', color: 'text-purple-600', bg: 'bg-purple-100' },
                { label: 'Customers', value: data.totalCustomers.toString(), icon: Users, change: 'Registered', color: 'text-orange-600', bg: 'bg-orange-100' },
            ]);

            setDailySales(data.dailySales);
            setMaxSales(data.maxSales);
            setRecentOrders(data.recentOrders);
            setLowStockProducts(data.lowStockProducts);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Dashboard Overview</h1>
                    <p className="text-xs text-gray-400 mt-1">Real-time statistics powered by Cloud Firestore</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-dark">
                            {loading ? <span className="animate-pulse">...</span> : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-base font-bold text-dark">Sales Analytics</h3>
                        <p className="text-xs text-gray-400">Revenue for the last 7 days</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-primary"></span> Revenue (₹)
                    </div>
                </div>

                <div className="relative h-64 w-full">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none sticky left-0">
                        <div className="border-b border-gray-100 w-full h-0"></div>
                        <div className="border-b border-gray-100 w-full h-0"></div>
                        <div className="border-b border-gray-100 w-full h-0"></div>
                        <div className="border-b border-gray-100 w-full h-0"></div>
                        <div className="border-b border-gray-100 w-full h-0 border-solid border-gray-200"></div>
                    </div>

                    <div className="absolute inset-0 flex items-end justify-between px-2 md:px-6">
                        {loading ? (
                            Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="w-8 h-full bg-gray-50 rounded-t-lg animate-pulse mx-1 relative">
                                    <div className="absolute bottom-0 w-full bg-gray-200 rounded-t-lg" style={{ height: `${Math.random() * 50 + 10}%` }}></div>
                                </div>
                            ))
                        ) : (
                            dailySales.map((day, index) => {
                                const heightPercent = maxSales > 0 ? (day.total / maxSales) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end relative mx-1 md:mx-4">
                                        <div className="w-full max-w-[40px] md:max-w-[60px] h-full bg-gray-50/50 rounded-t-lg relative overflow-hidden flex items-end transition-colors group-hover:bg-gray-100">
                                            <div
                                                className="w-full bg-primary transition-all duration-700 ease-out rounded-t-md relative flex justify-center"
                                                style={{ height: `${Math.max(heightPercent, 3)}%` }}
                                            >
                                                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10 pointer-events-none">
                                            <div className="bg-dark text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-dark">
                                                ₹{day.total.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="h-8 flex items-center justify-center mt-2 w-full border-t border-transparent">
                                            <span className="text-[10px] md:text-xs text-gray-400 font-medium whitespace-nowrap group-hover:text-dark transition-colors">{day.shortDate}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Orders & Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-dark">Recent Orders</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-xs text-primary hover:underline font-semibold">
                            View All Orders
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Order ID</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-dark text-xs">{order.order_number}</td>
                                        <td className="py-3 px-4 text-xs text-gray-700">{order.customer_name}</td>
                                        <td className="py-3 px-4 text-xs font-semibold">₹{order.total}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.order_status === 'DELIVERED' || order.order_status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-xs text-gray-400">No orders received yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" /> Low Stock Alerts
                    </h3>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-xs text-gray-400">Checking stock levels...</p>
                        ) : lowStockProducts.length > 0 ? (
                            lowStockProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/30">
                                    <div className="w-10 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={product.images?.[0]?.image_url || '/src/assets/product-placeholder.png'}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-semibold text-dark truncate">{product.name}</h4>
                                        <p className="text-[10px] text-gray-500">Stock: <span className="font-bold text-red-600">{product.stock}</span> left</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/admin/inventory')}
                                        className="text-[10px] bg-white border border-primary text-primary px-2.5 py-1 rounded font-bold hover:bg-primary hover:text-white transition-colors uppercase tracking-wider"
                                    >
                                        Restock
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <span className="text-green-500 text-3xl mb-1 block">✓</span>
                                <p className="text-xs text-gray-500">All products are well stocked.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
