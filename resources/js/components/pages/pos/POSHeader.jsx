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
    Moon
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
        <header className="h-16 flex items-center px-6 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 relative z-50 transition-colors duration-300">
            {/* Logo & Admin Switcher */}
            <div className="flex items-center gap-6 mr-8">
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 dark:text-white leading-tight">
                        Attire Lounge
                    </h1>
                    <span className="text-[10px] text-attire-accent font-bold uppercase tracking-widest">
                        POS System
                    </span>
                </div>
                
                <div className="h-6 w-px bg-black/10 dark:bg-white/10" />
                
                <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
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
                                        ? 'bg-attire-accent text-black shadow-lg shadow-attire-accent/20'
                                        : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="opacity-50">#{(index + 1).toString().padStart(2, '0')}</span>
                                <span>{tab.customer ? tab.customer.name : 'New Sale'}</span>
                                {tab.status === 'held' && <Pause size={10} className="text-red-500" />}
                                
                                <X 
                                    size={12} 
                                    className={`ml-2 hover:bg-black/20 rounded-full p-0.5 transition-all ${
                                        activeTabIndex === index ? 'text-black/60 hover:text-black' : 'text-gray-400 hover:text-white'
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
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-attire-accent hover:text-black text-gray-500 dark:text-gray-400 transition-all active:scale-95 ml-2"
                    title="Add new sale tab"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-6">
                <div className="hidden lg:flex flex-col text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                        Ready for Sale
                    </p>
                </div>

                <div className="h-8 w-px bg-black/10 dark:bg-white/10" />

                <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group"
                    title="Invoice History"
                >
                    <History size={18} className="group-hover:rotate-[360deg] transition-transform duration-700" />
                </button>

                <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="w-10 h-10 rounded-xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center overflow-hidden">
                    <User size={18} className="text-attire-accent" />
                </div>
            </div>
        </header>
    );
};

export default POSHeader;
