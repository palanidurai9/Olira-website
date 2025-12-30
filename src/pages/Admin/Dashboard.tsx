import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

import { supabase } from '../../lib/supabase';

const Dashboard: React.FC = () => {
    const [stats, setStats] = React.useState([
        { label: 'Total Sales', value: '₹0', icon: DollarSign, change: '+0%', color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: '0', icon: ShoppingBag, change: '+0%', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Products', value: '0', icon: TrendingUp, change: '+0', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Customers', value: '0', icon: Users, change: '+0%', color: 'text-orange-600', bg: 'bg-orange-100' },
    ]);
    const [dailySales, setDailySales] = React.useState<{ date: Date; shortDate: string; total: number }[]>([]);
    const [maxSales, setMaxSales] = React.useState(100);
    const [loading, setLoading] = React.useState(true);
    const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Products Count & Low Stock
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { data: lowStock } = await supabase
                .from('products')
                .select('id, name, stock, slug, images:product_images(image_url)')
                .lt('stock', 10)
                .order('stock', { ascending: true })
                .limit(5);

            if (lowStock) setLowStockProducts(lowStock);

            // 2. Fetch All Orders (for stats)
            const { data: allOrders, error: ordersError } = await supabase
                .from('orders')
                .select('total, phone, created_at');

            // 3. Fetch Recent Orders (for table)
            const { data: recent } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recent) setRecentOrders(recent);

            if (productError) console.error('Error fetching products:', productError);
            if (ordersError) console.error('Error fetching orders:', ordersError);

            const totalProducts = productCount || 0;

            let totalSales = 0;
            let uniqueCustomers = new Set();

            // Prepare 7-day buckets
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(today, 6 - i);
                return {
                    date: d,
                    shortDate: format(d, 'dd MMM'),
                    total: 0
                };
            });

            if (allOrders) {
                allOrders.forEach(order => {
                    const amount = Number(order.total) || 0;
                    totalSales += amount;
                    if (order.phone) uniqueCustomers.add(order.phone);

                    if (order.created_at) {
                        const orderDate = parseISO(order.created_at);
                        const dayBucket = last7Days.find(d => isSameDay(d.date, orderDate));
                        if (dayBucket) {
                            dayBucket.total += amount;
                        }
                    }
                });
            }

            const totalOrders = allOrders?.length || 0;
            const totalCustomers = uniqueCustomers.size;

            const maxDaily = Math.max(...last7Days.map(d => d.total));
            setMaxSales(maxDaily > 0 ? maxDaily : 100);
            setDailySales(last7Days);

            setStats([
                { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, icon: DollarSign, change: '+100%', color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, change: '+100%', color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Active Products', value: totalProducts.toString(), icon: TrendingUp, change: '0', color: 'text-purple-600', bg: 'bg-purple-100' },
                { label: 'Customers', value: totalCustomers.toString(), icon: Users, change: '+100%', color: 'text-orange-600', bg: 'bg-orange-100' },
            ]);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-dark">Dashboard Overview</h1>

            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
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
                        <h3 className="text-lg font-bold text-dark">Sales Analytics</h3>
                        <p className="text-sm text-gray-500">Revenue for the last 7 days</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-primary/80"></span> Revenue
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
                                                style={{ height: `${Math.max(heightPercent, 2)}%` }}
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
                        <h3 className="text-lg font-bold text-dark">Recent Orders</h3>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
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
                                        <td className="py-3 px-4 font-medium text-dark">{order.order_number}</td>
                                        <td className="py-3 px-4">{order.customer_name}</td>
                                        <td className="py-3 px-4">₹{order.total}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.order_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-400">No recent orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-dark mb-6">Low Stock Alerts</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-sm text-gray-400">Checking stock levels...</p>
                        ) : lowStockProducts.length > 0 ? (
                            lowStockProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg border border-red-100 bg-red-50/30">
                                    <div className="w-10 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {/* Try to show image if available */}
                                        {product.images && product.images.length > 0 && (
                                            <img src={product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-dark truncate">{product.name}</h4>
                                        <p className="text-xs text-gray-500">Stock: <span className="font-bold text-red-600">{product.stock}</span> left</p>
                                    </div>
                                    <button className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">Restock</button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <span className="text-green-500 text-4xl mb-2 block">✓</span>
                                <p className="text-sm text-gray-500">All products are well stocked.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
