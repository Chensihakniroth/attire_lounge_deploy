import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Key, Shield, Check, AlertCircle, 
    ChevronLeft, Edit, Save, Trash2, ShieldCheck, Lock, Info
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import { useAdmin } from './AdminContext';

const ProfileEditor = () => {
    const { user, userRoles } = useAdmin();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }

        const fetchProfile = async () => {
            if (!user) setLoading(true);
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const res = await axios.get('/api/v1/admin/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFormData(prev => ({
                    ...prev,
                    name: res.data.name,
                    email: res.data.email,
                }));
            } catch (err) {
                console.error('Error fetching profile:', err);
                if (!user) setError('Could not load your profile details, honey. (｡>﹏<｡)');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await axios.put('/api/v1/user/profile', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSuccess('Profile updated successfully! (ﾉ´ヮ`)ﾉ*:･ﾟ✧');
            setFormData(prev => ({
                ...prev,
                current_password: '',
                password: '',
                password_confirmation: '',
            }));
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please check your current password!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <LumaSpin size="lg" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40 text-center">Loading Profile...</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="max-w-4xl mx-auto space-y-10 pb-24 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">My Profile</h1>
                        <p className="text-gray-400 dark:text-[#8b949e] text-sm tracking-widest">Manage your account information</p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/5 dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                        <ShieldCheck size={18} className="text-[#0d3542] dark:text-[#58a6ff]" />
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Account Role</p>
                            <p className="text-gray-900 dark:text-[#c9d1d9] font-bold text-xs uppercase tracking-wider">{userRoles[0] || 'Member'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Info Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#161b22] p-8 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                            <div className="w-24 h-24 rounded-lg bg-black/5 dark:bg-[#0d1117] flex items-center justify-center text-[#0d3542] dark:text-[#58a6ff] mx-auto mb-6 shadow-none border border-black/5 dark:border-[#30363d]">
                                {formData.name ? (
                                    <span className="text-3xl font-serif">{formData.name.substring(0, 1)}</span>
                                ) : (
                                    <User size={32} strokeWidth={1.5} />
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider">{formData.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-[#8b949e] truncate">{formData.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <form 
                            onSubmit={handleSubmit}
                            className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl p-10 overflow-hidden relative space-y-10"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-1.5 h-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9]">Account Details</h2>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs">
                                        <Check size={14} />
                                        <span>{success}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.3em] ml-1">Personal Information</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest ml-1">Name</label>
                                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder-[white/10]" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/50 ml-1">Email</label>
                                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder-[white/10]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Change Password</p>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest ml-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]/30 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={16} />
                                                <input type="password" placeholder="Leave empty to keep current password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 pl-14 pr-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/30" />
                                            </div>
                                        </div>
                                        {formData.password && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest ml-1">Confirm New Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]/30 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={16} />
                                                    <input type="password" required={!!formData.password} value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 pl-14 pr-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-black/5 dark:border-[#30363d] space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">Current Password</label>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500/30 group-focus-within:text-rose-500 transition-colors" size={16} />
                                            <input type="password" required placeholder="Type your current password to save changes" value={formData.current_password} onChange={e => setFormData({...formData, current_password: e.target.value})} className="w-full bg-rose-500/5 dark:bg-[#0d1117] border border-rose-500/20 dark:border-rose-500/10 rounded-xl py-3.5 pl-14 pr-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-rose-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/30" />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="w-full py-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-none border-none"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ProfileEditor;
