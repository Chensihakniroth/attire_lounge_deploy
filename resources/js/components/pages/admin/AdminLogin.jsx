import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/v1/admin/login', { email, password });
            const { token } = response.data;
            if (rememberMe) {
                localStorage.setItem('admin_token', token);
            } else {
                sessionStorage.setItem('admin_token', token);
            }
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid credentials or server error.');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden">
            <motion.video 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                autoPlay 
                loop 
                muted 
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="https://bucket-production-df32.up.railway.app/product-assets/uploads/asset/hero-background1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </motion.video>
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-20 bg-white/10 backdrop-blur-lg p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-white/20"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Panel</h1>
                    <p className="text-white/70 text-sm">Sign in to manage your store.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <label className="block text-white/80 text-sm font-medium mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white/15 border border-white/20 rounded-lg w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-white/80 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white/15 border border-white/20 rounded-lg w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                                Remember me
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-xs italic text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Secure Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;