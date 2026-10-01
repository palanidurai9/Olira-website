import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCustomer, checkIsAdmin } from '../../services/authService';
import { Lock, Loader2, ShieldAlert } from 'lucide-react';
import { auth } from '../../services/firebase';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await loginCustomer(email, password);
            const isAdmin = await checkIsAdmin(user);

            if (!isAdmin) {
                // Sign out immediately if not authorized
                await auth.signOut();
                setError('Access Denied. This account does not have administrator privileges.');
                setLoading(false);
                return;
            }

            navigate('/admin/dashboard');
        } catch (err: any) {
            let msg = 'Failed to authenticate.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                msg = 'Invalid admin credentials.';
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Lock className="text-primary w-8 h-8" />
                    </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-center text-dark mb-2">Admin Portal</h2>
                <p className="text-center text-gray-500 mb-8 text-sm">Secure access for OLIRAA management</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3.5 rounded-lg text-sm mb-6 flex items-start gap-2.5 border border-red-100">
                        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1.5">Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm transition-all"
                            placeholder="admin@oliraa.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-600 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-sm transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md active:scale-[98%] uppercase tracking-wider text-xs font-bold"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Admin Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
