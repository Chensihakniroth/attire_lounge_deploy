import React, { useState, useEffect, useCallback, useMemo, memo, Fragment } from 'react';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, Loader, Check, X, Trash2, ChevronDown, Plus, RefreshCw, Smartphone, Package, Search, DollarSign, Bell, Scissors } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Listbox, Transition } from '@headlessui/react';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split(/[ T]/)[0];
};

const StyledSelect = ({ value, onChange, options, icon: Icon, className = "" }) => {
    const selected = options.find(o => o.value === value) || options[0];
    return (
        <Listbox value={value} onChange={(val) => onChange({ target: { value: val } })}>
            <div className={`relative ${className}`}>
                <Listbox.Button className={`relative w-full cursor-pointer rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-xl ${Icon ? 'pl-12' : 'pl-6'} pr-10 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 hover:border-attire-accent/50 hover:bg-white dark:hover:bg-black/40 transition-all duration-300 shadow-sm`}>
                    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-attire-accent transition-colors pointer-events-none" />}
                    <span className="block truncate">{selected?.label}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-attire-accent transition-colors duration-300" aria-hidden="true" />
                    </span>
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white dark:bg-[#0a0f1a]/95 border border-black/10 dark:border-white/10 py-2 shadow-2xl backdrop-blur-3xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {options.map((option, idx) => (
                            <Listbox.Option
                                key={idx}
                                className={({ active }) => `relative cursor-pointer select-none py-3 px-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${active ? 'bg-attire-accent/10 text-attire-accent dark:bg-attire-accent/20' : 'text-gray-600 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white'}`}
                                value={option.value}
                            >
                                {({ selected }) => (
                                    <div className="flex items-center justify-between">
                                        <span className={`block truncate ${selected ? 'font-black text-attire-accent' : 'font-medium'}`}>{option.label}</span>
                                        {selected && <Check size={14} strokeWidth={3} className="text-attire-accent" />}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

const AlteringRow = memo(({ altering, onUpdate, onDelete, onNotify, isNotifying }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        ready: { label: 'Ready', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        completed: { label: 'Completed', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
        cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };

    const status = statusConfig[altering.status] || statusConfig.pending;

    const [editCost, setEditCost] = useState(altering.altering_cost || '');
    const [isSavingCost, setIsSavingCost] = useState(false);
    
    // Countdown logic
    const [timeLeft, setTimeLeft] = useState('');
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        if (!altering.ready_at) {
            setTimeLeft('');
            setIsFlashing(false);
            return;
        }

        const target = new Date(altering.ready_at).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft('Time is up!');
                setIsFlashing(true);
            } else {
                setIsFlashing(false);
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                let timeStr = '';
                if (days > 0) timeStr += `${days}d `;
                timeStr += `${hours}h ${minutes}m ${seconds}s`;
                setTimeLeft(timeStr);
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
    }, [altering.ready_at]);

    const handleSaveCost = async () => {
        setIsSavingCost(true);
        await onUpdate(altering.id, { altering_cost: editCost });
        setIsSavingCost(false);
    };

    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 md:p-8 rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-white/[0.02] border ${isFlashing ? 'border-red-500 animate-pulse' : 'border-black/5 dark:border-white/5'} shadow-sm hover:shadow-xl dark:shadow-none hover:bg-white/90 dark:hover:bg-white/[0.04] transition-all duration-500 group relative`}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                        <User className="w-6 h-6 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors duration-500" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
                            {altering.customer_name} 
                            {altering.order_no && <span className="text-[10px] text-gray-500 dark:text-attire-silver/60 font-sans font-bold tracking-[0.2em] uppercase bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md border border-black/5 dark:border-white/5">#{altering.order_no}</span>}
                        </h3>
                        {altering.start_date && (
                             <p className="text-[11px] text-gray-500 dark:text-attire-silver/50 uppercase tracking-[0.15em] font-bold mt-1">Started: <span className="text-gray-900 dark:text-attire-cream">{formatDate(altering.start_date)}</span></p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Listbox value={altering.status} onChange={(val) => onUpdate(altering.id, { status: val })}>
                            <div className="relative z-10">
                                <Listbox.Button className={`pl-5 pr-10 py-2 w-32 md:w-36 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] border outline-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-between ${status.color} ${status.bg} ${status.border}`}>
                                    <span className="block truncate">{statusConfig[altering.status]?.label || 'Pending'}</span>
                                    <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform ${status.color}`} />
                                </Listbox.Button>
                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                    <Listbox.Options className="absolute right-0 z-[100] mt-2 w-48 overflow-auto rounded-2xl bg-white dark:bg-[#0a0f1a]/95 border border-black/10 dark:border-white/10 py-2 shadow-2xl backdrop-blur-3xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {[
                                            { value: 'pending', label: 'Pending', colorMatch: 'text-yellow-600 dark:text-yellow-400' },
                                            { value: 'in_progress', label: 'In Progress', colorMatch: 'text-blue-600 dark:text-blue-400' },
                                            { value: 'ready', label: 'Ready', colorMatch: 'text-green-600 dark:text-green-400' },
                                            { value: 'completed', label: 'Completed', colorMatch: 'text-gray-600 dark:text-gray-400' },
                                            { value: 'cancelled', label: 'Cancelled', colorMatch: 'text-red-600 dark:text-red-400' }
                                        ].map((opt, idx) => (
                                            <Listbox.Option
                                                key={idx}
                                                className={({ active }) => `relative cursor-pointer select-none py-3 px-5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${active ? 'bg-black/5 dark:bg-white/5' : ''} ${opt.colorMatch}`}
                                                value={opt.value}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-black' : 'font-medium'}`}>{opt.label}</span>
                                                        {selected && <Check size={14} strokeWidth={3} />}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>
                    
                    <button onClick={() => onDelete(altering.id)} className="p-2.5 text-gray-400 hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all duration-300 hover:scale-110">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-4">
                    {altering.mobile && (
                        <div className="flex items-center text-gray-600 dark:text-attire-silver p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group/tel">
                            <Smartphone className="w-4 h-4 mr-3 text-attire-accent opacity-70 group-hover/tel:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium tracking-wide">{altering.mobile}</span>
                        </div>
                    )}
                    {altering.purchased_date && (
                        <div className="flex items-center text-gray-600 dark:text-attire-silver p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="text-sm font-medium">Purchased: <span className="text-gray-900 dark:text-white">{altering.purchased_date}</span></span>
                        </div>
                    )}
                    {altering.tailor_pickup_date && (
                        <div className="flex items-center text-gray-600 dark:text-attire-silver p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="text-sm">Tailor Pickup: <span className="text-gray-900 dark:text-white">{altering.tailor_pickup_date}</span></span>
                        </div>
                    )}
                </div>

                <div className="md:col-span-8 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="bg-attire-accent/[0.03] dark:bg-attire-accent/[0.05] p-5 rounded-2xl border border-attire-accent/10">
                            <div className="flex items-start gap-4">
                                <Package className="w-5 h-5 text-attire-accent mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-attire-accent/70 uppercase tracking-[0.2em] mb-2">Items to Alter</p>
                                    <p className="text-[15px] text-gray-800 dark:text-attire-cream leading-relaxed font-serif">{altering.product || 'No items listed.'}</p>
                                </div>
                            </div>
                        </div>
                        {altering.remark && (
                             <div className="flex items-start gap-3 mt-4">
                                 <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                 <p className="text-xs text-gray-500 dark:text-attire-silver/70 italic bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-black/5 dark:border-white/5 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1/2 before:bg-gray-300 dark:before:bg-gray-600 before:rounded-full overflow-hidden leading-relaxed">{altering.remark}</p>
                             </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-6 pt-6 mt-6 border-t border-black/5 dark:border-white/5 items-end justify-between">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-attire-silver/50">Altering Cost</label>
                            <div className="flex items-center gap-2 group/cost">
                                <div className="relative overflow-hidden rounded-xl">
                                    <div className="absolute left-0 inset-y-0 w-8 bg-black/5 dark:bg-white/5 flex items-center justify-center border-r border-black/5 dark:border-white/5">
                                        <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={editCost} 
                                        onChange={(e) => setEditCost(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-32 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-black/10 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-attire-accent transition-all font-medium focus:ring-4 focus:ring-attire-accent/10 hover:bg-white dark:hover:bg-black/40" 
                                    />
                                </div>
                                {editCost != altering.altering_cost && (
                                    <button 
                                        onClick={handleSaveCost}
                                        disabled={isSavingCost}
                                        className="p-2 bg-attire-accent/10 text-attire-accent rounded-xl hover:bg-attire-accent hover:text-white transition-all duration-300 border border-attire-accent/20 shadow-sm"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="flex flex-col items-end space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-attire-silver/50">
                                    {altering.ready_at ? 'Target Ready Time' : 'Set Arrival Timer'}
                                </label>
                                {altering.ready_at ? (
                                    <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5">
                                        <Clock className={`w-4 h-4 ${isFlashing ? 'text-red-500 animate-pulse' : 'text-attire-accent'}`} />
                                        <span className={`text-base font-bold font-serif tabular-nums tracking-wide ${isFlashing ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                                            {timeLeft}
                                        </span>
                                        <button 
                                            onClick={() => onUpdate(altering.id, { ready_at: null })}
                                            className="ml-3 text-xs text-red-500/70 hover:text-red-500 font-medium transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input 
                                            type="datetime-local" 
                                            onChange={(e) => onUpdate(altering.id, { ready_at: e.target.value })}
                                            className="pl-3 pr-3 py-2 w-[220px] bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent cursor-pointer transition-all hover:bg-white dark:hover:bg-black/40 focus:ring-4 focus:ring-attire-accent/10"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5 self-start sm:self-auto">
                    {altering.notified_at ? (
                        <><Check className="w-3.5 h-3.5 text-green-500" /> Notified: {new Date(altering.notified_at).toLocaleString()}</>
                    ) : 'Not Notified Yet'}
                </div>
                <button 
                    onClick={() => onNotify(altering.id)} 
                    disabled={isNotifying === altering.id} 
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white bg-gradient-to-r from-[#0088cc] to-[#00aaff] hover:from-[#0077b3] hover:to-[#0099e6] rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-[#0088cc]/20 hover:shadow-[#0088cc]/40 hover:-translate-y-0.5"
                >
                    {isNotifying === altering.id ? <Loader className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} 
                    Alert via Telegram
                </button>
            </div>
        </motion.div>
    );
});


const AlteringManager = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeframeFilter, setTimeframeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    

    const { data: alteringsData, isLoading } = useQuery({
        queryKey: ['admin-alterings', page, statusFilter, timeframeFilter, searchQuery, dateFilter],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/alterings', {
                params: { page, status: statusFilter, timeframe: timeframeFilter, search: searchQuery, date: dateFilter }
            });
            return data;
        }
    });

    const alterings = alteringsData?.data || [];
    const pagination = {
        currentPage: alteringsData?.current_page || 1,
        lastPage: alteringsData?.last_page || 1,
        total: alteringsData?.total || 0
    };

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return axios.put(`/api/v1/admin/alterings/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return axios.delete(`/api/v1/admin/alterings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            return axios.post('/api/v1/admin/alterings', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setIsAdding(false);
            setFormData({ customer_name: '', order_no: '', mobile: '', product: '', remark: '', start_date: new Date().toISOString().split('T')[0] });
        }
    });

    const [isNotifying, setIsNotifying] = useState(null);
    const handleNotify = async (id) => {
        setIsNotifying(id);
        try {
            await axios.post(`/api/v1/admin/alterings/${id}/notify`);
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            alert('Telegram notification sent!');
        } catch (err) {
            alert('Failed to send notification. Is bot configured?');
        } finally {
            setIsNotifying(null);
        }
    };

    useEffect(() => {
        window.importAltering = async (url) => {
            if (!url) {
                console.error("❌ Please provide a Google Sheet URL. Example: importAltering('https://docs.google.com/...')");
                return;
            }
            console.log("⏳ Fetching and importing data from Google Sheets...");
            try {
                let csvUrl = url;
                if (url.includes('/edit')) {
                    const baseUrl = url.split('/edit')[0];
                    const urlObj = new URL(url);
                    let gid = urlObj.searchParams.get('gid');
                    if (!gid && urlObj.hash.includes('gid=')) {
                        gid = urlObj.hash.split('gid=')[1];
                    }
                    csvUrl = `${baseUrl}/export?format=csv${gid ? '&gid=' + gid : ''}`;
                }
                
                const response = await fetch(csvUrl);
                if (!response.ok) throw new Error("Could not fetch the sheet. Make sure it's public.");
                const csvText = await response.text();
                
                const rows = csvText.split('\n');
                const data = [];
                let headerFound = false;
                
                for (let i = 0; i < rows.length; i++) {
                    const rowStr = rows[i].trim();
                    if (!rowStr) continue;
                    
                    const match = rowStr.match(/(?:\"([^\"]*)\"|([^,]*))(?:,|$)/g);
                    if (!match) continue;
                    
                    const cols = match.map(m => {
                        let val = m.replace(/,$/, '').trim();
                        if (val.startsWith('"') && val.endsWith('"')) {
                            val = val.substring(1, val.length - 1);
                        }
                        return val;
                    });

                    if (!headerFound) {
                        if (cols[1] && cols[1].toLowerCase().includes('customer')) headerFound = true;
                        continue;
                    }

                    if (!cols[1]) continue;

                    data.push({
                        order_no: cols[0],
                        customer_name: cols[1],
                        mobile: cols[2],
                        delivery_address: cols[3],
                        product: cols[4],
                        purchased_date: cols[5],
                        tailor_pickup_date: cols[6],
                        pickup_status: cols[7],
                        customer_pickup_date: cols[8],
                        customer_pickup_status: cols[9],
                        remark: cols[10]
                    });
                }

                if (data.length === 0) {
                    console.error("❌ No valid data found in the sheet.");
                    return;
                }

                const res = await axios.post('/api/v1/admin/alterings/import', { data });
                console.log(`✅ Success: ${res.data.message}`);
                queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            } catch (err) {
                console.error("❌ Failed to import from sheet:", err);
            }
        };

        console.log("%c👗 Attire Lounge System Command:", "color: #0F9D58; font-weight: bold; font-size: 14px;");
        console.log("Run this to sync records: %cimportAltering('YOUR_SHEET_URL')", "color: #ff00ff; font-weight: bold;");

        return () => {
            delete window.importAltering;
        };
    }, [queryClient]);

    const [formData, setFormData] = useState({
        customer_name: '', order_no: '', mobile: '', product: '', remark: '', start_date: new Date().toISOString().split('T')[0]
    });

    const handleLoadMore = () => {
        if (page < pagination.lastPage) {
            setPage(p => p + 1);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this alteration record?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleUpdate = (id, data) => {
        updateMutation.mutate({ id, data });
    };

    return (
        <div className="space-y-8 pb-20 font-sans">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-3 flex items-center gap-4">
                        <div className="p-3 bg-attire-accent/10 rounded-2xl border border-attire-accent/20">
                            <Scissors className="w-8 h-8 md:w-10 md:h-10 text-attire-accent" />
                        </div>
                        Altering List
                    </h1>
                    <p className="text-gray-500 dark:text-attire-silver text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">Manage tailor adjustments & pickups</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full lg:w-auto flex items-center justify-center px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white bg-attire-accent hover:bg-attire-accent/90 rounded-2xl transition-all duration-300 shadow-lg shadow-attire-accent/30 hover:shadow-attire-accent/50 hover:-translate-y-1"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Record
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-5 mb-10">
                <div className="flex-1 relative group/search">
                    <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-attire-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name, mobile, order no..." 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-12 pr-5 py-3.5 bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all text-gray-900 dark:text-white shadow-sm hover:bg-white dark:hover:bg-black/40 font-medium z-0 relative"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-auto min-w-[150px] relative z-0">
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value); setTimeframeFilter('all'); setPage(1); }}
                            className="w-full pl-5 pr-5 py-3.5 bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all hover:border-attire-accent/50 hover:bg-white dark:hover:bg-black/40 shadow-sm cursor-pointer"
                            title="Filter by Specific Date"
                        />
                    </div>
                    <div className="w-full h-[3rem] sm:w-[150px] lg:w-[170px] z-30">
                        <StyledSelect 
                            value={timeframeFilter}
                            onChange={(e) => { setTimeframeFilter(e.target.value); setDateFilter(''); setPage(1); }}
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'this_week', label: 'This Week' },
                                { value: 'this_month', label: 'This Month' },
                                { value: 'this_year', label: 'This Year' }
                            ]}
                            icon={Calendar}
                        />
                    </div>
                    <div className="w-full h-[3rem] sm:w-[150px] lg:w-[160px] z-20">
                        <StyledSelect 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'ready', label: 'Ready' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-8 rounded-[2rem] backdrop-blur-2xl bg-white/80 dark:bg-black/40 border border-black/10 dark:border-white/10 shadow-2xl dark:shadow-none mb-10 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-attire-accent via-[#ff6b6b] to-attire-accent opacity-50"></div>
                            <div className="flex justify-between items-center pb-5 border-b border-black/5 dark:border-white/5">
                                <div>
                                    <h3 className="text-2xl font-serif text-gray-900 dark:text-white">New Altering Record</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Add to tailor queue</p>
                                </div>
                                <button type="button" onClick={() => setIsAdding(false)} className="p-2.5 text-gray-400 hover:text-gray-900 dark:text-attire-silver dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all duration-300 hover:-rotate-90">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Customer Name *</label>
                                    <input required type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Mobile</label>
                                    <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Start Date</label>
                                    <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Order No</label>
                                    <input type="text" value={formData.order_no} onChange={e => setFormData({...formData, order_no: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Product Details (Items to alter) *</label>
                                    <textarea required value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} rows="3" className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm resize-none"></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-attire-silver/60 mb-2 pl-1">Remarks (Optional)</label>
                                    <input type="text" value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-attire-accent focus:ring-4 focus:ring-attire-accent/10 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 mt-4 border-t border-black/5 dark:border-white/5">
                                <button type="submit" disabled={createMutation.isPending} className="flex items-center px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white bg-attire-accent hover:bg-attire-accent/90 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-attire-accent/30 hover:shadow-attire-accent/50 hover:-translate-y-1">
                                    {createMutation.isPending ? <Loader className="w-5 h-5 mr-3 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader className="w-8 h-8 text-attire-accent animate-spin" />
                </div>
            ) : alterings.length === 0 ? (
                <div className="text-center py-20 bg-black/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5">
                    <Scissors className="mx-auto text-gray-300 dark:text-attire-silver/20 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-attire-silver/60 uppercase tracking-widest text-xs">No alteration records found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {alterings.map(alt => (
                            <AlteringRow 
                                key={alt.id} 
                                altering={alt} 
                                onUpdate={handleUpdate} 
                                onDelete={handleDelete} 
                                onNotify={handleNotify} 
                                isNotifying={isNotifying}
                            />
                        ))}
                    </AnimatePresence>

                    {page < pagination.lastPage && (
                        <div className="flex justify-center mt-12">
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Load More</span>
                                <ChevronDown size={16} className="text-attire-accent group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlteringManager;
