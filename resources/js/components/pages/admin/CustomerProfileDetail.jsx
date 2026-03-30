import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Trash2, User, Phone, Globe, Calendar, 
    UserCheck, Share2, Ruler, Palette, FileText, Loader, 
    AlertCircle, Hash, Clock, ShieldCheck, MapPin, Briefcase, Edit, Activity
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const InfoCard = ({ icon: Icon, label, value, color = "attire-accent" }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden group p-6 rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:border-attire-accent/30 transition-all duration-500 shadow-xl shadow-black/[0.02]"
    >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-attire-accent/5 rounded-full blur-3xl group-hover:bg-attire-accent/10 transition-all duration-700" />
        <div className="flex items-center gap-5 relative z-10">
            <div className={`p-3.5 rounded-2xl bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-gray-900 dark:text-white text-[13px] font-black uppercase tracking-wider">{value || '-'}</p>
            </div>
        </div>
    </motion.div>
);

const MeasurementBadge = ({ label, value }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] py-8 px-6 hover:border-attire-accent/30 transition-all duration-500 group shadow-lg shadow-black/[0.01]"
    >
        <div className="p-2 rounded-full bg-attire-accent/5 mb-4 group-hover:bg-attire-accent/10 transition-colors">
            <Ruler size={12} className="text-attire-accent opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/20 mb-3">{label}</span>
        <span className="text-3xl font-serif text-attire-accent tracking-tighter">{value || '--'}</span>
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
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-2 border-attire-accent/10 border-t-attire-accent rounded-full" 
                    />
                    <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-attire-accent" size={28} />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white mb-2">Accessing Archives</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-white/20">Decrypting Client Dossier...</p>
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
                    className="p-10 bg-red-500/5 rounded-[3rem] text-red-500 border border-red-500/10 shadow-2xl shadow-red-500/5"
                >
                    <AlertCircle size={48} />
                </motion.div>
                <div className="text-center space-y-3">
                    <h2 className="text-gray-900 dark:text-white font-serif text-3xl tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest max-w-xs leading-relaxed">{error || 'The requested dossier could not be retrieved from the central archives.'}</p>
                </div>
                <Link to="/admin/customer-profiles" className="flex items-center gap-4 p-5 px-10 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-attire-accent dark:hover:bg-attire-accent transition-all shadow-xl">
                    <ChevronLeft size={16} />
                    Return to Registry
                </Link>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="space-y-12 pb-32 font-sans">
                {/* Top Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <button 
                        onClick={() => navigate('/admin/customer-profiles')}
                        className="group flex items-center gap-4 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 group-hover:bg-attire-accent group-hover:border-attire-accent group-hover:text-black group-hover:-translate-x-1 transition-all duration-500 shadow-xl shadow-black/5">
                            <ChevronLeft size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] block">Exit to Registry</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Client archives</span>
                        </div>
                    </button>

                    <div className="flex items-center gap-4">
                        <Link 
                            to="/admin/customer-profiles" // This will be handled by the modal in the main view for now
                            className="p-5 px-10 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-attire-accent transition-all shadow-xl shadow-black/5 flex items-center gap-3"
                        >
                            <Edit size={16} className="text-attire-accent" />
                            Configure Dossier
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="p-5 px-10 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-xl shadow-red-500/5 flex items-center gap-3"
                        >
                            <Trash2 size={16} />
                            Terminate
                        </button>
                    </div>
                </div>

                {/* Hero Profile Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[3.5rem] p-12 md:p-20 shadow-2xl shadow-black/[0.02] group"
                >
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-attire-accent/[0.03] rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-attire-accent/[0.05] transition-all duration-1000" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start lg:items-center">
                        <div className="relative group/avatar">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3.5rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-attire-accent text-5xl md:text-7xl font-serif shadow-2xl group-hover/avatar:rotate-3 transition-transform duration-700 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-attire-accent/10 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                {profile.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white dark:border-[#0d0d0d] shadow-2xl flex items-center justify-center ${
                                profile.client_status === 'VIP' ? 'bg-attire-accent' : 
                                profile.client_status === 'Returning' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                                <ShieldCheck size={18} className={profile.client_status === 'VIP' ? 'text-black' : 'text-white'} />
                            </div>
                        </div>
                        
                        <div className="flex-grow space-y-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-6 mb-6">
                                    <h1 className="text-6xl md:text-8xl font-serif text-gray-900 dark:text-white tracking-tighter leading-none">{profile.name}</h1>
                                    <span className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border shadow-2xl ${
                                        profile.client_status === 'VIP' ? 'bg-attire-accent/10 text-attire-accent border-attire-accent/30' : 
                                        profile.client_status === 'Returning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                                        'bg-green-500/10 text-green-400 border-green-500/30'
                                    }`}>
                                        {profile.client_status} Member
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-attire-accent/10 rounded-lg"><Clock size={14} className="text-attire-accent" /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-0.5">Registration</p>
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-white/60 uppercase tracking-widest">{new Date(profile.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-l border-black/5 dark:border-white/5 pl-8">
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><Hash size={14} className="text-blue-500" /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-0.5">Identity Index</p>
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-white/60 font-mono">DOSS-{profile.id.toString().padStart(6, '0')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Intelligence Assets */}
                    <div className="space-y-12 lg:col-span-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6 ml-2">
                                <ShieldCheck size={14} className="text-attire-accent opacity-40" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20">Client Intelligence</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <InfoCard icon={Phone} label="Communication Line" value={profile.phone} color="blue-500" />
                                <InfoCard icon={Globe} label="Region Origin" value={profile.nationality} color="attire-accent" />
                                <InfoCard icon={UserCheck} label="Operational Host" value={profile.host} color="green-500" />
                                <InfoCard icon={ShieldCheck} label="Support Agent" value={profile.assistant} color="purple-500" />
                                <InfoCard icon={Share2} label="Acquisition Source" value={profile.how_did_they_find_us} color="orange-500" />
                            </div>
                        </div>

                        <div className="p-10 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[3rem] space-y-8 shadow-xl shadow-black/[0.01]">
                            <div className="flex items-center gap-4 text-gray-400 dark:text-white/20">
                                <Activity size={18} className="text-attire-accent" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Audit Trail</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-attire-accent/20">
                                    <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-attire-accent shadow-[0_0_10px_rgba(245,168,28,0.5)]" />
                                    <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1.5">Last Modification</p>
                                    <p className="text-[11px] text-gray-900 dark:text-white/80 font-mono font-bold">{new Date(profile.updated_at).toLocaleString()}</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-black/5 dark:border-white/5">
                                    <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-black/10 dark:bg-white/10" />
                                    <p className="text-[9px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1.5">Initial Registration</p>
                                    <p className="text-[11px] text-gray-500 dark:text-white/40 font-mono font-bold">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Technical Specifications */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Atelier Specifications */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[3.5rem] p-12 md:p-16 space-y-12 shadow-2xl shadow-black/[0.01]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 rounded-2xl bg-attire-accent text-black shadow-xl shadow-attire-accent/20">
                                        <Ruler size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">Technical Specifications</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mt-1">Precision atelier metrics</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                <MeasurementBadge label="Arch / Shirt" value={profile.shirt_size} />
                                <MeasurementBadge label="Chassis / Jacket" value={profile.jacket_size} />
                                <MeasurementBadge label="Waist / Pants" value={profile.pants_size} />
                                <MeasurementBadge label="Sole / Shoes" value={profile.shoes_size} />
                            </div>
                        </motion.div>

                        {/* Aesthetic Intelligence */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-[3.5rem] p-12 md:p-16 space-y-12 shadow-2xl shadow-black/[0.01]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-blue-500 text-white shadow-xl shadow-blue-500/20">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">Aesthetic Intelligence</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mt-1">Palette & Style Profile</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2.5 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-attire-accent" />
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Preferred Spectrum</label>
                                        </div>
                                        <div className="p-8 bg-black/[0.02] dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/10 text-gray-900 dark:text-white text-base font-black uppercase tracking-widest shadow-inner">
                                            {profile.preferred_color || "Not defined in dossier"}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2.5 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Chromatic Exceptions</label>
                                        </div>
                                        <div className="p-8 bg-black/[0.02] dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/10 text-gray-600 dark:text-white/50 text-sm leading-relaxed italic font-medium">
                                            {profile.color_notes || "No specific chromatic restrictions recorded."}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 ml-1">
                                        <FileText size={16} className="text-attire-accent" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/20">Strategic Observations</label>
                                    </div>
                                    <div className="relative group/remarks">
                                        <div className="absolute inset-0 bg-attire-accent/5 rounded-[3rem] blur-2xl opacity-0 group-hover/remarks:opacity-100 transition-opacity" />
                                        <div className="relative p-10 bg-black/[0.02] dark:bg-black/60 border border-black/5 dark:border-white/10 rounded-[3rem] text-gray-800 dark:text-white/80 leading-relaxed font-serif text-xl italic shadow-2xl">
                                            <span className="text-4xl text-attire-accent/20 absolute top-6 left-6 font-serif">"</span>
                                            <div className="px-6">
                                                {profile.remarks || "No internal strategic observations have been filed for this identity."}
                                            </div>
                                            <span className="text-4xl text-attire-accent/20 absolute bottom-2 right-6 font-serif">"</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer Metadata Archives */}
                <div className="pt-16 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row justify-between gap-8 opacity-30 group">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg"><Hash size={12} /></div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">System Hash Index</p>
                            <p className="text-[10px] font-bold font-mono text-gray-600 dark:text-white/60 uppercase">{profile.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg"><Clock size={12} /></div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Archive Sync Status</p>
                            <p className="text-[10px] font-bold font-mono text-gray-600 dark:text-white/60 uppercase">{new Date(profile.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default CustomerProfileDetail;
