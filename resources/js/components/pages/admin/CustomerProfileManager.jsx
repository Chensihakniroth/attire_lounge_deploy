import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
    User, Trash2, Plus, Edit, X, Check, Loader, AlertCircle, 
    ChevronDown, ChevronRight, ChevronLeft, UserCheck, Share2, Search, Filter, Eye, Globe, Phone, PlusCircle,
    UserPlus, ShieldCheck, Users, Briefcase, Palette, Activity, Ruler
} from 'lucide-react';
import axios from 'axios';
import { useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../common/Skeleton.jsx';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const CustomDropdown = ({ label, selected, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.value === selected);
    const displayName = selectedItem ? selectedItem.label : label;

    return (
        <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm text-left focus:border-attire-accent outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="text-white/20 group-hover:text-attire-accent transition-colors" size={16} />}
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-400 dark:text-white/20" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-2 z-[110] bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl p-2"
                        >
                            <div className="max-h-60 overflow-y-auto attire-scrollbar">
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mb-1 last:mb-0 ${
                                            selected === opt.value 
                                                ? 'bg-attire-accent text-black' 
                                                : 'text-gray-500 dark:text-white/40 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatusFilter = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        { value: 'All', label: 'All Clients', icon: Users },
        { value: 'New', label: 'New Client', icon: UserPlus, color: 'text-green-500' },
        { value: 'Returning', label: 'Returning', icon: UserCheck, color: 'text-blue-500' },
        { value: 'VIP', label: 'VIP Member', icon: ShieldCheck, color: 'text-attire-accent' },
    ];

    const currentOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative z-50">
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white hover:border-attire-accent/30 transition-all shadow-sm"
            >
                <currentOption.icon size={14} className={currentOption.color || 'text-gray-400'} />
                <span>{currentOption.label}</span>
                <ChevronRight size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden py-2 backdrop-blur-xl z-[100]"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        value === option.value 
                                            ? 'bg-black dark:bg-white text-white dark:text-black' 
                                            : 'text-gray-500 dark:text-attire-silver/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <option.icon size={14} className={value === option.value ? '' : (option.color || 'text-gray-400')} />
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const GlassyStatCard = ({ label, value, icon: Icon, color = "attire-accent" }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden group p-6 rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:border-attire-accent/30 transition-all duration-500 shadow-xl shadow-black/[0.02]"
    >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-attire-accent/5 rounded-full blur-3xl group-hover:bg-attire-accent/10 transition-all duration-700" />
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} />
            </div>
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">{value}</p>
    </motion.div>
);

const CustomerProfileManager = () => {
    const { stats } = useAdmin();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    });

    const [showCustomHost, setShowCustomHost] = useState(false);
    const [showCustomAssistant, setShowCustomAssistant] = useState(false);
    
    const [formData, setFormData] = useState({
        date: '',
        client_status: 'New',
        name: '',
        nationality: 'Cambodia',
        phone: '',
        host: '',
        assistant: '',
        how_did_they_find_us: 'Facebook',
        shirt_size: '',
        jacket_size: '',
        pants_size: '',
        shoes_size: '',
        preferred_color: '',
        color_notes: '',
        remarks: '',
    });

    const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const JACKET_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '5XL'];
    const PANTS_SIZES = ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42'];
    const SHOES_SIZES = ['39', '40', '41', '42', '43', '44', '45'];

    const NATIONALITY_OPTIONS = [
        { label: 'Cambodia', value: 'Cambodia' },
        { label: 'Traveler', value: 'Traveler' },
        { label: 'Expat', value: 'Expat' }
    ];

    const STAFF_NAMES = ['NIROTH', 'LEAP', 'SITHORN', 'LIMA', 'SANTA', 'CHHORVY', 'MOUYCHORN'];
    const STAFF_OPTIONS = [
        ...STAFF_NAMES.map(name => ({ label: name, value: name })),
        { label: 'CUSTOM...', value: 'custom' }
    ];

    const COLOR_OPTIONS = [
        { label: 'Black / Blue', value: 'Black/blue' },
        { label: 'Cream / White', value: 'cream/white' },
        { label: 'Grey', value: 'grey' },
        { label: 'BROWN', value: 'BROWN' },
        { label: 'BEIGE', value: 'BEIGE' },
        { label: 'OTHER', value: 'OTHER' }
    ];

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await axios.get('/api/v1/admin/customer-profiles', { 
                params: {
                    page,
                    search: searchQuery,
                    status: filterStatus,
                    per_page: pagination.per_page
                },
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            setProfiles(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                per_page: res.data.per_page
            });
        } catch (error) {
            console.error('Error fetching customer profiles:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterStatus, pagination.per_page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterStatus]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchData(newPage);
        }
    };

    const handleOpenModal = (profile = null) => {
        setError(null);
        if (profile) {
            setEditingProfile(profile);
            setFormData({
                date: profile.date,
                client_status: profile.client_status,
                name: profile.name,
                nationality: profile.nationality,
                phone: profile.phone,
                host: profile.host,
                assistant: profile.assistant,
                how_did_they_find_us: profile.how_did_they_find_us,
                shirt_size: profile.shirt_size || '',
                jacket_size: profile.jacket_size || '',
                pants_size: profile.pants_size || '',
                shoes_size: profile.shoes_size || '',
                preferred_color: profile.preferred_color,
                color_notes: profile.color_notes,
                remarks: profile.remarks,
            });
            setShowCustomHost(profile.host && !STAFF_NAMES.includes(profile.host));
            setShowCustomAssistant(profile.assistant && !STAFF_NAMES.includes(profile.assistant));
        } else {
            setEditingProfile(null);
            setFormData({
                date: new Date().toISOString().slice(0, 10),
                client_status: 'New',
                name: '',
                nationality: 'Cambodia',
                phone: '',
                host: '',
                assistant: '',
                how_did_they_find_us: 'Facebook',
                shirt_size: '',
                jacket_size: '',
                pants_size: '',
                shoes_size: '',
                preferred_color: '',
                color_notes: '',
                remarks: '',
            });
            setShowCustomHost(false);
            setShowCustomAssistant(false);
        }
        setShowModal(true);
    };

    const toggleSize = (field, size) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field] === size ? '' : size
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            if (editingProfile) {
                await axios.put(`/api/v1/admin/customer-profiles/${editingProfile.id}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/v1/admin/customer-profiles', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchData(pagination.current_page);
        } catch (error) {
            console.error('Error saving profile:', error);
            setError(error.response?.data?.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this profile?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            await axios.delete(`/api/v1/admin/customer-profiles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(pagination.current_page);
        } catch (error) {
            console.error('Error deleting profile:', error);
            alert(error.response?.data?.message || 'Failed to delete profile.');
        }
    };

    const SizeToggleGroup = ({ label, field, sizes }) => (
        <div className="space-y-5 bg-black/[0.02] dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 group/size hover:border-attire-accent/20 transition-all duration-500">
            <div className="flex items-center gap-3 mb-2">
                <Ruler size={14} className="text-attire-accent opacity-40 group-hover/size:opacity-100 transition-opacity" />
                <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.3em] block">{label}</label>
            </div>
            <div className="flex flex-wrap gap-2.5">
                {sizes.map(size => {
                    const isSelected = formData[field] === size;
                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(field, size)}
                            className={`min-w-[54px] h-12 rounded-xl text-[10px] font-black transition-all duration-500 border uppercase tracking-widest relative overflow-hidden group/btn ${
                                isSelected 
                                    ? 'bg-attire-accent border-attire-accent text-black shadow-[0_10px_25px_rgba(245,168,28,0.3)] scale-105 z-10' 
                                    : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-400 dark:text-white/30 hover:border-attire-accent/40 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <span className="relative z-10">{size}</span>
                            {!isSelected && (
                                <div className="absolute inset-0 bg-attire-accent opacity-0 group-hover/btn:opacity-5 transition-opacity" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <ErrorBoundary>
            <div className="space-y-10 pb-24 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2 tracking-tight">Client Registry</h1>
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-px bg-attire-accent/40" />
                            <p className="text-gray-400 dark:text-attire-silver text-[10px] font-black uppercase tracking-[0.4em]">Dossier Management Systems</p>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl py-4 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-attire-accent dark:hover:bg-attire-accent transition-all shadow-xl shadow-black/10 group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>Register Client Identity</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassyStatCard label="Total Identities" value={pagination.total} icon={Users} />
                    <GlassyStatCard label="VIP Access" value={profiles.filter(p => p.client_status === 'VIP').length + "+"} icon={ShieldCheck} />
                    <GlassyStatCard label="Live Consults" value={stats.pending_appointments} icon={UserCheck} color="blue-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-2 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/10">
                    <div className="relative group flex-grow">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 group-focus-within:text-attire-accent transition-colors" size={16} />
                        <input type="text" placeholder="Search client archives..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none rounded-2xl py-5 pl-14 pr-8 text-gray-900 dark:text-white text-[11px] font-bold uppercase tracking-widest focus:ring-0 outline-none transition-all" />
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <StatusFilter value={filterStatus} onChange={setFilterStatus} />
                        <div className="h-10 w-px bg-black/5 dark:bg-white/10 hidden md:block" />
                        <button className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-gray-400 dark:text-white/20 hover:text-attire-accent hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-attire-accent/20"><Filter size={16} /></button>
                    </div>
                </div>

                <div className="bg-white dark:bg-black/20 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-black/[0.02] border border-black/5 dark:border-white/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-attire-accent/[0.02] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-attire-accent/[0.04] transition-all duration-1000" />
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em]">Identity Profile</th>
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em]">Origin</th>
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em]">Management</th>
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em]">Status</th>
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                            {[...Array(5)].map((_, j) => (
                                                <td key={j} className="px-8 py-8"><Skeleton className="h-4 w-full rounded-full" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : profiles.length > 0 ? (
                                    profiles.map(profile => (
                                        <tr key={profile.id} className="group hover:bg-attire-accent/[0.02] dark:hover:bg-attire-accent/[0.02] transition-all duration-500 border-b border-black/5 dark:border-white/5 last:border-0">
                                            <td className="px-8 py-8">
                                                <div>
                                                    <p className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-attire-accent transition-colors">{profile.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone size={10} className="text-gray-400 dark:text-white/20" />
                                                        <p className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono tracking-widest uppercase">{profile.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/[0.02] dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 group-hover:border-attire-accent/20 transition-all">
                                                    <Globe size={12} className="text-attire-accent opacity-50" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-600 dark:text-white/60">{profile.nationality || 'NOT SPECIFIED'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-attire-accent opacity-40" /><span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.1em]">{profile.host || 'PENDING'}</span></div>
                                                    {profile.assistant && <div className="flex items-center gap-2.5 ml-4"><div className="w-1 h-px bg-white/10" /><span className="text-[9px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">{profile.assistant}</span></div>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${profile.client_status === 'VIP' ? 'bg-attire-accent/10 text-attire-accent border-attire-accent/30 shadow-attire-accent/5' : profile.client_status === 'Returning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/5' : 'bg-green-500/10 text-green-400 border-green-500/30 shadow-green-500/5'}`}><span className={`w-1.5 h-1.5 rounded-full animate-pulse ${profile.client_status === 'VIP' ? 'bg-attire-accent' : profile.client_status === 'Returning' ? 'bg-blue-500' : 'bg-green-500'}`} />{profile.client_status}</span>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-500">
                                                    <Link to={`/admin/customer-profiles/${profile.id}`} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-gray-400 dark:text-attire-silver hover:bg-attire-accent hover:border-attire-accent hover:text-black transition-all shadow-lg shadow-black/5" title="Dossier"><Eye size={16} /></Link>
                                                    <button onClick={() => handleOpenModal(profile)} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-gray-400 dark:text-attire-silver hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all shadow-lg shadow-black/5" title="Configure"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(profile.id)} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-gray-400 dark:text-attire-silver hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-lg shadow-black/5" title="Archive"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-black/5 dark:border-white/5"><User className="text-gray-400 dark:text-attire-silver/20" size={32} /></div>
                                            <p className="text-gray-400 dark:text-attire-silver/40 text-[11px] font-black uppercase tracking-[0.3em] italic">No matching client records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="px-10 py-8 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.3em]">Archive Capacity: {pagination.total} Identities</p>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-20 hover:border-attire-accent/40 transition-all shadow-lg shadow-black/5"><ChevronLeft size={18} /></button>
                                <div className="flex items-center bg-black/5 dark:bg-white/5 px-6 py-3 rounded-xl border border-black/5 dark:border-white/5"><span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Sector {pagination.current_page} <span className="opacity-20 mx-2">/</span> {pagination.last_page}</span></div>
                                <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-20 hover:border-attire-accent/40 transition-all shadow-lg shadow-black/5"><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>

                {createPortal(
                    <AnimatePresence>
                        {showModal && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowModal(false)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                />
                                
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-4xl bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[10000] font-sans"
                                >
                                    <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                                        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">{editingProfile ? 'Edit Customer Profile' : 'New Customer Profile'}</h2>
                                        <button onClick={() => setShowModal(false)} className="p-3 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto attire-scrollbar">
                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                                                <AlertCircle size={14} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <div className="space-y-12">
                                            {/* Basic Info Section */}
                                            <div>
                                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-[0.3em] mb-6 ml-1">Basic Information</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" placeholder="Enter name..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                                                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono" placeholder="012 345 678" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">Visit Date</label>
                                                        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono" />
                                                    </div>
                                                    <CustomDropdown 
                                                        label="Client Status"
                                                        selected={formData.client_status}
                                                        options={[
                                                            { label: 'New Client', value: 'New' },
                                                            { label: 'Returning', value: 'Returning' },
                                                            { label: 'VIP Member', value: 'VIP' }
                                                        ]}
                                                        onChange={val => setFormData({...formData, client_status: val})}
                                                        icon={UserCheck}
                                                    />
                                                    <CustomDropdown 
                                                        label="Nationality"
                                                        selected={formData.nationality}
                                                        options={NATIONALITY_OPTIONS}
                                                        onChange={val => setFormData({...formData, nationality: val})}
                                                        icon={Globe}
                                                    />
                                                    <CustomDropdown 
                                                        label="Marketing Channel"
                                                        selected={formData.how_did_they_find_us}
                                                        options={[
                                                            { label: 'Facebook', value: 'Facebook' },
                                                            { label: 'Instagram', value: 'Instagram' },
                                                            { label: 'Referral', value: 'Referral' },
                                                            { label: 'Telegram', value: 'Telegram' },
                                                            { label: 'Direct Message', value: 'Direct Message' },
                                                            { label: 'Other', value: 'Other' }
                                                        ]}
                                                        onChange={val => setFormData({...formData, how_did_they_find_us: val})}
                                                        icon={Share2}
                                                    />
                                                </div>
                                            </div>

                                            {/* Measurements Section ✨ */}
                                            <div>
                                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-[0.3em] mb-6 ml-1">Size & Measurements</p>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <SizeToggleGroup label="Shirt Size" field="shirt_size" sizes={SHIRT_SIZES} />
                                                    <SizeToggleGroup label="Jacket Size" field="jacket_size" sizes={JACKET_SIZES} />
                                                    <SizeToggleGroup label="Pants / Waist" field="pants_size" sizes={PANTS_SIZES} />
                                                    <SizeToggleGroup label="Shoes Size" field="shoes_size" sizes={SHOES_SIZES} />
                                                </div>
                                            </div>

                                            {/* Staff & Notes Section */}
                                            <div>
                                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-[0.3em] mb-6 ml-1">Staff & Preference Details</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <CustomDropdown 
                                                            label="Host In-charge"
                                                            selected={STAFF_NAMES.includes(formData.host) ? formData.host : (formData.host ? 'custom' : '')}
                                                            options={STAFF_OPTIONS}
                                                            onChange={val => {
                                                                if (val === 'custom') {
                                                                    setShowCustomHost(true);
                                                                    setFormData({...formData, host: ''});
                                                                } else {
                                                                    setShowCustomHost(false);
                                                                    setFormData({...formData, host: val});
                                                                }
                                                            }}
                                                            icon={Briefcase}
                                                        />
                                                        {showCustomHost && (
                                                            <motion.input 
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                type="text" 
                                                                value={formData.host} 
                                                                onChange={e => setFormData({...formData, host: e.target.value})} 
                                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" 
                                                                placeholder="Enter custom host name..." 
                                                                autoFocus
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <CustomDropdown 
                                                            label="Assistant"
                                                            selected={STAFF_NAMES.includes(formData.assistant) ? formData.assistant : (formData.assistant ? 'custom' : '')}
                                                            options={STAFF_OPTIONS}
                                                            onChange={val => {
                                                                if (val === 'custom') {
                                                                    setShowCustomAssistant(true);
                                                                    setFormData({...formData, assistant: ''});
                                                                } else {
                                                                    setShowCustomAssistant(false);
                                                                    setFormData({...formData, assistant: val});
                                                                }
                                                            }}
                                                            icon={UserCheck}
                                                        />
                                                        {showCustomAssistant && (
                                                            <motion.input 
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                type="text" 
                                                                value={formData.assistant} 
                                                                onChange={e => setFormData({...formData, assistant: e.target.value})} 
                                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" 
                                                                placeholder="Enter custom assistant name..." 
                                                                autoFocus
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <CustomDropdown 
                                                            label="Preferred Color"
                                                            selected={formData.preferred_color}
                                                            options={COLOR_OPTIONS}
                                                            onChange={val => setFormData({...formData, preferred_color: val})}
                                                            icon={Palette}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">Color Notes</label>
                                                        <textarea value={formData.color_notes} onChange={e => setFormData({...formData, color_notes: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all h-24 resize-none" placeholder="Specific color preferences or restrictions..." />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">Additional Remarks</label>
                                                        <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all h-24 resize-none" placeholder="Any other important details about the client..." />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 flex gap-4">
                                            <button type="button" onClick={() => setShowModal(false)} className="flex-grow py-5 border border-black/10 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">Cancel</button>
                                            <button type="submit" disabled={saving} className="flex-grow py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                                {saving ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                                                {saving ? 'Processing...' : 'Save Customer Profile'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </ErrorBoundary>
    );
};

export default CustomerProfileManager;
