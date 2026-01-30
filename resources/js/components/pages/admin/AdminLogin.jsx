import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import minioBaseUrl from '../../../config';

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
        <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-attire-navy">
            {/* Background Decorations - Softened to match other pages */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
            </div>

            <motion.video 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1.5 }}
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 grayscale contrast-125"
            >
                <source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" />
            </motion.video>
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-20 w-full max-w-md px-6"
            >
                <div className="bg-black/20 backdrop-blur-2xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-attire-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-attire-accent/30 rotate-3 group hover:rotate-0 transition-transform duration-500">
                            <ShieldCheck className="text-attire-accent" size={32} />
                        </div>
                        <h1 className="text-3xl font-serif text-white tracking-wider mb-2">Admin Portal</h1>
                        <p className="text-attire-silver/60 text-sm uppercase tracking-widest font-medium">Access Restricted</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-attire-accent transition-colors" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl w-full text-white placeholder-white/10 focus:outline-none focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 transition-all"
                                    placeholder="admin@attirelounge.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-attire-silver uppercase tracking-widest ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-attire-accent transition-colors" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl w-full text-white placeholder-white/10 focus:outline-none focus:border-attire-accent/50 focus:ring-1 focus:ring-attire-accent/30 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center px-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-md border border-white/10 flex items-center justify-center transition-all ${rememberMe ? 'bg-attire-accent border-attire-accent' : 'bg-black/40 group-hover:bg-black/60'}`}>
                                    {rememberMe && <Check size={14} className="text-black stroke-[4]" />}
                                </div>
                                <span className="ml-3 text-sm text-attire-silver/80 group-hover:text-white transition-colors font-medium">Keep me signed in</span>
                            </label>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
                            >
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            className="group relative w-full h-14 bg-attire-accent text-black font-bold rounded-full overflow-hidden transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Authorize Session
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
                
                <p className="mt-8 text-center text-attire-silver/30 text-[10px] uppercase tracking-[0.2em]">
                    Attire Lounge Official &copy; 2026<br/>
                    Encrypted Administrative Access
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;