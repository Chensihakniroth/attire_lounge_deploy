import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * ModernModal - A standardized modal component for Attire Lounge.
 * Features: High-blur backdrop, brand-aligned colors, and consistent layering.
 */
const ModernModal = ({ 
    isOpen, 
    onClose, 
    children, 
    title,
    maxWidth = 'max-w-2xl',
    showCloseButton = true,
}) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-xl pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`relative w-full ${maxWidth} bg-[#f8f8f6] dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transition-colors duration-300 pointer-events-auto font-sans`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Standardized Header (If Title Provided) */}
                        {title && (
                            <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-black/5 dark:border-white/5 shrink-0">
                                <h2 className="text-xl font-serif text-gray-900 dark:text-white uppercase tracking-widest">{title}</h2>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2.5 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Standardized Close Button (If No Title) */}
                        {!title && showCloseButton && (
                            <div className="absolute top-6 right-8 z-[60]">
                                <button 
                                    onClick={onClose}
                                    className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 transition-all border border-black/5 dark:border-white/5"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        {/* Children Content */}
                        <div className="flex-1 overflow-hidden">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ModernModal;
