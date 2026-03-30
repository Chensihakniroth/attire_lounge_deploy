import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Trash2, Calendar, Percent, Tag, X, Check, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

// ----------------------------------------------------------------------
// Styled Date Picker Component
// ----------------------------------------------------------------------
const CustomDatePicker = ({ value, onChange, label, required }) => {
    return (
        <div className="relative group">
            {label && (
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-[#d4af37]">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-focus-within:text-[#d4af37] transition-colors">
                    <Calendar size={18} />
                </div>
                <input
                    type="date"
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all cursor-pointer placeholder-transparent"
                    style={{ colorScheme: 'dark' }}
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
    
    // Form state
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
            setPromocodes(response.data);
        } catch (error) {
            console.error('Failed to fetch promocodes', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch promocodes. Please try again.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#d4af37'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim() || !formData.discount_percentage || !formData.expires_at) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#d4af37'
            });
            return;
        }

        const generatedCode = `${formData.name.replace(/\s+/g, '').toUpperCase()}${formData.discount_percentage}`;

        try {
            // Optimistic loading
            Swal.fire({
                title: 'Generating Code...',
                allowOutsideClick: false,
                background: '#1a1a1a',
                color: '#fff',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await axios.post('/api/v1/admin/promocodes', {
                ...formData,
                code: generatedCode
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Promocode Created',
                text: 'The exclusive code is ready for use.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#d4af37',
                timer: 2000,
                showConfirmButton: false
            });

            // Reset form and UI
            setFormData({ name: '', discount_percentage: '', expires_at: '' });
            setIsCreating(false);
            
            // Refresh list
            fetchPromocodes();
        } catch (error) {
            console.error('Failed to create promocode', error);
            const msg = error.response?.data?.message || 'Failed to create promocode.';
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: msg,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#d4af37'
            });
        }
    };

    const handleDelete = async (id, code) => {
        const result = await Swal.fire({
            title: 'Revoke Code?',
            text: `Are you sure you want to revoke the code "${code}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4444',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, Revoke',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/v1/admin/promocodes/${id}`);
                setPromocodes(prev => prev.filter(p => p.id !== id));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Revoked',
                    text: 'The promocode has been revoked.',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#d4af37',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Failed to delete', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to revoke code.',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#d4af37'
                });
            }
        }
    };

    // Filter codes based on search term
    const filteredCodes = promocodes.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return p.code.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower);
    });

    // Determine Active vs Expired
    const now = new Date();
    const activeCodes = filteredCodes.filter(p => new Date(p.expires_at) >= now);
    const expiredCodes = filteredCodes.filter(p => new Date(p.expires_at) < now);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-transparent flex items-center justify-center border border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                        <Ticket className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light text-white tracking-wide">
                            Exclusive <span className="font-semibold text-[#d4af37]">Codes</span>
                        </h1>
                        <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                            Manage and provision premium discounts.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search codes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111111]/80 backdrop-blur border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all placeholder:text-white/30"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group relative px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-[#d4af37] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span>New Code</span>
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-4" />
                    <p className="text-white/40 text-sm">Decoding database records...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Active Codes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest pl-2 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            Active Codes
                        </h2>
                        
                        <div className="space-y-4">
                            <AnimatePresence>
                                {activeCodes.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="py-12 px-6 rounded-2xl border border-white/5 bg-[#0a0a0a] text-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <Ticket className="w-5 h-5 text-white/30" />
                                        </div>
                                        <p className="text-white/40 text-sm">No active codes found.</p>
                                    </motion.div>
                                ) : (
                                    activeCodes.map((code) => (
                                        <PromocodeCard key={code.id} code={code} onDelete={handleDelete} status="active" />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Expired Codes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest pl-2 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            Expired Codes
                        </h2>
                        
                        <div className="space-y-4">
                            <AnimatePresence>
                                {expiredCodes.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="py-12 px-6 rounded-2xl border border-white/5 bg-[#0a0a0a] text-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <Ticket className="w-5 h-5 text-white/30" />
                                        </div>
                                        <p className="text-white/40 text-sm">No expired codes found.</p>
                                    </motion.div>
                                ) : (
                                    expiredCodes.map((code) => (
                                        <PromocodeCard key={code.id} code={code} onDelete={handleDelete} status="expired" />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            )}

            {/* Creation Modal Overlay */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreating(false)}></div>
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-light text-white">Generate Code</h2>
                                    <p className="text-white/40 text-sm mt-1">Create a new exclusive discount</p>
                                </div>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-6 relative z-10">
                                {/* Name Input */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-[#d4af37]">
                                        Client / Campaign Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <Tag className="absolute left-4 w-4 h-4 text-white/30 group-focus-within:text-[#d4af37] transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Niroth"
                                            className="w-full bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-medium placeholder:text-white/20 placeholder:font-normal"
                                        />
                                    </div>
                                    <p className="text-white/30 text-xs mt-2 italic">Output preview: {formData.name ? `${formData.name.replace(/\s+/g, '')}${formData.discount_percentage || 'XX'}` : 'Code Preview'}</p>
                                </div>

                                {/* Discount Input */}
                                <div className="group">
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-[#d4af37]">
                                        Discount Percentage <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <Percent className="absolute left-4 w-4 h-4 text-white/30 group-focus-within:text-[#d4af37] transition-colors" />
                                        <input
                                            type="number"
                                            name="discount_percentage"
                                            value={formData.discount_percentage}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            max="100"
                                            placeholder="10"
                                            className="w-full bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50 transition-all font-medium placeholder:text-white/20 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                {/* Date Picker */}
                                <CustomDatePicker 
                                    label="Expiration Date"
                                    required={true}
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                                />

                                {/* Form Actions */}
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-white text-black py-3.5 rounded-xl font-medium hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        <span>Generate Now</span>
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
    // Format date for display
    const dateObj = new Date(code.expires_at);
    const dateFormatted = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
                relative p-5 rounded-2xl border bg-[#0a0a0a] flex items-center justify-between overflow-hidden group
                ${status === 'active' ? 'border-[#d4af37]/20 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'border-white/5 opacity-80'}
                transition-all duration-300
            `}
        >
            {/* Visual indicator line on the left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'active' ? 'bg-[#d4af37]' : 'bg-white/10'}`}></div>

            <div className="flex-1 ml-2">
                <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-lg font-bold tracking-widest text-white">{code.code}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${status === 'active' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {code.discount_percentage}% OFF
                    </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/40 mt-2">
                    <div className="flex items-center gap-1.5">
                        <Tag size={12} />
                        <span>{code.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>Ends {dateFormatted}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onDelete(code.id, code.code)}
                className="p-3 bg-red-500/5 text-red-500/60 rounded-xl hover:bg-red-500 border border-transparent hover:border-red-500 hover:text-white transition-all duration-300 ml-4 group-hover:scale-105"
                title="Revoke Code"
            >
                <Trash2 size={18} />
            </button>
        </motion.div>
    );
};

export default PromocodeManager;
