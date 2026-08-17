import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

/**
 * DatePicker — Clean, minimal date selection component.
 * Click-to-select: choosing a date auto-closes the modal.
 */
export default function DatePicker({ 
    value, 
    onChange, 
    label, 
    placeholder = "Select Date",
    name,
    required = false,
    minDate,
    className,
    inputClassName,
    showIcon = true,
    showChevron = true,
    error
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Format display: "Aug 17, 2026"
    const displayDate = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : "";

    // Handle selection: converts Date object to YYYY-MM-DD and auto-closes
    const handleSelect = (date) => {
        if (!date) return;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        
        onChange({ target: { name, value: formatted } });
        setIsOpen(false);
    };

    return (
        <div className={cn("relative flex flex-col gap-1", className)} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider ml-0.5">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            
            <div className="relative group">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "w-full bg-black/[0.03] dark:bg-white/[0.04] border rounded-xl py-2 px-3 text-left transition-all duration-200 flex items-center justify-between gap-2",
                        "border-black/8 dark:border-white/8 hover:border-black/15 dark:hover:border-white/15",
                        isOpen ? "border-[#0d3542]/30 dark:border-white/20 bg-black/[0.05] dark:bg-white/[0.06]" : "",
                        error ? "border-red-400/50" : "",
                        inputClassName
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {showIcon && (
                            <CalendarIcon 
                                size={13} 
                                className={cn(
                                    "shrink-0 transition-colors duration-200",
                                    isOpen ? "text-[#0d3542] dark:text-white" : "text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/50"
                                )} 
                            />
                        )}
                        <span className={cn(
                            "text-xs font-semibold tracking-wide truncate",
                            value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-white/40"
                        )}>
                            {displayDate || placeholder}
                        </span>
                    </div>

                    {showChevron && (
                        <ChevronDown 
                            size={12} 
                            className={cn(
                                "shrink-0 text-gray-400 dark:text-white/30 transition-transform duration-200",
                                isOpen ? "rotate-180 text-[#0d3542] dark:text-white" : ""
                            )} 
                        />
                    )}
                </button>
            </div>

            {error && <p className="text-[10px] text-red-400 font-medium ml-0.5">{error}</p>}

            {/* Calendar Modal Portal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm cursor-pointer"
                            />

                            {/* Calendar Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 500 }}
                                className="relative bg-white dark:bg-[#161b22] rounded-2xl border border-black/8 dark:border-white/10 shadow-2xl p-5 w-full max-w-[340px]"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Pick a date</p>
                                        {value && (
                                            <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5 font-medium">
                                                Selected: {new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <Calendar
                                    mode="single"
                                    selected={value ? new Date(value + 'T00:00:00') : undefined}
                                    onSelect={handleSelect}
                                    disabled={(date) => minDate ? date < new Date(minDate + 'T00:00:00') : false}
                                    initialFocus
                                />

                                {/* Today shortcut */}
                                <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex justify-center">
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            handleSelect(now);
                                        }}
                                        className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/50 hover:text-[#0d3542] dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-lg transition-all"
                                    >
                                        Today
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
