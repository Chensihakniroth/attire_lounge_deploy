import React, { useEffect, useRef } from 'react';
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
    overflowVisible = false,
}) => {
    const panelRef = useRef(null);
    const previouslyFocused = useRef(null);

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

    // Keyboard accessibility: remember the trigger element, auto-focus the first
    // field, trap Tab inside the dialog, and restore focus when it closes.
    useEffect(() => {
        if (!isOpen) return;

        previouslyFocused.current = document.activeElement;

        const getFocusables = () =>
            panelRef.current
                ? Array.from(
                      panelRef.current.querySelectorAll(
                          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                      )
                  ).filter(
                      (el) => el.offsetParent !== null || el === document.activeElement
                  )
                : [];

        // Prefer a data-entry field over the close button for initial focus.
        const firstField =
            getFocusables().find(
                (el) =>
                    el.tagName === 'INPUT' ||
                    el.tagName === 'SELECT' ||
                    el.tagName === 'TEXTAREA'
            ) || getFocusables()[0];

        const raf = window.requestAnimationFrame(() => {
            if (firstField) firstField.focus();
            else panelRef.current?.focus();
        });

        // Trap Tab within the dialog.
        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            const els = getFocusables();
            if (els.length === 0) return;
            const first = els[0];
            const last = els[els.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', handleTab);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('keydown', handleTab);

            // Give focus back to whatever opened the modal.
            const prev = previouslyFocused.current;
            if (prev && typeof prev.focus === 'function' && prev.isConnected) {
                prev.focus();
            }
        };
    }, [isOpen]);

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
                        ref={panelRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title || 'Dialog'}
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ willChange: 'transform, opacity' }}
                        className={`relative w-full ${maxWidth} bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} shadow-lg flex flex-col transition-colors duration-200 pointer-events-auto font-sans outline-none`}
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
