
import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

import { supabase } from '../../lib/supabase';

const Dashboard: React.FC = () => {
    const [stats, setStats] = React.useState([
        { label: 'Total Sales', value: '₹0', icon: DollarSign, change: '+0%', color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: '0', icon: ShoppingBag, change: '+0%', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Products', value: '0', icon: TrendingUp, change: '+0', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Customers', value: '0', icon: Users, change: '+0%', color: 'text-orange-600', bg: 'bg-orange-100' },
    ]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Products Count
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // 2. Fetch Orders for Sales & Customer stats
            // Note: For large datasets, use RPC. For MVP, fetching 'total' and 'customer_name' is fine.
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total, phone');

            if (productError) console.error('Error fetching products:', productError);
            if (ordersError) console.error('Error fetching orders:', ordersError);

            const totalProducts = productCount || 0;

            let totalSales = 0;
            let uniqueCustomers = new Set();

            if (orders) {
                orders.forEach(order => {
                    totalSales += (Number(order.total) || 0);
                    if (order.phone) uniqueCustomers.add(order.phone);
                });
            }

            const totalOrders = orders?.length || 0;
            const totalCustomers = uniqueCustomers.size;

            setStats([
                {
                    label: 'Total Sales',
                    value: `₹${totalSales.toLocaleString()}`,
                    icon: DollarSign,
                    change: '+100%',
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                },
                {
                    label: 'Total Orders',
                    value: totalOrders.toString(),
                    icon: ShoppingBag,
                    change: '+100%',
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                },
                {
                    label: 'Active Products',
                    value: totalProducts.toString(),
                    icon: TrendingUp,
                    change: '0',
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                },
                {
                    label: 'Customers',
                    value: totalCustomers.toString(),
                    icon: Users,
                    change: '+100%',
                    color: 'text-orange-600',
                    bg: 'bg-orange-100'
                },
            ]);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-dark mb-8">Dashboard Overview</h1>

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

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Sales Analytics Chart Coming Soon</p>
            </div>
        </div>
    );
};

export default Dashboard;
