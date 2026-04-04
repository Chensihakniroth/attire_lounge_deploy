import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderLedger from './OrderLedger';
import InvoicePanel from './InvoicePanel';
import ServicePanel from './ServicePanel';
import { Zap } from 'lucide-react';
import { usePOS } from './POSContext';
import InvoiceHistoryPanel from './InvoiceHistoryPanel';
import ProductSearchModal from './ProductSearchModal';
import ModernModal from '../../common/ModernModal';

const POSInterface = () => {
    const { isHistoryOpen, setIsHistoryOpen, isServiceOpen, setIsServiceOpen } = usePOS();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if not already in an input
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-full relative">
            {/* Left Column: Product Selection & Services */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] relative">
                {/* Active Order Ledger - Main Workspace */}
                <div className="flex-1 overflow-hidden">
                    <OrderLedger onSearchClick={() => setIsSearchOpen(true)} />
                </div>

                {/* Floating Service Toggle Button */}
                {!isServiceOpen && (
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={() => setIsServiceOpen(true)}
                        className="absolute bottom-6 left-6 p-4 rounded-2xl bg-attire-accent text-black shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/20 hover:scale-105 active:scale-95 transition-all z-30 group flex items-center gap-3"
                    >
                        <Zap size={20} fill="currentColor" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] pr-2">Quick Services</span>
                    </motion.button>
                )}

                {/* Quick Services - Tactical Slide-up Overlay (No Backdrop) */}
                <AnimatePresence>
                    {isServiceOpen && (
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute inset-x-0 bottom-0 h-[450px] border-t border-black/5 dark:border-white/10 p-6 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.15)] z-[100] flex flex-col"
                        >
                            <ServicePanel onClose={() => setIsServiceOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: Active Invoice & Checkout */}
            <div className="w-full md:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
                <InvoicePanel />
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <InvoiceHistoryPanel key="history-panel" onClose={() => setIsHistoryOpen(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSearchOpen && (
                    <ProductSearchModal 
                        key="product-search"
                        isOpen={isSearchOpen} 
                        onClose={() => setIsSearchOpen(false)} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default POSInterface;
