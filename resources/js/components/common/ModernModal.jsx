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

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ willChange: 'transform, opacity' }}
                        className={`relative w-full ${maxWidth} bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl overflow-hidden shadow-lg flex flex-col transition-colors duration-200 pointer-events-auto font-sans`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Standardized Header (If Title Provided) */}
                        {title && (
                            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-[#30363d] shrink-0">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0d1117] transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Standardized Close Button (If No Title) */}
                        {!title && showCloseButton && (
                            <div className="absolute top-4 right-5 z-[60]">
                                <button 
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0d1117] transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Children Content */}
                        <div className="flex-1">
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
