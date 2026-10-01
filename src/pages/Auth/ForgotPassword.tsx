import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await resetPassword(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send password reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center bg-neutral px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-dark mb-2">Reset Password</h1>
                    <p className="text-gray-500 text-sm">
                        Enter your email address to receive password reset instructions.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                {sent ? (
                    <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-dark mb-2">Check Your Email</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            We've sent a password reset link to <span className="font-semibold text-dark">{email}</span>.
                        </p>
                        <Link to="/login" className="btn-primary inline-block py-2.5 px-6 text-xs uppercase tracking-wider">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-md border border-gray-200 outline-none focus:border-primary transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white rounded-md font-medium tracking-wide hover:bg-secondary transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'SEND RESET LINK'}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-xs text-gray-500 hover:text-dark inline-flex items-center">
                                <ArrowLeft size={12} className="mr-1" /> Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
