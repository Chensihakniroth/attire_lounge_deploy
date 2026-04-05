import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    User, Trash2, Plus, Edit, X, Check, AlertCircle, 
    ChevronDown, ChevronRight, ChevronLeft, UserCheck, Share2, Search, Filter, Eye, Globe, Phone, PlusCircle,
    UserPlus, ShieldCheck, Users, Briefcase, Palette, Activity, Ruler
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import ModernModal from '../../common/ModernModal.jsx';

const CustomDropdown = ({ label, selected, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.value === selected);
    const displayName = selectedItem ? selectedItem.label : label;

    return (
        <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl py-4 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm text-left focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" size={16} />}
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-400 dark:text-[#8b949e]/20" />
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
                            className="absolute top-full left-0 right-0 mt-2 z-[110] bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden p-2"
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
                                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' 
                                                : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#0d1117] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
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
                className="flex items-center gap-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl py-3.5 px-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 transition-all"
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
                            className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden py-2 z-[100]"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-4 rounded-3xl bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 transition-all duration-300 shadow-none"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${color === 'attire-accent' ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' : 'bg-blue-500/10 text-blue-500'}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">{value}</p>
            </div>
        </div>
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
        <div className="space-y-3 bg-black/[0.01] dark:bg-white/[0.01] p-5 rounded-2xl border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 mb-1">
                <Ruler size={12} className="text-attire-accent opacity-40" />
                <label className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{label}</label>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {sizes.map(size => {
                    const isSelected = formData[field] === size;
                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(field, size)}
                            className={`min-w-[42px] h-9 rounded-lg text-[10px] font-black transition-all border uppercase tracking-wider ${
                                isSelected 
                                    ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff] text-white dark:text-black' 
                                    : 'bg-white dark:bg-[#161b22] border-black/10 dark:border-[#30363d] text-gray-400 dark:text-[#8b949e]/40 hover:border-attire-accent/40'
                            }`}
                        >
                            {size}
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-1 tracking-tight">Customers</h1>
                        <p className="text-gray-400 dark:text-[#8b949e]/40 text-[10px] font-black uppercase tracking-[0.3em]">Customer Directory</p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl py-3 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all group"
                    >
                        <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Customer</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassyStatCard label="Total" value={pagination.total} icon={Users} />
                    <GlassyStatCard label="VIP" value={profiles.filter(p => p.client_status === 'VIP').length + "+"} icon={ShieldCheck} />
                    <GlassyStatCard label="Consults" value={stats.pending_appointments} icon={UserCheck} color="blue-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-2 bg-black/[0.02] dark:bg-[#161b22] rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-none">
                    <div className="relative group flex-grow">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]/40 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={16} />
                        <input type="text" placeholder="Search client archives..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none rounded-2xl py-5 pl-14 pr-8 text-gray-900 dark:text-[#c9d1d9] text-[10px] font-bold uppercase tracking-[0.2em] focus:ring-0 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" />
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <StatusFilter value={filterStatus} onChange={setFilterStatus} />
                        <div className="h-10 w-px bg-black/5 dark:bg-[#30363d] hidden md:block" />
                        <button className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-gray-400 dark:text-[#8b949e]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-white dark:hover:bg-[#0d1117] transition-all border border-transparent hover:border-[#0d3542]/20 dark:hover:border-[#58a6ff]/20"><Filter size={16} /></button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#161b22] rounded-[3rem] border border-black/5 dark:border-[#30363d] overflow-hidden relative group shadow-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0d3542]/[0.02] dark:bg-[#58a6ff]/[0.02] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-[#0d3542]/[0.04] dark:group-hover:bg-[#58a6ff]/[0.04] transition-all duration-1000" />
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-[#30363d] bg-black/[0.01] dark:bg-[#0d1117]">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em]">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em]">Nationality</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em]">Staff</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em]">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <LumaSpin size="xl" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Gathering Client Profiles...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : profiles.length > 0 ? (
                                    profiles.map(profile => (
                                        <tr key={profile.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all duration-300 border-b border-black/5 dark:border-[#30363d] last:border-0">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-attire-accent transition-colors">{profile.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Phone size={8} className="text-gray-400 dark:text-[#8b949e]/40" />
                                                        <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/30 font-mono tracking-widest uppercase">{profile.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5">
                                                    <Globe size={10} className="text-gray-400 opacity-50" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-white/40">{profile.nationality || 'UNKNOWN'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-attire-accent/40" />
                                                    <span className="text-[10px] font-black text-gray-600 dark:text-white/60 uppercase tracking-widest">{profile.host || 'PENDING'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${profile.client_status === 'VIP' ? 'bg-attire-accent/10 text-attire-accent border-attire-accent/20' : profile.client_status === 'Returning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}><span className={`w-1 h-1 rounded-full ${profile.client_status === 'VIP' ? 'bg-attire-accent' : profile.client_status === 'Returning' ? 'bg-blue-500' : 'bg-green-500'}`} />{profile.client_status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/admin/customer-profiles/${profile.id}`} className="p-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all" title="View"><Eye size={12} /></Link>
                                                    <button onClick={() => handleOpenModal(profile)} className="p-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-blue-500 transition-all" title="Edit"><Edit size={12} /></button>
                                                    <button onClick={() => handleDelete(profile.id)} className="p-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-all" title="Delete"><Trash2 size={12} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="w-20 h-20 bg-black/5 dark:bg-[#161b22] rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-black/5 dark:border-[#30363d]"><User className="text-gray-400 dark:text-[#8b949e]/20" size={32} /></div>
                                            <p className="text-gray-400 dark:text-[#8b949e]/40 text-xs font-black uppercase tracking-[0.3em] italic">No matching client records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                        <div className="px-8 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-widest">Total: {pagination.total}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="p-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/[0.02] disabled:opacity-20 transition-all"><ChevronLeft size={14} /></button>
                                <span className="text-[10px] font-black uppercase tracking-widest">Page {pagination.current_page} / {pagination.last_page}</span>
                                <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="p-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/[0.02] disabled:opacity-20 transition-all"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                </div>

                <ModernModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingProfile ? 'Edit Customer' : 'Add Customer'}
                    maxWidth="max-w-3xl"
                >
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto attire-scrollbar bg-white dark:bg-[#0d1117]">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] uppercase font-black">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div>
                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-widest mb-4">Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Name</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" placeholder="Customer name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Phone</label>
                                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono" placeholder="012 345 678" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Date</label>
                                        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono" />
                                    </div>
                                    <CustomDropdown 
                                        label="Status"
                                        selected={formData.client_status}
                                        options={[
                                            { label: 'New', value: 'New' },
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
                                        label="Found us via"
                                        selected={formData.how_did_they_find_us}
                                        options={[
                                            { label: 'Facebook', value: 'Facebook' },
                                            { label: 'Instagram', value: 'Instagram' },
                                            { label: 'Referral', value: 'Referral' },
                                            { label: 'Telegram', value: 'Telegram' },
                                            { label: 'Other', value: 'Other' }
                                        ]}
                                        onChange={val => setFormData({...formData, how_did_they_find_us: val})}
                                        icon={Share2}
                                    />
                                </div>
                            </div>

                            {/* Measurements Section ✨ */}
                            <div>
                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-widest mb-4">Measurements</p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <SizeToggleGroup label="Shirt" field="shirt_size" sizes={SHIRT_SIZES} />
                                    <SizeToggleGroup label="Jacket" field="jacket_size" sizes={JACKET_SIZES} />
                                    <SizeToggleGroup label="Pants" field="pants_size" sizes={PANTS_SIZES} />
                                    <SizeToggleGroup label="Shoes" field="shoes_size" sizes={SHOES_SIZES} />
                                </div>
                            </div>

                            {/* Staff & Preferences */}
                            <div>
                                <p className="text-[10px] font-black text-attire-accent uppercase tracking-widest mb-4">Staff & Preferences</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <CustomDropdown 
                                            label="Host"
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
                                            <input type="text" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" placeholder="Host name..." />
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
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
                                            <input type="text" value={formData.assistant} onChange={e => setFormData({...formData, assistant: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all" placeholder="Assistant name..." />
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <CustomDropdown 
                                            label="Color preference"
                                            selected={formData.preferred_color}
                                            options={COLOR_OPTIONS}
                                            onChange={val => setFormData({...formData, preferred_color: val})}
                                            icon={Palette}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Notes</label>
                                        <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl py-3 px-5 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all h-20 resize-none" placeholder="Add any details..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-grow py-3.5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-black transition-all">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-grow py-3.5 bg-attire-accent text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <LumaSpin className="animate-spin" size="sm" /> : <Check size={14} />}
                                {saving ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </ModernModal>
            </div>
        </ErrorBoundary>
    );
};

export default CustomerProfileManager;
