import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertCircle, Check, DollarSign, Tag, Archive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModernModal from '../../../common/ModernModal';

const BulkActionDialog = ({ isOpen, onClose, selectedCount, products, onApply }) => {
    const [step, setStep] = useState('select'); // 'select' | 'configure' | 'preview'
    const [action, setAction] = useState(null); // 'price' | 'category' | 'archive' | 'stock'
    const [config, setConfig] = useState({
        priceType: 'percentage',
        priceValue: 0,
        category: '',
        stockValue: 0
    });

    const handleActionSelect = (type) => {
        setAction(type);
        setStep('configure');
    };

    const calculatePreview = () => {
        return products.slice(0, 5).map(p => {
            let newVal = p.price;
            if (action === 'price') {
                if (config.priceType === 'percentage') {
                    newVal = p.price * (1 + (config.priceValue / 100));
                } else {
                    newVal = p.price + config.priceValue;
                }
            }
            return {
                name: p.name,
                old: p.price,
                new: Math.max(0, newVal).toFixed(2)
            };
        });
    };

    const actions = [
        { id: 'price', label: 'Adjust Price', icon: DollarSign, color: 'text-blue-500', description: 'Increase or decrease prices by % or fixed amount' },
        { id: 'category', label: 'Change Category', icon: Tag, color: 'text-purple-500', description: 'Move selected items to a different group' },
        { id: 'stock', label: 'Reset Stock', icon: RefreshCw, color: 'text-emerald-500', description: 'Set inventory levels to a specific value' },
        { id: 'archive', label: 'Archive Products', icon: Archive, color: 'text-rose-500', description: 'Deactivate and hide products from POS' },
    ];

    const resetAndClose = () => {
        setStep('select');
        setAction(null);
        onClose();
    };

    return (
        <ModernModal isOpen={isOpen} onClose={resetAndClose} maxWidth="max-w-xl" showCloseButton={false}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-attire-navy/10 rounded-2xl border border-attire-navy/20 text-attire-navy dark:text-attire-accent">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">Bulk Operations</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedCount} Items in Queue</p>
                    </div>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 min-h-[300px]">
                <AnimatePresence mode="wait">
                    {step === 'select' && (
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 gap-3"
                        >
                            {actions.map((act) => (
                                <button 
                                    key={act.id}
                                    onClick={() => handleActionSelect(act.id)}
                                    className="flex items-center gap-4 p-5 rounded-[1.5rem] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-[#1a1a1a]/40 hover:border-attire-navy dark:hover:border-attire-accent hover:bg-attire-navy/5 transition-all text-left group"
                                >
                                    <div className={`p-3 bg-white dark:bg-white/5 rounded-xl transition-colors shadow-sm ${act.color}`}>
                                        <act.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#0d3542] dark:text-white mb-0.5">{act.label}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{act.description}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-attire-navy dark:group-hover:text-attire-accent transition-colors" />
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {step === 'configure' && (
                        <motion.div 
                            key="configure"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {action === 'price' && (
                                <div className="space-y-6">
                                    <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-[1.2rem]">
                                        {['percentage', 'fixed'].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setConfig({...config, priceType: t})}
                                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${config.priceType === t ? 'bg-white dark:bg-white/10 shadow-sm text-attire-navy dark:text-attire-accent' : 'text-gray-500'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Adjustment Value</label>
                                        <div className="relative group">
                                            <input 
                                                type="number"
                                                value={config.priceValue}
                                                onChange={e => setConfig({...config, priceValue: parseFloat(e.target.value) || 0})}
                                                className="w-full bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-[1.5rem] text-sm font-bold border border-black/5 dark:border-white/5 focus:border-attire-navy dark:focus:border-attire-accent focus:bg-white dark:focus:bg-black outline-none transition-all text-gray-900 dark:text-white"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-attire-navy dark:text-attire-accent">
                                            {config.priceType === 'percentage' ? '%' : '$'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 italic ml-2">Positive to increase, negative to decrease.</p>
                                    </div>
                                </div>
                            )}

                            {action === 'category' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">New Category Name</label>
                                    <input 
                                        type="text"
                                        value={config.category}
                                        onChange={e => setConfig({...config, category: e.target.value.toUpperCase()})}
                                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest outline-none border border-black/5 dark:border-white/5 focus:border-attire-navy dark:focus:border-attire-accent focus:bg-white dark:focus:bg-black transition-all text-gray-900 dark:text-white"
                                        placeholder="E.G. ACCESSORIES"
                                    />
                                </div>
                            )}

                            {action === 'stock' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">New Stock Quantity</label>
                                    <input 
                                        type="number"
                                        value={config.stockValue}
                                        onChange={e => setConfig({...config, stockValue: parseInt(e.target.value) || 0})}
                                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] p-5 rounded-[1.5rem] text-sm font-bold border border-black/5 dark:border-white/5 focus:border-attire-navy dark:focus:border-attire-accent focus:bg-white dark:focus:bg-black outline-none transition-all text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}

                            {action === 'archive' && (
                                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[1.5rem] flex gap-4">
                                    <AlertCircle className="text-rose-500 shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-rose-500 tracking-widest mb-1">Critical Warning</h4>
                                        <p className="text-[10px] text-rose-800/70 dark:text-rose-500/50 font-bold uppercase tracking-wide leading-relaxed">
                                            You are about to archive {selectedCount} products. They will no longer appear on the POS terminal interface, but historical ledger data will remain preserved.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" onClick={() => setStep('select')} className="flex-1 h-14 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border-black/10 dark:border-white/10 text-gray-400">BACK</Button>
                                <Button onClick={() => setStep('preview')} className="flex-1 h-14 rounded-[1.2rem] bg-attire-navy dark:bg-attire-accent text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">PREVIEW CHANGES</Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'preview' && (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            <div className="bg-black/[0.02] dark:bg-white/5 p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Proposed Transformations (Top 5)</h4>
                                <div className="space-y-2">
                                    {calculatePreview().map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/[0.03] dark:border-white/[0.03] shadow-sm">
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-[#0d3542] dark:text-white truncate max-w-[200px]">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] text-gray-400 line-through font-mono">${item.old}</span>
                                                <ChevronRight size={12} className="text-gray-300" />
                                                <span className="text-[11px] font-black text-emerald-500 font-mono">${item.new}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" onClick={() => setStep('configure')} className="flex-1 h-14 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border-black/10 dark:border-white/10 text-gray-400">EDIT CONFIG</Button>
                                <Button onClick={() => onApply(action, config)} className="flex-1 h-14 rounded-[1.2rem] bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                                    <Check size={14} className="mr-2" /> CONFIRM & APPLY
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModernModal>
    );
};

export default BulkActionDialog;
