import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ProductCatalog from './ProductCatalog';

const ProductSearchModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-7xl h-[90vh] bg-white dark:bg-[#050505] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-black/10 dark:border-white/10 overflow-hidden flex flex-col font-sans"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Compact Modal Header with Close Button */}
                    <div className="absolute top-6 right-8 z-[60]">
                        <button 
                            onClick={onClose}
                            className="group p-3 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-gray-400 transition-all border border-black/5 dark:border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Integrated Catalog Dashboard */}
                    <div className="flex-1 overflow-hidden">
                        <ProductCatalog />
                    </div>

                    {/* Minimal Footer for status or shortcut hints */}
                    <div className="px-8 py-3 bg-gray-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">ESC</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">to exit search hub</span>
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-40">
                            Neural Sync: Active
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductSearchModal;
