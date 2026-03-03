import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Key, Shield, Check, Loader, AlertCircle, 
    ChevronLeft, Edit, Save, Trash2, ShieldCheck, Lock, Info
} from 'lucide-react';
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin text-attire-accent" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Fetching Identity Dossier...</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="max-w-4xl mx-auto space-y-10 pb-24 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">Manage Your Professional Identity</p>
                    </div>
                    <div className="flex items-center gap-3 bg-attire-accent/10 p-4 rounded-2xl border border-attire-accent/20 shadow-sm">
                        <ShieldCheck size={18} className="text-attire-accent" />
                        <div>
                            <p className="text-[9px] font-black text-attire-accent uppercase tracking-widest leading-none mb-1">Authorization Level</p>
                            <p className="text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider">{userRoles[0] || 'Member'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Info Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-xl">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-attire-accent to-attire-accent/40 flex items-center justify-center text-black mx-auto mb-6 shadow-2xl shadow-attire-accent/20">
                                {formData.name ? (
                                    <span className="text-3xl font-serif">{formData.name.substring(0, 1)}</span>
                                ) : (
                                    <User size={32} strokeWidth={1.5} />
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">{formData.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-white/20 truncate">{formData.email}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-500">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Security Notice</span>
                            </div>
                            <p className="text-[11px] text-blue-600/60 dark:text-blue-400/40 leading-relaxed italic">
                                To ensure the security of the styling house, changing your email or password requires your current credentials.
                            </p>
                        </div>
                    </div>

                    {/* Right Main Form */}
                    <div className="lg:col-span-2">
                        <motion.form 
                            onSubmit={handleSubmit}
                            className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] border border-black/5 dark:border-white/10 shadow-xl space-y-10"
                        >
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
                                    <p className="text-[10px] font-black text-attire-accent uppercase tracking-[0.3em] ml-1">Identity Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Display Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/10 group-focus-within:text-attire-accent transition-colors" size={16} />
                                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/10 group-focus-within:text-attire-accent transition-colors" size={16} />
                                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-attire-accent uppercase tracking-[0.3em] ml-1">Access Credentials</p>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">New Password (Optional)</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/10 group-focus-within:text-attire-accent transition-colors" size={16} />
                                                <input type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" />
                                            </div>
                                        </div>
                                        {formData.password && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Confirm New Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/10 group-focus-within:text-attire-accent transition-colors" size={16} />
                                                    <input type="password" required={!!formData.password} value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">Verification Required</label>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500/30 group-focus-within:text-red-500 transition-colors" size={16} />
                                            <input type="password" required placeholder="Enter CURRENT password to save changes" value={formData.current_password} onChange={e => setFormData({...formData, current_password: e.target.value})} className="w-full bg-red-500/[0.02] border-2 border-red-500/10 rounded-2xl py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:border-red-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-black/10"
                                    >
                                        {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                        {saving ? 'Processing changes...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ProfileEditor;
