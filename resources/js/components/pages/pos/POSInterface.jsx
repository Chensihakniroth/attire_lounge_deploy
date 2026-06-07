import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import OrderLedger from './OrderLedger';
import InvoicePanel from './InvoicePanel';
import QuickAccessDeck from './QuickAccessDeck';
import { Zap } from 'lucide-react';
import { usePOS } from './POSContext';
import InvoiceHistoryPanel from './InvoiceHistoryPanel';
import ProductSearchModal from './ProductSearchModal';
import ModernModal from '../../common/ModernModal';
import { useAdmin } from '../admin/AdminContext';

const POSInterface = () => {
    const { activeOutlet } = useAdmin();
    const { isHistoryOpen, setIsHistoryOpen, isServiceOpen, setIsServiceOpen, loadInvoiceIntoCart, cloneInvoiceIntoCart } = usePOS();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for invoice actions from Admin Dashboard
    useEffect(() => {
        const action = searchParams.get('action');
        const invoiceId = searchParams.get('invoice');
        
        if (action && invoiceId) {
            // StrictMode defense: check actual window URL before processing
            const currentUrl = new URL(window.location.href);
            if (currentUrl.searchParams.has('action')) {
                // Instantly strip it so the mirror mount doesn't see it
                currentUrl.searchParams.delete('action');
                currentUrl.searchParams.delete('invoice');
                window.history.replaceState({}, '', currentUrl.toString());
                
                axios.get(`/api/v1/admin/pos/invoices/${invoiceId}`)
                    .then(res => {
                        const invoiceData = res.data.data || res.data;
                        if (invoiceData) {
                            if (action === 'clone') {
                                cloneInvoiceIntoCart(invoiceData);
                            } else if (action === 'refund') {
                                loadInvoiceIntoCart(invoiceData);
                            }
                        }
                    })
                    .catch(err => console.error("Failed to load invoice for action", err));
            }
        }
    }, [searchParams, cloneInvoiceIntoCart, loadInvoiceIntoCart]);

    // Preload Caches for Instant Catalog Search & Quick Access Deck
    useEffect(() => {
        const preloadData = async () => {
            try {
                // Preload Categories
                if (!window.__posCategoryCache) {
                    const catRes = await axios.get('/api/v1/admin/pos/products/categories');
                    window.__posCategoryCache = catRes.data;
                }

                // Preload Products (Initial Empty Search)
                if (!window.__posProductCache) window.__posProductCache = {};
                
                const cacheKey = JSON.stringify({
                    categories: [],
                    stockStatus: 'all',
                    name: "",
                    attribute: "",
                    code: "",
                });

                if (!window.__posProductCache[cacheKey]) {
                    const prodRes = await axios.get('/api/v1/admin/pos/products', {
                        params: { name: '', attribute: '', code: '', category: '', in_stock: '', per_page: 100 }
                    });
                    window.__posProductCache[cacheKey] = prodRes.data.data;
                }

                // Preload Services
                if (!window.__posServiceCache) {
                    const serviceRes = await axios.get('/api/v1/admin/pos/products/services');
                    window.__posServiceCache = serviceRes.data;
                }
            } catch (err) {
                console.error("Failed to preload POS cache:", err);
            }
        };

        preloadData();
    }, []);

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
            <div className="flex-1 flex flex-col overflow-hidden border-r border-black/15 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] relative">
                {/* Active Order Ledger - Main Workspace */}
                <div className="flex-1 overflow-hidden">
                    <OrderLedger onSearchClick={() => setIsSearchOpen(true)} />
                </div>

                {/* Stealthy Service Toggle Button */}
                {!isServiceOpen && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsServiceOpen(true)}
                        className="absolute bottom-8 left-0 pl-4 pr-6 py-2.5 rounded-r-full bg-black/10 dark:bg-white/5 text-gray-400 hover:bg-attire-accent hover:text-gray-900 dark:hover:text-white border border-l-0 border-black/10 dark:border-white/10 backdrop-blur-md transition-all z-30 group flex items-center gap-3 shadow-sm hover:shadow-attire-accent/20"
                    >
                        <Zap size={16} className="group-hover:fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">Quick Access</span>
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
                            className="absolute inset-x-0 bottom-0 h-[450px] border-t-2 border-black/15 dark:border-[#30363d] p-6 bg-background dark:bg-[#0d1117] shadow-none z-[100] flex flex-col"
                        >
                            <QuickAccessDeck onClose={() => setIsServiceOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: Active Invoice & Checkout */}
            <div className="w-full md:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#0d1117]">
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
