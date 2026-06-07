import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    History, 
    Plus, 
    X, 
    Pause, 
    ArrowLeftRight, 
    ShoppingBag, 
    User,
    Sun,
    Moon,
    Undo2,
    AlertTriangle
} from 'lucide-react';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../admin/ThemeContext';
import { useAdmin } from '../admin/AdminContext';
import ModernModal from '../../common/ModernModal';

const POSHeader = () => {
    const navigate = useNavigate();
    const { 
        invoiceTabs, 
        activeTabIndex, 
        setActiveTabIndex, 
        addNewTab, 
        closeTab,
        holdInvoice,
        setIsHistoryOpen
    } = usePOS();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { activeOutlet, OUTLET_CONFIG } = useAdmin();
    const outletData = OUTLET_CONFIG?.[activeOutlet] || { label: 'Attire Lounge' };

    const [showWarningModal, setShowWarningModal] = useState(false);

    // Check if any tab has active content that would be lost on navigation
    const hasActiveContent = useMemo(() => {
        return invoiceTabs.some(tab => tab.cartItems.length > 0 || tab.customer);
    }, [invoiceTabs]);

    const handleAdminSwitch = () => {
        if (hasActiveContent) {
            setShowWarningModal(true);
        } else {
            navigate('/admin');
        }
    };

    return (
        <header className="h-16 flex items-center px-6 bg-transparent border-b border-white/10 relative z-50 transition-colors duration-300">
            {/* Logo & Admin Switcher */}
            <div className="flex items-center gap-6 mr-8">
                {outletData.logo ? (
                    <div className="flex items-center gap-3">
                        <img 
                            src={outletData.logo} 
                            alt={outletData.label} 
                            className="h-9 w-auto object-contain brightness-0 invert opacity-90"
                        />
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                            POS
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white leading-tight">
                            {outletData.label}
                        </h1>
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                            POS System
                        </span>
                    </div>
                )}
                
                <div className="h-6 w-px bg-white/20" />
                
                <button 
                    onClick={handleAdminSwitch}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
                >
                    <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">To Admin</span>
                </button>
            </div>

            {/* Warning Modal */}
            <ModernModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                title="Discard Active Sale?"
                maxWidth="max-w-md"
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unsaved Progress Detected</p>
                            <p className="text-xs text-gray-500 dark:text-[#8b949e] leading-relaxed">
                                You have active tabs with items or customers. Switching to the Admin panel will clear your current cart.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#8b949e] text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                        >
                            Stay in POS
                        </button>
                        <button
                            onClick={() => {
                                setShowWarningModal(false);
                                navigate('/admin');
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                        >
                            Yes, Discard
                        </button>
                    </div>
                </div>
            </ModernModal>

            {/* Tab Navigation */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                <AnimatePresence mode="popLayout" initial={false}>
                    {invoiceTabs.map((tab, index) => (
                        <motion.div
                            key={tab.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 20 }}
                            className="relative"
                        >
                            <button
                                onClick={() => setActiveTabIndex(index)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap group ${
                                    activeTabIndex === index
                                        ? 'bg-white/20 text-white shadow-none border border-white/20'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span className="opacity-50">#{(index + 1).toString().padStart(2, '0')}</span>
                                <span className={tab.isRefundMode ? "text-red-500 font-black" : ""}>
                                    {tab.isRefundMode 
                                        ? 'Refund' 
                                        : (tab.customer ? tab.customer.name : 'New Sale')
                                    }
                                </span>
                                {tab.status === 'held' && <Pause size={10} className="text-red-500" />}
                                
                                <X 
                                    size={12} 
                                    className={`ml-2 hover:bg-white/20 rounded-full p-0.5 transition-all outline-none border-none ${
                                        activeTabIndex === index ? 'text-white/80 hover:text-white' : 'text-white/40 hover:text-white'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(index);
                                    }}
                                />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button 
                    onClick={addNewTab}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-95 ml-2 border border-white/10"
                    title="Add new sale tab"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-6">
                <div className="hidden lg:flex flex-col text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-white/50 uppercase tracking-widest">
                        Ready for Sale
                    </p>
                </div>

                <div className="h-8 w-px bg-white/20" />

                <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
                    title="Invoice History"
                >
                    <History size={18} className="group-hover:rotate-[360deg] transition-transform duration-700" />
                </button>

                <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
                    invoiceTabs[activeTabIndex]?.isRefundMode 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 active:scale-95' 
                        : 'bg-white/10 border border-white/20 text-white'
                }`}>
                    {invoiceTabs[activeTabIndex]?.isRefundMode ? (
                        <motion.div
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                        >
                            <Undo2 size={18} />
                        </motion.div>
                    ) : (
                        <User size={18} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default POSHeader;
