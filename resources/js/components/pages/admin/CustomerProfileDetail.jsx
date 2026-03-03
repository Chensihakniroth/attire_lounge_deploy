import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Trash2, User, Phone, Globe, Calendar, 
    UserCheck, Share2, Ruler, Palette, FileText, Loader, 
    AlertCircle, Hash, Clock, ShieldCheck, MapPin, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const InfoCard = ({ icon: Icon, label, value, color = "attire-accent" }) => (
    <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl p-6 hover:border-attire-accent/20 dark:hover:border-white/10 transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 mb-1">{label}</p>
                <p className="text-gray-900 dark:text-white text-sm font-bold tracking-wide">{value || '-'}</p>
            </div>
        </div>
    </div>
);

const MeasurementBadge = ({ label, value }) => (
    <div className="flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl py-6 px-4 hover:bg-attire-accent/5 transition-all group">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-3 group-hover:text-attire-accent transition-colors">{label}</span>
        <span className="text-xl font-serif text-attire-accent">{value || '--'}</span>
    </div>
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
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 font-sans">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-attire-accent/10 border-t-attire-accent rounded-full animate-spin" />
                    <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-attire-accent opacity-50" size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30 animate-pulse">Authenticating Dossier...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-6 font-sans">
                <div className="p-8 bg-red-500/10 rounded-[2.5rem] text-red-500 border border-red-500/20">
                    <AlertCircle size={48} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-gray-900 dark:text-white font-serif text-2xl">Access Error</h2>
                    <p className="text-gray-500 dark:text-white/40 text-sm max-w-xs">{error || 'The requested dossier could not be retrieved from the archives.'}</p>
                </div>
                <Link to="/admin/customer-profiles" className="flex items-center gap-2 p-4 px-8 bg-black/5 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                    <ChevronLeft size={14} />
                    Back to Registry
                </Link>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="space-y-10 pb-32 font-sans">
                {/* Top Navigation & Actions */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/admin/customer-profiles')}
                        className="group flex items-center gap-3 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:-translate-x-1 transition-all">
                            <ChevronLeft size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Registry</span>
                    </button>

                    <div className="flex gap-4">
                        <button 
                            onClick={handleDelete}
                            className="p-4 px-8 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                        >
                            <Trash2 size={16} className="inline mr-2" />
                            Terminate Profile
                        </button>
                    </div>
                </div>

                {/* Hero Profile Section */}
                <div className="relative overflow-hidden bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 md:p-16 shadow-xl shadow-black/[0.02]">
                    {/* Background decorative element */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-attire-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 dark:opacity-100" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-attire-accent to-attire-accent/40 flex items-center justify-center text-black text-4xl md:text-6xl font-serif shadow-2xl shadow-attire-accent/20 border-4 border-white/50 dark:border-white/10">
                            {profile.name.substring(0, 1)}
                        </div>
                        
                        <div className="flex-grow space-y-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <h1 className="text-5xl md:text-7xl font-serif text-gray-900 dark:text-white tracking-tight">{profile.name}</h1>
                                    <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl ${
                                        profile.client_status === 'VIP' ? 'bg-attire-accent text-black' : 
                                        profile.client_status === 'Returning' ? 'bg-blue-500 text-white' : 
                                        'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-white/60 border border-black/5 dark:border-white/10'
                                    }`}>
                                        {profile.client_status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-6 text-gray-400 dark:text-white/40 uppercase text-[10px] font-black tracking-[0.3em]">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-attire-accent" />
                                        <span>Member Since {new Date(profile.date).getFullYear()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-attire-accent" />
                                        <span>Dossier #{profile.id.toString().padStart(4, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Contact & Logistics */}
                    <div className="space-y-10 lg:col-span-1">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 ml-2">Contact & Logistics</h3>
                            <InfoCard icon={Phone} label="Primary Contact" value={profile.phone} color="blue-500" />
                            <InfoCard icon={Globe} label="Nationality" value={profile.nationality} color="attire-accent" />
                            <InfoCard icon={UserCheck} label="Host In-Charge" value={profile.host} color="green-500" />
                            <InfoCard icon={ShieldCheck} label="Assistant" value={profile.assistant} color="purple-500" />
                            <InfoCard icon={Share2} label="Marketing Source" value={profile.how_did_they_find_us} color="orange-500" />
                        </div>

                        <div className="p-8 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-gray-400 dark:text-white/20">
                                <Clock size={16} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Audit History</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="border-l-2 border-attire-accent/20 pl-4 py-1">
                                    <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1">Last Update</p>
                                    <p className="text-xs text-gray-600 dark:text-white/60 font-mono">{new Date(profile.updated_at).toLocaleString()}</p>
                                </div>
                                <div className="border-l-2 border-black/5 dark:border-white/5 pl-4 py-1">
                                    <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase font-black tracking-widest mb-1">Profile Created</p>
                                    <p className="text-xs text-gray-500 dark:text-white/40 font-mono">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Measurements & Preferences */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Sizing Grid */}
                        <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-attire-accent/10 text-attire-accent">
                                        <Ruler size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Atelier Sizing</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/20">Precision measurements</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <MeasurementBadge label="Shirt" value={profile.shirt_size} />
                                <MeasurementBadge label="Jacket" value={profile.jacket_size} />
                                <MeasurementBadge label="Pants" value={profile.pants_size} />
                                <MeasurementBadge label="Shoes" value={profile.shoes_size} />
                            </div>
                        </div>

                        {/* Styling Preferences */}
                        <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Styling Palette</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/20">Preferences & Tastes</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 ml-1">Preferred Colors</label>
                                        <div className="p-6 bg-black/[0.02] dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 text-gray-900 dark:text-white font-bold tracking-wide">
                                            {profile.preferred_color || "Not specified"}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 ml-1">Color Notes</label>
                                        <div className="p-6 bg-black/[0.02] dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 text-gray-600 dark:text-white/60 leading-relaxed italic">
                                            {profile.color_notes || "No additional color restrictions noted."}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 ml-1 mb-2">
                                        <FileText size={14} className="text-attire-accent" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Confidential Remarks</label>
                                    </div>
                                    <div className="p-8 bg-black/[0.02] dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] text-gray-800 dark:text-white/80 leading-relaxed font-serif text-lg">
                                        {profile.remarks || "No internal styling notes have been recorded for this client."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between gap-6 opacity-50">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 flex items-center gap-2">
                        <Hash size={10} />
                        System ID: <span className="font-mono text-gray-600 dark:text-white/60">{profile.id}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 flex items-center gap-2">
                        <Clock size={10} />
                        Last Sync: <span className="font-mono text-gray-600 dark:text-white/60">{new Date(profile.updated_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default CustomerProfileDetail;
