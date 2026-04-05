import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Trash2, User, Phone, Globe, Calendar, 
    UserCheck, Share2, Ruler, Palette, FileText, 
    AlertCircle, Hash, Clock, ShieldCheck, MapPin, Briefcase, Edit, Activity
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const InfoCard = ({ icon: Icon, label, value, color = "attire-accent" }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-4 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 hover:border-attire-accent/30 transition-all group"
    >
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2.5 rounded-lg bg-${color}/10 text-${color} border border-${color}/10 group-hover:scale-105 transition-transform`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-gray-900 dark:text-white text-[12px] font-black uppercase tracking-wider">{value || '-'}</p>
            </div>
        </div>
    </motion.div>
);

const MeasurementBadge = ({ label, value }) => (
    <motion.div 
        whileHover={{ y: -2 }}
        className="flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-4 hover:border-attire-accent/30 transition-all group"
    >
        <div className="p-1.5 rounded-full bg-attire-accent/5 mb-3 group-hover:bg-attire-accent/10 transition-colors">
            <Ruler size={10} className="text-attire-accent opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 mb-2">{label}</span>
        <span className="text-xl font-serif text-attire-accent tracking-tighter">{value || '--'}</span>
    </motion.div>
);

const CustomerProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const res = await axios.get(`/api/v1/admin/customer-profiles/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load customer profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this profile? This cannot be undone.')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            await axios.delete(`/api/v1/admin/customer-profiles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/admin/customer-profiles');
        } catch (err) {
            console.error('Error deleting profile:', err);
            alert('Failed to delete profile.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 font-sans">
                <div className="relative">
                    <LumaSpin size="lg" />
                    <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-attire-accent opacity-20" size={28} />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">Loading details</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">Refining profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 p-6 font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-10 bg-red-500/5 rounded-[3rem] text-red-500 border border-red-500/10 shadow-none"
                >
                    <AlertCircle size={48} />
                </motion.div>
                <div className="text-center space-y-3">
                    <h2 className="text-gray-900 dark:text-white font-serif text-3xl tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest max-w-xs leading-relaxed">{error || 'The requested dossier could not be retrieved from the central archives.'}</p>
                </div>
                <Link to="/admin/customer-profiles" className="flex items-center gap-4 py-4 px-8 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-none">
                    <ChevronLeft size={14} />
                    Back to List
                </Link>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="space-y-12 pb-32 font-sans">
                {/* Top Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <button 
                        onClick={() => navigate('/admin/customer-profiles')}
                        className="group flex items-center gap-3 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 group-hover:bg-attire-accent group-hover:border-attire-accent group-hover:text-black transition-all shadow-none">
                            <ChevronLeft size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest block">Back to List</span>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        <Link 
                            to="/admin/customer-profiles"
                            className="py-3 px-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-attire-accent transition-all shadow-none flex items-center gap-2.5"
                        >
                            <Edit size={14} className="text-attire-accent" />
                            Edit Profile
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="py-3 px-6 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-none flex items-center gap-2.5"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Hero Profile Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-none"
                >
                    <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-attire-accent text-4xl md:text-5xl font-serif shadow-none">
                                {profile.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-4 border-white dark:border-[#0d0d0d] flex items-center justify-center ${
                                profile.client_status === 'VIP' ? 'bg-attire-accent' : 
                                profile.client_status === 'Returning' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                                <ShieldCheck size={14} className={profile.client_status === 'VIP' ? 'text-black' : 'text-white'} />
                            </div>
                        </div>
                        
                        <div className="flex-grow space-y-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white tracking-tight">{profile.name}</h1>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        profile.client_status === 'VIP' ? 'bg-attire-accent/10 text-attire-accent border-attire-accent/20' : 
                                        profile.client_status === 'Returning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                        'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                        {profile.client_status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2.5">
                                        <Clock size={12} className="text-attire-accent opacity-40" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Added {new Date(profile.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 border-l border-black/5 dark:border-white/5 pl-6">
                                        <Hash size={12} className="text-blue-500 opacity-40" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">ID: {profile.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Contact Profile */}
                    <div className="space-y-8 lg:col-span-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4 ml-2">
                                <ShieldCheck size={12} className="text-attire-accent opacity-40" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Contact Profile</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <InfoCard icon={Phone} label="Phone" value={profile.phone} color="blue-500" />
                                <InfoCard icon={Globe} label="Nationality" value={profile.nationality} color="attire-accent" />
                                <InfoCard icon={UserCheck} label="Host" value={profile.host} color="green-500" />
                                <InfoCard icon={ShieldCheck} label="Assistant" value={profile.assistant} color="purple-500" />
                                <InfoCard icon={Share2} label="Found us via" value={profile.how_did_they_find_us} color="orange-500" />
                            </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl space-y-6 shadow-none">
                            <div className="flex items-center gap-3 text-gray-400 dark:text-white/20">
                                <Activity size={16} className="text-attire-accent" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Activity Log</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="relative pl-5 border-l border-attire-accent/20">
                                    <div className="absolute top-0 left-[-3.5px] w-1.5 h-1.5 rounded-full bg-attire-accent" />
                                    <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1">Edited</p>
                                    <p className="text-[10px] text-gray-900 dark:text-white/80 font-mono font-bold">{new Date(profile.updated_at).toLocaleString()}</p>
                                </div>
                                <div className="relative pl-5 border-l border-black/5 dark:border-white/5">
                                    <div className="absolute top-0 left-[-3.5px] w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                                    <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1">Created</p>
                                    <p className="text-[10px] text-gray-500 dark:text-white/40 font-mono font-bold">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Measurements & Preferences */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Measurements */}
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-10 space-y-8 shadow-none"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-attire-accent text-black shadow-none">
                                        <Ruler size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Measurements</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 mt-0.5">Atelier metrics</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <MeasurementBadge label="Shirt" value={profile.shirt_size} />
                                <MeasurementBadge label="Jacket" value={profile.jacket_size} />
                                <MeasurementBadge label="Pants" value={profile.pants_size} />
                                <MeasurementBadge label="Shoes" value={profile.shoes_size} />
                            </div>
                        </motion.div>

                        {/* Preferences */}
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-10 space-y-10 shadow-none"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500 text-white shadow-none">
                                    <Palette size={18} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Style & Notes</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 mt-0.5">Preferences & Remarks</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1 h-1 rounded-full bg-attire-accent" />
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Color Preference</label>
                                        </div>
                                        <div className="p-6 bg-black/[0.01] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/10 text-gray-900 dark:text-white text-sm font-black uppercase tracking-wider">
                                            {profile.preferred_color || "None"}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Color Notes</label>
                                        </div>
                                        <div className="p-6 bg-black/[0.01] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/10 text-gray-600 dark:text-white/50 text-xs leading-relaxed italic font-medium">
                                            {profile.color_notes || "None"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ml-1">
                                        <FileText size={14} className="text-attire-accent opacity-40" />
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Notes</label>
                                    </div>
                                    <div className="p-8 bg-black/[0.01] dark:bg-black/60 border border-black/5 dark:border-white/5 rounded-2xl text-gray-700 dark:text-white/70 leading-relaxed text-sm italic shadow-none">
                                        {profile.remarks || "No additional remarks."}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </ErrorBoundary>
    );
};

export default CustomerProfileDetail;
