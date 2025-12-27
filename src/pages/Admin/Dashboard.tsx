
import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
    // Mock Data
    const stats = [
        { label: 'Total Sales', value: '₹45,231', icon: DollarSign, change: '+12%', color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: '142', icon: ShoppingBag, change: '+8%', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Products', value: '24', icon: TrendingUp, change: '+2', color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Customers', value: '89', icon: Users, change: '+5%', color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

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
                        <p className="text-2xl font-bold text-dark">{stat.value}</p>
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
