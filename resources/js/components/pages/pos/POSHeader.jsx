import React from 'react';
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
    Undo2
} from 'lucide-react';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../admin/ThemeContext';

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

    return (
        <header className="h-16 flex items-center px-6 bg-transparent border-b border-white/10 relative z-50 transition-colors duration-300">
            {/* Logo & Admin Switcher */}
            <div className="flex items-center gap-6 mr-8">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white leading-tight">
                        Attire Lounge
                    </h1>
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                        POS System
                    </span>
                </div>
                
                <div className="h-6 w-px bg-white/20" />
                
                <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
                >
                    <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">To Admin</span>
                </button>
            </div>

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
