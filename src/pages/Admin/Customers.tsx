import React, { useEffect, useState } from 'react';
import { getAdminCustomers } from '../../services/adminService';
import { Search, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAdminCustomers();
            setCustomers(data);
        } catch (e) {
            console.error('Error fetching customers:', e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = customers.filter(c => {
        const term = searchQuery.toLowerCase();
        return (
            c.fullName?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.phone?.includes(term)
        );
    });

    return (
        <div className="pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Customer Directory</h1>
                    <p className="text-xs text-gray-500 mt-1">Customer profiles, lifetime orders, and spending records from Firestore</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-xs outline-none w-full"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Contact</th>
                                <th className="py-4 px-6">Total Orders</th>
                                <th className="py-4 px-6">Total Spend</th>
                                <th className="py-4 px-6">Last Order</th>
                                <th className="py-4 px-6">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-6 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((cust, idx) => (
                                    <tr key={cust.uid || idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                                    {cust.fullName ? cust.fullName.charAt(0).toUpperCase() : 'C'}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-dark text-xs block">{cust.fullName || 'Registered Customer'}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">UID: {cust.uid?.substring(0, 10)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-600">
                                            <div className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" /> {cust.email}</div>
                                            {cust.phone && <div className="flex items-center gap-1.5 text-gray-400 mt-0.5"><Phone size={12} /> {cust.phone}</div>}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-semibold text-dark">
                                            {cust.totalOrders || 0} orders
                                        </td>
                                        <td className="py-4 px-6 text-xs font-bold text-primary">
                                            ₹{(cust.totalSpent || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            {cust.lastOrderDate ? format(new Date(cust.lastOrderDate), 'dd MMM yyyy') : 'No orders yet'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cust.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {cust.role || 'Customer'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                                        No customer records found.
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

export default Customers;
