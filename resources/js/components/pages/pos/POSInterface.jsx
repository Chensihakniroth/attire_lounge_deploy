import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderLedger from './OrderLedger';
import InvoicePanel from './InvoicePanel';
import ServicePanel from './ServicePanel';
import { usePOS } from './POSContext';
import InvoiceHistoryPanel from './InvoiceHistoryPanel';
import ProductSearchModal from './ProductSearchModal';
import ModernModal from '../../common/ModernModal';

const POSInterface = () => {
    const { isHistoryOpen, setIsHistoryOpen } = usePOS();
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
            <div className="flex-1 flex flex-col overflow-hidden border-r border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                {/* Active Order Ledger - Main Workspace */}
                <div className="flex-1 overflow-hidden">
                    <OrderLedger onSearchClick={() => setIsSearchOpen(true)} />
                </div>

                {/* Quick Services - Fixed Height at bottom */}
                <div className="h-[200px] border-t border-black/5 dark:border-white/5 p-4 bg-white dark:bg-[#0a0a0a] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <ServicePanel />
                </div>
            </div>

            {/* Right Column: Active Invoice & Checkout */}
            <div className="w-full md:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
                <InvoicePanel />
            </div>

            {/* Overlays */}
            <ModernModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} showCloseButton={false}>
                <div className="flex justify-end h-full"> {/* Container for Slide-over positioning */}
                    <InvoiceHistoryPanel onClose={() => setIsHistoryOpen(false)} />
                </div>
            </ModernModal>

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
