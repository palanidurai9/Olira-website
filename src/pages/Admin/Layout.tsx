import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingBag,
    Tag,
    Boxes,
    Users,
    MessageSquare,
    LogOut,
    ExternalLink
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/admin/login');
            } else if (!isAdmin && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
                navigate('/admin/login');
            }
        }
    }, [user, profile, isAdmin, authLoading, navigate]);

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <Link to="/" target="_blank" className="flex items-center gap-2 group" title="Open Storefront">
                        <span className="text-xl font-serif font-bold text-primary tracking-tight">OLIRAA PANEL</span>
                        <ExternalLink size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <Package size={18} />
                        <span>Products</span>
                    </NavLink>

                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <FolderTree size={18} />
                        <span>Categories</span>
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <ShoppingBag size={18} />
                        <span>Orders</span>
                    </NavLink>

                    <NavLink
                        to="/admin/inventory"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <Boxes size={18} />
                        <span>Inventory</span>
                    </NavLink>

                    <NavLink
                        to="/admin/coupons"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <Tag size={18} />
                        <span>Coupons</span>
                    </NavLink>

                    <NavLink
                        to="/admin/customers"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <Users size={18} />
                        <span>Customers</span>
                    </NavLink>

                    <NavLink
                        to="/admin/reviews"
                        className={({ isActive }) => `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-dark'}`}
                    >
                        <MessageSquare size={18} />
                        <span>Reviews</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="mb-3 px-2">
                        <p className="text-xs font-semibold text-dark truncate">{user?.email}</p>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Administrator</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-6 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
