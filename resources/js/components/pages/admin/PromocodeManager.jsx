import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Trash2, Calendar, Percent, Tag, X, Check, Search, Copy, CheckCheck, Sparkles, Activity } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import Swal from 'sweetalert2';
import ModernModal from '../../common/ModernModal';
import DatePicker from '@/components/ui/DatePicker';


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
                title: 'Access Denied',
                text: 'Authentication required for ledger access.',
                background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc',
                color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542',
                confirmButtonColor: '#0d3542'
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
        if (e) e.preventDefault();
        
        if (!formData.name.trim() || !formData.discount_percentage || !formData.expires_at) return;

        const generatedCode = `${formData.name.replace(/\s+/g, '').toUpperCase()}${formData.discount_percentage}`;

        try {
            Swal.fire({
                title: 'Encoding...',
                allowOutsideClick: false,
                background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc',
                color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542',
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
                title: 'Protocol Failed',
                text: error.response?.data?.message || 'Conflict detected in ledger.',
                background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc',
                color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542',
                confirmButtonColor: '#0d3542'
            });
        }
    };

    const handleDelete = async (id, code) => {
        const result = await Swal.fire({
            title: 'Revoke Protocol',
            text: `Permanent removal of ${code}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: 'transparent',
            confirmButtonText: 'REVOKE',
            cancelButtonText: 'ABORT',
            background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc',
            color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542',
            customClass: {
                confirmButton: 'px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest',
                cancelButton: 'px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400'
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/v1/admin/promocodes/${id}`);
                setPromocodes(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'System Error',
                    background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc',
                    color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542',
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
        <div className="w-full space-y-12 pb-24">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#fdfdfc] dark:bg-[#161b22] p-10 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-3xl shadow-lg shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10">
                        <Ticket size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">
                            Promocode Ledger
                        </h1>
                        <p className="text-xs font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em] mt-1">
                            Campaign Management Hub
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/20 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH VAULT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-black/5 dark:bg-[#0d1117] border-2 border-black/5 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-[11px] font-black tracking-widest text-gray-900 dark:text-white focus:outline-none focus:border-[#0d3542]/20 dark:focus:border-[#58a6ff]/20 transition-all uppercase placeholder:text-gray-300 dark:placeholder:text-white/5"
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl py-6 px-8 text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10"
                    >
                        <Plus size={16} className="mr-2" /> New Protocol
                    </Button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex justify-center py-32">
                    <LumaSpin size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    
                    {/* Active */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                            <h2 className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.4em]">
                                Live Repository
                            </h2>
                            <Badge className="bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 text-[#0d3542] dark:text-[#58a6ff] border-none text-[10px] font-black">{activeCodes.length}</Badge>
                        </div>
                        
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {activeCodes.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-gray-400/30 dark:text-white/10 text-[10px] font-black uppercase tracking-[0.3em] border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem] bg-black/[0.01]">Empty Set</motion.div>
                                ) : (
                                    activeCodes.map((code) => (
                                        <motion.div layout key={code.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                            <PromocodeCard code={code} onDelete={handleDelete} status="active" />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Expired */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-1 w-8 bg-gray-200 dark:bg-[#30363d] rounded-full" />
                            <h2 className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.4em]">
                                Archive Vault
                            </h2>
                            <Badge className="bg-black/5 dark:bg-white/5 text-gray-400 dark:text-[#8b949e]/40 border-none text-[10px] font-black">{expiredCodes.length}</Badge>
                        </div>
                        
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {expiredCodes.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-gray-400/30 dark:text-white/10 text-[10px] font-black uppercase tracking-[0.3em] border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem] bg-black/[0.01]">Void State</motion.div>
                                ) : (
                                    expiredCodes.map((code) => (
                                        <motion.div layout key={code.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                            <PromocodeCard code={code} onDelete={handleDelete} status="expired" />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            )}

            {/* Creation Modal */}
            <ModernModal isOpen={isCreating} onClose={() => setIsCreating(false)} maxWidth="max-w-xl" showCloseButton={false}>
                <div className="px-10 py-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 rounded-2xl border border-[#0d3542]/20 dark:border-[#58a6ff]/20 text-[#0d3542] dark:text-[#58a6ff]">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-gray-900 dark:text-white leading-none">New Protocol</h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 font-black uppercase tracking-widest mt-1.5">Asset Encoding</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="p-10 space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Campaign Designation</label>
                        <input
                            type="text" name="name" value={formData.name} onChange={handleInputChange} required
                            className="w-full bg-black/5 dark:bg-[#0d1117] border-2 border-black/5 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white text-[15px] font-black focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#111] focus:outline-none transition-all uppercase placeholder:text-gray-300 dark:placeholder:text-white/5"
                            placeholder="E.G. ANNIVERSARY EVENT"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Discount Ratio</label>
                            <div className="relative group">
                                <input
                                    type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleInputChange} required min="1" max="100"
                                    className="w-full bg-black/5 dark:bg-[#0d1117] border-2 border-black/5 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white text-xl font-mono font-black focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#111] outline-none transition-all"
                                    placeholder="0"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-[#0d3542] dark:text-[#58a6ff]">%</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Expiry Protocol</label>
                            <DatePicker 
                                required
                                value={formData.expires_at}
                                onChange={(e) => setFormData(p => ({ ...p, expires_at: e.target.value }))}
                                name="expires_at"
                            />
                        </div>
                    </div>

                    {/* Code Preview */}
                    {formData.name && formData.discount_percentage && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 rounded-[1.5rem] border border-[#0d3542]/10 dark:border-[#58a6ff]/10">
                            <span className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.2em]">Generated Asset Code</span>
                            <p className="font-mono text-2xl font-black text-gray-900 dark:text-white tracking-[0.3em] mt-2 truncate">
                                {formData.name.replace(/\s+/g, '').toUpperCase()}{formData.discount_percentage}
                            </p>
                        </motion.div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <Button variant="outline" type="button" onClick={() => setIsCreating(false)} className="flex-1 py-7 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border-2 border-black/15 dark:border-[#30363d] text-gray-400">ABORT</Button>
                        <Button type="submit" className="flex-[2] py-7 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10">
                            AUTHORIZE & COMMIT
                        </Button>
                    </div>
                </form>
            </ModernModal>
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
        <div className={`group relative bg-[#fdfdfc] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-[2.5rem] overflow-hidden hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 transition-all duration-500 shadow-none ${!isActive && 'opacity-40 grayscale pointer-events-none'}`}>
            {/* Ticket Cut-outs */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-background dark:bg-[#111111] border-r border-black/5 dark:border-[#30363d] rounded-full z-10" />
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-background dark:bg-[#111111] border-l border-black/5 dark:border-[#30363d] rounded-full z-10" />
            
            <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#0d3542] dark:bg-[#58a6ff] animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d3542] dark:text-[#58a6ff]">
                        {isActive ? 'PROTOCOL ACTIVE' : 'EXPIRED ARCHIVE'}
                    </span>
                </div>
                <button onClick={() => onDelete(code.id, code.code)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span 
                                onClick={isActive ? handleCopy : undefined} 
                                className={`font-mono text-3xl font-black tracking-[0.2em] transition-colors block ${
                                    isActive ? 'cursor-pointer text-gray-900 dark:text-white hover:text-[#0d3542] dark:hover:text-[#58a6ff]' : 'text-gray-400'
                                }`}
                            >
                                {code.code}
                            </span>
                            {isActive && (
                                <button 
                                    onClick={handleCopy}
                                    className={`p-2 rounded-xl transition-all ${
                                        copied 
                                        ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' 
                                        : 'bg-black/5 dark:bg-white/5 hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 text-gray-500 hover:text-[#0d3542] dark:hover:text-[#58a6ff]'
                                    }`}
                                    title="Copy Protocol"
                                >
                                    {copied ? <CheckCheck size={16} className="animate-pulse" /> : <Copy size={16} />}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">{code.name}</span>
                            <span className="opacity-20">•</span>
                            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">
                                <Calendar size={12} />
                                {dateFormatted}
                            </span>
                        </div>
                    </div>
                    <div className={`h-20 w-20 shrink-0 rounded-3xl flex flex-col items-center justify-center border-2 transition-all duration-500 ${
                        isActive ? 'bg-[#0d3542]/5 border-[#0d3542]/10 text-[#0d3542] dark:bg-[#58a6ff]/5 dark:border-[#58a6ff]/10 dark:text-[#58a6ff]' : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                        <span className="text-2xl font-black leading-none">{code.discount_percentage}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">% OFF</span>
                    </div>
                </div>
                
                <div className="pt-6 border-t border-dashed border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-3 px-1">
                        <span className="flex items-center gap-2"><Activity size={12} /> Utilization</span>
                        <span className="text-gray-900 dark:text-white font-mono">{code.times_used || 0} <span className="opacity-30">/</span> {code.max_usage || '∞'}</span>
                    </div>
                    <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${code.max_usage ? (code.times_used / code.max_usage) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#0d3542] dark:bg-[#58a6ff]" 
                        />
                    </div>
                </div>
            </div>
            

        </div>
    );
};

export default PromocodeManager;
