import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Trash2, Plus, Edit, X, AlertCircle, Check,
    ChevronDown, ChevronRight, ChevronLeft, UserCheck, Share2,
    Search, Eye, Globe, Phone, PlusCircle, UserPlus, ShieldCheck,
    Users, Briefcase, Palette, Ruler, Loader2, Download
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import ModernModal from '../../common/ModernModal.jsx';
import DatePicker from '@/components/ui/DatePicker';
import { downloadCSV, fetchAllPages } from '@/utils/csvExport';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
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
    { label: 'Brown', value: 'BROWN' },
    { label: 'Beige', value: 'BEIGE' },
    { label: 'Other', value: 'OTHER' }
];

const STATUS_OPTIONS = [
    { label: 'All', value: 'All' },
    { label: 'New', value: 'New' },
    { label: 'Returning', value: 'Returning' },
    { label: 'VIP', value: 'VIP' }
];

/* ------------------------------------------------------------------ */
/*  Loading                                                            */
/* ------------------------------------------------------------------ */
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LumaSpin size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">
            Loading profiles…
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */
const EmptyState = ({ search }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center mb-4">
            <User size={24} className="text-gray-300 dark:text-[#8b949e]/30" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">
            {search ? 'No matching records' : 'No customer profiles yet'}
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
const StatusBadge = React.memo(({ status }) => {
    const styles = {
        VIP: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        Returning: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
        New: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    const dots = {
        VIP: 'bg-amber-400',
        Returning: 'bg-blue-400',
        New: 'bg-emerald-400',
    };
    const cfg = styles[status] || styles.New;
    const dot = dots[status] || dots.New;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${cfg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {status}
        </span>
    );
});

/* ------------------------------------------------------------------ */
/*  Size Toggle Group                                                  */
/* ------------------------------------------------------------------ */
const SizeToggleGroup = React.memo(({ label, field, sizes, formData, onToggle }) => (
    <div className="bg-black/[0.015] dark:bg-white/[0.015] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
            <Ruler size={11} className="text-[#0d3542] dark:text-[#58a6ff] opacity-40" />
            <span className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
            {sizes.map(size => {
                const isSelected = formData[field] === size;
                return (
                    <button
                        key={size}
                        type="button"
                        onClick={() => onToggle(field, size)}
                        className={`min-w-[38px] h-8 rounded-lg text-[10px] font-bold transition-all border ${
                            isSelected
                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff] text-white dark:text-black'
                                : 'bg-white dark:bg-[#161b22] border-black/[0.08] dark:border-[#30363d] text-gray-400 dark:text-[#8b949e]/40 hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'
                        }`}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    </div>
));

/* ------------------------------------------------------------------ */
/*  Customer Row                                                       */
/* ------------------------------------------------------------------ */
const CustomerRow = React.memo(({ profile, onEdit, onDelete, onView }) => (
    <tr className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors group">
        <td className="px-4 py-4">
            <p className="text-[13px] font-bold text-gray-900 dark:text-[#c9d1d9] truncate">
                {profile.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={9} className="text-gray-400 dark:text-[#8b949e]/40" />
                <span className="text-[10px] text-gray-400 dark:text-[#8b949e]/30 font-mono">{profile.phone || '—'}</span>
            </div>
        </td>
        <td className="px-4 py-4 hidden sm:table-cell">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/50 uppercase tracking-widest">
                <Globe size={10} className="opacity-40" />
                {profile.nationality || '—'}
            </span>
        </td>
        <td className="px-4 py-4 hidden md:table-cell">
            <span className="text-[10px] font-bold text-gray-600 dark:text-[#8b949e] uppercase tracking-widest">
                {profile.host || '—'}
            </span>
        </td>
        <td className="px-4 py-4">
            <StatusBadge status={profile.client_status} />
        </td>
        <td className="px-4 py-4 w-24" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/admin/customer-profiles/${profile.id}`} className="p-2 rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="View">
                    <Eye size={13} />
                </Link>
                <button onClick={() => onEdit(profile)} className="p-2 rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Edit">
                    <Edit size={13} />
                </button>
                <button onClick={() => onDelete(profile.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all" title="Delete">
                    <Trash2 size={13} />
                </button>
            </div>
        </td>
    </tr>
));

/* ------------------------------------------------------------------ */
/*  Customer Card (mobile)                                             */
/* ------------------------------------------------------------------ */
const CustomerCard = React.memo(({ profile, onEdit, onDelete, onView }) => (
    <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl p-4 hover:border-[#0d3542]/15 dark:hover:border-[#58a6ff]/15 transition-all"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
                <Link to={`/admin/customer-profiles/${profile.id}`} className="text-[13px] font-bold text-gray-900 dark:text-[#c9d1d9] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors truncate block">
                    {profile.name}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 dark:text-[#8b949e]/50">
                    <span className="flex items-center gap-1"><Phone size={9} className="opacity-40" />{profile.phone || '—'}</span>
                    <span className="flex items-center gap-1"><Globe size={9} className="opacity-40" />{profile.nationality || '—'}</span>
                </div>
            </div>
            <StatusBadge status={profile.client_status} />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <span className="text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/50 uppercase tracking-widest">
                Host: {profile.host || '—'}
            </span>
            <div className="flex items-center gap-1">
                <Link to={`/admin/customer-profiles/${profile.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <Eye size={12} />
                </Link>
                <button onClick={() => onEdit(profile)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <Edit size={12} />
                </button>
                <button onClick={() => onDelete(profile.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all">
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    </motion.div>
));

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
const StatCard = React.memo(({ label, value, icon: Icon, accent }) => (
    <div className="bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-blue-500/10 text-blue-500' : 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]'}`}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-[#c9d1d9]">{value}</p>
        </div>
    </div>
));

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
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
        current_page: 1, last_page: 1, total: 0, per_page: 15
    });

    const [showCustomHost, setShowCustomHost] = useState(false);
    const [showCustomAssistant, setShowCustomAssistant] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 10),
        client_status: 'New', name: '', nationality: 'Cambodia', phone: '',
        host: '', assistant: '', how_did_they_find_us: 'Facebook',
        shirt_size: '', jacket_size: '', pants_size: '', shoes_size: '',
        preferred_color: '', color_notes: '', remarks: '', birthday: '', is_vip: false,
    });

    /* ---- Data Fetch ---- */
    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
            const res = await axios.get('/api/v1/admin/customer-profiles', {
                params: { page, search: searchQuery, status: filterStatus, per_page: pagination.per_page },
                headers: { 'Authorization': `Bearer ${token}`, 'X-Active-Outlet': outlet },
            });
            setProfiles(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                per_page: res.data.per_page
            });
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterStatus, pagination.per_page]);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(1), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterStatus]);

    /* ---- Handlers ---- */
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= pagination.last_page) fetchData(page);
    }, [fetchData, pagination.last_page]);

    const handleOpenModal = useCallback((profile = null) => {
        setError(null);
        if (profile) {
            setEditingProfile(profile);
            setFormData({
                date: profile.date || new Date().toISOString().slice(0, 10),
                client_status: profile.client_status || 'New',
                name: profile.name || '',
                nationality: profile.nationality || 'Cambodia',
                phone: profile.phone || '',
                host: profile.host || '',
                assistant: profile.assistant || '',
                how_did_they_find_us: profile.how_did_they_find_us || 'Facebook',
                shirt_size: profile.shirt_size || '',
                jacket_size: profile.jacket_size || '',
                pants_size: profile.pants_size || '',
                shoes_size: profile.shoes_size || '',
                preferred_color: profile.preferred_color || '',
                color_notes: profile.color_notes || '',
                remarks: profile.remarks || '',
                birthday: profile.birthday || '',
                is_vip: profile.is_vip || false,
            });
            setShowCustomHost(!!profile.host && !STAFF_NAMES.includes(profile.host));
            setShowCustomAssistant(!!profile.assistant && !STAFF_NAMES.includes(profile.assistant));
        } else {
            setEditingProfile(null);
            setFormData({
                date: new Date().toISOString().slice(0, 10),
                client_status: 'New', name: '', nationality: 'Cambodia', phone: '',
                host: '', assistant: '', how_did_they_find_us: 'Facebook',
                shirt_size: '', jacket_size: '', pants_size: '', shoes_size: '',
                preferred_color: '', color_notes: '', remarks: '', birthday: '', is_vip: false,
            });
            setShowCustomHost(false);
            setShowCustomAssistant(false);
        }
        setShowModal(true);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
            const headers = { 'Authorization': `Bearer ${token}`, 'X-Active-Outlet': outlet };
            if (editingProfile) {
                await axios.put(`/api/v1/admin/customer-profiles/${editingProfile.id}`, formData, { headers });
            } else {
                await axios.post('/api/v1/admin/customer-profiles', formData, { headers });
            }
            setShowModal(false);
            fetchData(pagination.current_page);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    }, [editingProfile, formData, fetchData, pagination.current_page]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this profile?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const outlet = localStorage.getItem('active_outlet') || 'attire_lounge';
            await axios.delete(`/api/v1/admin/customer-profiles/${id}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'X-Active-Outlet': outlet },
            });
            fetchData(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete.');
        }
    }, [fetchData, pagination.current_page]);

    const toggleSize = useCallback((field, size) => {
        setFormData(prev => ({ ...prev, [field]: prev[field] === size ? '' : size }));
    }, []);

    const filteredProfiles = useMemo(() => {
        if (filterStatus === 'All') return profiles;
        return profiles.filter(p => p.client_status === filterStatus);
    }, [profiles, filterStatus]);

    /* ---- Export (all pages, honours current search + status filters) ---- */
    const handleExport = async () => {
        try {
            const all = await fetchAllPages('/api/v1/admin/customer-profiles', {
                search: searchQuery || undefined,
                status: filterStatus !== 'All' ? filterStatus : undefined,
            });
            const rows = [];
            rows.push(['ATTIRE LOUNGE — CUSTOMER PROFILES']);
            rows.push(['Exported', new Date().toLocaleString()]);
            rows.push(['Total Profiles', all.length]);
            rows.push([]);
            rows.push(['Name', 'Phone', 'Status', 'Nationality', 'Host', 'Assistant', 'How Found',
                'Shirt', 'Jacket', 'Pants', 'Shoes', 'Preferred Color', 'Color Notes', 'Birthday', 'Added', 'Remarks']);
            all.forEach(p => rows.push([
                p.name || '', p.phone || '', p.client_status || '', p.nationality || '',
                p.host || '', p.assistant || '', p.how_did_they_find_us || '',
                p.shirt_size || '', p.jacket_size || '', p.pants_size || '', p.shoes_size || '',
                p.preferred_color || '', p.color_notes || '', p.birthday || '', p.date || '', p.remarks || '',
            ]));
            downloadCSV(rows, `customer-profiles-${new Date().toISOString().split('T')[0]}.csv`);
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed — please try again.');
        }
    };

    return (
        <ErrorBoundary>
            <div className="space-y-5 pb-16 max-w-[1100px] mx-auto px-4 sm:px-6 mt-4">
                {/* ---- Header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                            Customers
                        </h1>
                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 font-bold uppercase tracking-[0.3em] mt-1">
                            {pagination.total} total profiles
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="h-9 px-4 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-[#8b949e] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] active:scale-[0.97] transition-all flex items-center gap-2"
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-9 px-5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
                        >
                            <Plus size={14} />
                            <span className="hidden sm:inline">Add Customer</span>
                        </button>
                    </div>
                </div>

                {/* ---- Stats ---- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard label="Total" value={pagination.total} icon={Users} />
                    <StatCard label="VIP" value={profiles.filter(p => p.client_status === 'VIP').length} icon={ShieldCheck} />
                    <StatCard label="Appointments" value={stats?.pending_appointments || 0} icon={UserCheck} accent />
                </div>

                {/* ---- Filters ---- */}
                <div className="bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl p-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg pl-9 pr-8 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterStatus(opt.value)}
                                    className={`h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                        filterStatus === opt.value
                                            ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff] text-white dark:text-black'
                                            : 'border-black/[0.06] dark:border-white/[0.06] text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ---- Content ---- */}
                {loading ? (
                    <LoadingState />
                ) : filteredProfiles.length === 0 ? (
                    <EmptyState search={searchQuery} />
                ) : (
                    <>
                        {/* Desktop: Table */}
                        <div className="hidden md:block bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/[0.05] dark:border-[#30363d]">
                                            {['Name', 'Nationality', 'Host', 'Status', ''].map((h, i) => (
                                                <th
                                                    key={h}
                                                    className={`px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#8b949e]/40 whitespace-nowrap ${
                                                        i === 1 ? 'hidden sm:table-cell' : ''
                                                    } ${i === 2 ? 'hidden md:table-cell' : ''}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.04] dark:divide-[#30363d]">
                                        <AnimatePresence>
                                            {filteredProfiles.map(profile => (
                                                <CustomerRow
                                                    key={profile.id}
                                                    profile={profile}
                                                    onEdit={handleOpenModal}
                                                    onDelete={handleDelete}
                                                    onView={(p) => window.location.href = `/admin/customer-profiles/${p.id}`}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="px-4 py-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-widest">
                                        Total: {pagination.total}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] min-w-[50px] text-center">
                                            {pagination.current_page}/{pagination.last_page}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Card grid */}
                        <div className="md:hidden grid grid-cols-1 gap-3">
                            <AnimatePresence>
                                {filteredProfiles.map(profile => (
                                    <CustomerCard
                                        key={profile.id}
                                        profile={profile}
                                        onEdit={handleOpenModal}
                                        onDelete={handleDelete}
                                        onView={(p) => window.location.href = `/admin/customer-profiles/${p.id}`}
                                    />
                                ))}
                            </AnimatePresence>
                            {/* Mobile pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        {pagination.current_page}/{pagination.last_page}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ---- Modal ---- */}
                <ModernModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingProfile ? 'Edit Customer' : 'New Customer'}
                    maxWidth="max-w-2xl"
                >
                    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto bg-white dark:bg-[#0d1117]">
                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase">
                                <AlertCircle size={12} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div>
                            <SectionLabel icon={<User size={11} />} label="Basic Information" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <InputField label="Name *" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Customer name" required />
                                <InputField label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} placeholder="012 345 678" />
                                <DateField label="Archive Date *" value={formData.date} onChange={v => setFormData({ ...formData, date: v })} name="date" required />
                                <DateField label="Birthday" value={formData.birthday} onChange={v => setFormData({ ...formData, birthday: v })} name="birthday" />
                                <SelectField
                                    label="Status"
                                    value={formData.client_status}
                                    options={[
                                        { label: 'New', value: 'New' },
                                        { label: 'Returning', value: 'Returning' },
                                        { label: 'VIP', value: 'VIP' }
                                    ]}
                                    onChange={v => setFormData({ ...formData, client_status: v })}
                                    icon={<UserCheck size={11} />}
                                />
                                <SelectField
                                    label="Nationality"
                                    value={formData.nationality}
                                    options={NATIONALITY_OPTIONS}
                                    onChange={v => setFormData({ ...formData, nationality: v })}
                                    icon={<Globe size={11} />}
                                />
                                <SelectField
                                    label="Found via"
                                    value={formData.how_did_they_find_us}
                                    options={[
                                        { label: 'Facebook', value: 'Facebook' },
                                        { label: 'Instagram', value: 'Instagram' },
                                        { label: 'Referral', value: 'Referral' },
                                        { label: 'Telegram', value: 'Telegram' },
                                        { label: 'Other', value: 'Other' }
                                    ]}
                                    onChange={v => setFormData({ ...formData, how_did_they_find_us: v })}
                                    icon={<Share2 size={11} />}
                                />
                                <div className="flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.06]">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">VIP Member</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_vip: !prev.is_vip }))}
                                        className={`w-10 h-5 rounded-full transition-all relative ${formData.is_vip ? 'bg-[#0d3542] dark:bg-[#58a6ff]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <motion.div
                                            animate={{ x: formData.is_vip ? 20 : 2 }}
                                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Measurements */}
                        <div>
                            <SectionLabel icon={<Ruler size={11} />} label="Measurements" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <SizeToggleGroup label="Shirt" field="shirt_size" sizes={SHIRT_SIZES} formData={formData} onToggle={toggleSize} />
                                <SizeToggleGroup label="Jacket" field="jacket_size" sizes={JACKET_SIZES} formData={formData} onToggle={toggleSize} />
                                <SizeToggleGroup label="Pants" field="pants_size" sizes={PANTS_SIZES} formData={formData} onToggle={toggleSize} />
                                <SizeToggleGroup label="Shoes" field="shoes_size" sizes={SHOES_SIZES} formData={formData} onToggle={toggleSize} />
                            </div>
                        </div>

                        {/* Staff & Preferences */}
                        <div>
                            <SectionLabel icon={<Briefcase size={11} />} label="Staff & Preferences" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <div className="space-y-1.5">
                                    <SelectField
                                        label="Host"
                                        value={STAFF_NAMES.includes(formData.host) ? formData.host : (formData.host ? 'custom' : '')}
                                        options={STAFF_OPTIONS}
                                        onChange={val => {
                                            if (val === 'custom') {
                                                setShowCustomHost(true);
                                                setFormData({ ...formData, host: '' });
                                            } else {
                                                setShowCustomHost(false);
                                                setFormData({ ...formData, host: val });
                                            }
                                        }}
                                        icon={<Briefcase size={11} />}
                                    />
                                    {showCustomHost && (
                                        <InputField value={formData.host} onChange={v => setFormData({ ...formData, host: v })} placeholder="Host name..." />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <SelectField
                                        label="Assistant"
                                        value={STAFF_NAMES.includes(formData.assistant) ? formData.assistant : (formData.assistant ? 'custom' : '')}
                                        options={STAFF_OPTIONS}
                                        onChange={val => {
                                            if (val === 'custom') {
                                                setShowCustomAssistant(true);
                                                setFormData({ ...formData, assistant: '' });
                                            } else {
                                                setShowCustomAssistant(false);
                                                setFormData({ ...formData, assistant: val });
                                            }
                                        }}
                                        icon={<UserCheck size={11} />}
                                    />
                                    {showCustomAssistant && (
                                        <InputField value={formData.assistant} onChange={v => setFormData({ ...formData, assistant: v })} placeholder="Assistant name..." />
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <SelectField
                                        label="Color Preference"
                                        value={formData.preferred_color}
                                        options={COLOR_OPTIONS}
                                        onChange={v => setFormData({ ...formData, preferred_color: v })}
                                        icon={<Palette size={11} />}
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">Notes</label>
                                    <textarea
                                        value={formData.remarks}
                                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                        rows={3}
                                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] p-3 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors resize-none placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                                        placeholder="Add any details..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-9 border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="flex-1 h-9 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </ModernModal>
            </div>
        </ErrorBoundary>
    );
};

/* ------------------------------------------------------------------ */
/*  Section Label                                                      */
/* ------------------------------------------------------------------ */
const SectionLabel = React.memo(({ icon, label }) => (
    <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/50 flex items-center gap-1.5">
            {icon}
            {label}
        </span>
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
    </div>
));

/* ------------------------------------------------------------------ */
/*  Input Field                                                         */
/* ------------------------------------------------------------------ */
const InputField = React.memo(({ label, icon, onChange, ...props }) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                {icon && <span className="opacity-40">{icon}</span>}
                {label}
            </label>
        )}
        <input
            {...props}
            onChange={e => onChange?.(e.target.value)}
            className="h-10 px-3 bg-black/[0.02] dark:bg-white/[0.02] text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
        />
    </div>
));

/* ------------------------------------------------------------------ */
/*  Date Field                                                          */
/* ------------------------------------------------------------------ */
const DateField = React.memo(({ label, value, onChange, name, required }) => (
    <div className="flex flex-col gap-1.5">
        {label && <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest">{label}</label>}
        <DatePicker required={required} value={value} onChange={e => onChange(e.target.value)} name={name} />
    </div>
));

/* ------------------------------------------------------------------ */
/*  Select Field (simplified dropdown)                                 */
/* ------------------------------------------------------------------ */
const SelectField = React.memo(({ label, value, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.value === value);
    const displayName = selectedItem ? selectedItem.label : label;

    return (
        <div className="flex flex-col gap-1.5 relative">
            <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                {Icon && <span className="opacity-40">{Icon}</span>}
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] text-left outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-all flex items-center justify-between"
            >
                <span className="truncate">{displayName}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors ${
                                    value === opt.value
                                        ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                        : 'text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
});

export default CustomerProfileManager;
