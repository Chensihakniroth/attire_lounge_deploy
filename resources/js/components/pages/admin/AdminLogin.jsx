import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader, ShieldCheck, ArrowRight, Check, RefreshCw, AlertTriangle } from 'lucide-react';
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

    const logoUrl = "https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png";

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
        <div className="relative min-h-screen flex font-sans overflow-hidden bg-[#050505] text-white selection:bg-attire-accent selection:text-black">
            {/* Left Column: Visual Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black border-r border-white/5">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0"
                >
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                    >
                        <source src={`${minioBaseUrl}/uploads/asset/hero-background1.mp4`} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/20" />
                </motion.div>

                {/* Branding Content */}
                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-serif leading-tight tracking-tighter mt-12">
                            Attire Lounge <br />
                            <span className="text-white/30 italic font-light">Styling House</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="h-px w-24 bg-attire-accent/40" />
                        <p className="text-sm text-attire-silver/60 max-w-sm leading-relaxed tracking-wide font-light">
                            Secured administrative access for curated excellence. 
                            Manage collections, appointments, and styling house operations from your master console.
                        </p>
                        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                            <span>Phnom Penh</span>
                            <div className="w-1 h-1 bg-white/10 rounded-full" />
                            <span>Encrypted Session</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Clean Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#050505] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-attire-accent/[0.03] blur-[120px] rounded-full pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px] relative z-10"
                >
                    {/* Centered Logo & Header */}
                    <div className="text-center mb-12 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mb-8"
                        >
                            <img 
                                src={logoUrl} 
                                alt="Attire Lounge Logo" 
                                className="w-24 h-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            />
                        </motion.div>
                        
                        <h3 className="text-2xl font-serif text-white mb-2 tracking-tight">Master Console</h3>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-4 bg-attire-accent/30" />
                            <p className="text-[10px] text-attire-silver/40 uppercase tracking-[0.4em] font-bold">Authorized Only</p>
                            <div className="h-px w-4 bg-attire-accent/30" />
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/30 uppercase tracking-[0.2em] ml-1">Identity</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-5 text-white text-sm outline-none transition-all duration-500 focus:bg-white/[0.06] focus:border-white/10 placeholder:text-white/5"
                                placeholder="Admin Email"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/30 uppercase tracking-[0.2em] ml-1">Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 px-5 text-white text-sm outline-none transition-all duration-500 focus:bg-white/[0.06] focus:border-white/10 placeholder:text-white/5"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center cursor-pointer group w-fit">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="hidden"
                                />
                                <div className={`w-4 h-4 rounded-md border transition-all duration-500 flex items-center justify-center ${rememberMe ? 'bg-attire-accent border-attire-accent' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`}>
                                    {rememberMe && <Check size={10} className="text-black stroke-[4]" />}
                                </div>
                                <span className="ml-3 text-[11px] text-attire-silver/50 group-hover:text-white transition-colors duration-500 tracking-wide font-medium">Persist Session</span>
                            </label>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl"
                            >
                                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-[60px] bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-xl overflow-hidden transition-all duration-700 hover:bg-attire-accent disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={16} />
                                        Verifying
                                    </>
                                ) : (
                                    <>
                                        Authorize Access
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-700" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-attire-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        </button>
                    </form>

                    {/* Minimal Footer */}
                    <div className="mt-20 pt-8 border-t border-white/5 text-center lg:text-left">
                        <p className="text-attire-silver/20 text-[8px] font-bold uppercase tracking-[0.5em]">
                            Admin Unit v2.4.0 &copy; 2026
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
