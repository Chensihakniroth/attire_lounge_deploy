import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Trash2, Calendar, Percent, Tag, X, Check, Loader2, Search, Copy, CheckCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

// ----------------------------------------------------------------------
// Styled Date Picker Component
// ----------------------------------------------------------------------
const CustomDatePicker = ({ value, onChange, label, required }) => {
    return (
        <div className="relative group">
            {label && (
                <label className="block text-xs font-semibold text-attire-charcoal/50 dark:text-white/50 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-[#d4af37]">
                    {label} {required && <span className="text-[#d4af37]">*</span>}
                </label>
            )}
            <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-attire-charcoal/40 dark:text-white/40 pointer-events-none group-focus-within:text-[#d4af37] transition-colors z-10">
                    <Calendar size={18} />
                </div>
                <input
                    type="date"
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-attire-charcoal dark:text-white font-medium focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 transition-all cursor-pointer shadow-inner placeholder-transparent hover:border-black/20 dark:hover:border-white/20"
                />
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const PromocodeManager = () => {
    const [promocodes, setPromocodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        discount_percentage: '',
        expires_at: ''
    });

    useEffect(() => {
        fetchPromocodes();
    }, []);

    const fetchPromocodes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/v1/admin/promocodes');
            setPromocodes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Load failed.',
                background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#151515',
                confirmButtonColor: '#d4af37'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.discount_percentage || !formData.expires_at) return;

        const generatedCode = `${formData.name.replace(/\s+/g, '').toUpperCase()}${formData.discount_percentage}`;

        try {
            Swal.fire({
                title: 'Creating...',
                allowOutsideClick: false,
                background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#151515',
                didOpen: () => Swal.showLoading()
            });

            await axios.post('/api/v1/admin/promocodes', {
                ...formData,
                code: generatedCode
            });
            
            Swal.close();
            setFormData({ name: '', discount_percentage: '', expires_at: '' });
            setIsCreating(false);
            fetchPromocodes();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: error.response?.data?.message || 'Error occurred.',
                background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#151515',
                confirmButtonColor: '#d4af37'
            });
        }
    };

    const handleDelete = async (id, code) => {
        const result = await Swal.fire({
            title: 'Revoke',
            text: `Remove ${code}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: document.documentElement.classList.contains('dark') ? '#262626' : '#f4f4f4',
            confirmButtonText: 'Revoke',
            background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#151515',
            customClass: {
                confirmButton: 'px-6 py-2 rounded-xl text-sm font-semibold tracking-wide',
                cancelButton: `px-6 py-2 rounded-xl text-sm font-semibold tracking-wide border ${document.documentElement.classList.contains('dark') ? 'border-white/10' : 'border-black/10'}`
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/v1/admin/promocodes/${id}`);
                setPromocodes(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    background: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#fff',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#151515',
                    confirmButtonColor: '#d4af37'
                });
            }
        }
    };

    const filteredCodes = promocodes.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return p.code.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower);
    });

    const now = new Date();
    now.setHours(0,0,0,0);
    
    const activeCodes = filteredCodes.filter(p => {
        const exp = new Date(p.expires_at);
        exp.setHours(23,59,59,999);
        return exp >= now;
    });
    
    const expiredCodes = filteredCodes.filter(p => {
        const exp = new Date(p.expires_at);
        exp.setHours(23,59,59,999);
        return exp < now;
    });

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between flex-wrap gap-4 items-end">
                <div>
                    <h1 className="text-3xl font-light text-attire-charcoal dark:text-white tracking-widest">
                        PROMOCODES
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-attire-charcoal/40 dark:text-white/40 group-focus-within:text-[#d4af37] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/5 dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-attire-charcoal dark:text-white focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 transition-all placeholder:text-attire-charcoal/30 dark:placeholder:text-white/30"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-6 py-2.5 bg-attire-charcoal dark:bg-white text-white dark:text-black rounded-full text-sm font-semibold hover:bg-[#d4af37] dark:hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin opacity-50" />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Active */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h2 className="text-[10px] font-black text-attire-charcoal/40 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-20"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37] ring-4 ring-[#d4af37]/10"></span>
                            </span>
                            Active
                        </h2>
                        
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {activeCodes.length === 0 ? (
                                    <div className="py-10 text-center text-attire-charcoal/30 dark:text-white/30 text-sm border border-black/5 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-[#0a0a0a]">No active codes</div>
                                ) : (
                                    activeCodes.map((code) => (
                                        <motion.div layout key={code.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <PromocodeCard code={code} onDelete={handleDelete} status="active" />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Expired */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h2 className="text-[10px] font-black text-attire-charcoal/30 dark:text-white/20 uppercase tracking-[0.2em] flex items-center gap-2.5">
                            <span className="relative flex h-2 w-2 opacity-50">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500/50 ring-4 ring-red-500/5"></span>
                            </span>
                            Expired
                        </h2>
                        
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {expiredCodes.length === 0 ? (
                                    <div className="py-10 text-center text-attire-charcoal/20 dark:text-white/20 text-sm border border-black/5 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-[#0a0a0a]">No expired codes</div>
                                ) : (
                                    expiredCodes.map((code) => (
                                        <motion.div layout key={code.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <PromocodeCard code={code} onDelete={handleDelete} status="expired" />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            )}

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-light text-attire-charcoal dark:text-white tracking-widest">NEW CODE</h2>
                                <button onClick={() => setIsCreating(false)} className="text-attire-charcoal/40 dark:text-white/40 hover:text-attire-charcoal dark:hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-5">
                                <div className="group">
                                    <label className="block text-[10px] font-semibold text-attire-charcoal/40 dark:text-white/40 uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        className="w-full bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-attire-charcoal dark:text-white text-sm focus:border-[#d4af37]/60 focus:outline-none"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-semibold text-attire-charcoal/40 dark:text-white/40 uppercase tracking-wider mb-2">Discount (%)</label>
                                    <input
                                        type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleInputChange} required min="1" max="100"
                                        className="w-full bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-attire-charcoal dark:text-white text-sm focus:border-[#d4af37]/60 focus:outline-none"
                                    />
                                </div>

                                <CustomDatePicker value={formData.expires_at} onChange={(e) => setFormData(p => ({ ...p, expires_at: e.target.value }))} label="Expiry Date" required />

                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-attire-charcoal dark:bg-white text-white dark:text-black py-3 rounded-xl text-sm font-semibold hover:bg-[#d4af37] dark:hover:bg-[#d4af37] transition-colors">
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ----------------------------------------------------------------------
// Sub-component: PromocodeCard
// ----------------------------------------------------------------------
const PromocodeCard = ({ code, status, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const dateFormatted = new Date(code.expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const handleCopy = () => {
        navigator.clipboard.writeText(code.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isActive = status === 'active';

    return (
        <div className={`relative group p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
            isActive 
                ? 'bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border-black/10 dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#d4af37]/30' 
                : 'bg-black/5 dark:bg-white/[0.01] border-transparent opacity-50 grayscale'
        }`}>
            {/* Design accents for a "ticket" look */}
            {isActive && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full z-0" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full z-0" />
                </div>
            )}

            <div className="flex-1 overflow-hidden relative z-10 flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-1.5">
                    <span 
                        onClick={handleCopy} 
                        className={`font-mono text-xl font-black tracking-[0.15em] cursor-pointer transition-colors truncate ${
                            isActive ? 'text-attire-charcoal dark:text-white hover:text-[#d4af37]' : 'text-gray-400'
                        }`}
                    >
                        {code.code}
                    </span>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter flex items-center gap-1 ${
                        isActive ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                    }`}>
                        <Sparkles size={10} className="animate-pulse" />
                        {code.discount_percentage}% OFF
                    </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-attire-charcoal/40 dark:text-white/30">
                    <span className="truncate max-w-[150px]">{code.name}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-50" />
                        {dateFormatted}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={handleCopy} 
                    className="p-2.5 text-attire-charcoal/40 dark:text-white/40 hover:text-attire-charcoal dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
                    title="Copy Code"
                >
                    {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <div className="w-px h-6 bg-black/5 dark:bg-white/5 mx-1" />
                <button 
                    onClick={() => onDelete(code.id, code.code)} 
                    className="p-2.5 text-attire-charcoal/30 dark:text-white/30 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
                    title="Revoke Code"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default PromocodeManager;
