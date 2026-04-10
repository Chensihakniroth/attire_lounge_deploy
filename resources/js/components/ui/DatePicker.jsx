import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

/**
 * DatePicker - A premium, Cyber-Bespoke date selection component.
 * Features: Centered 'Pop-out' modal with backdrop blur for focused selection.
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

    // Format display date: "April 6, 2026"
    const displayDate = value ? new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) : "";

    // Handle selection: converts Date object to YYYY-MM-DD
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
        <div className={cn("relative flex flex-col gap-1.5", className)} ref={containerRef}>
            {label && (
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    {label} {required && <span className="text-attire-accent">*</span>}
                </label>
            )}
            
            <div className="relative group">
                <CalendarIcon 
                    size={14} 
                    className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
                        isOpen ? "text-attire-accent" : "text-gray-400 group-hover:text-gray-300"
                    )} 
                />
                
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "w-full bg-black/5 dark:bg-white/5 border rounded-2xl py-3.5 pl-10 pr-10 text-left transition-all duration-300",
                        "border-black/10 dark:border-white/10 group-hover:border-black/20 dark:group-hover:border-white/20",
                        isOpen ? "border-attire-accent/50 ring-4 ring-attire-accent/5" : "",
                        error ? "border-red-500/50" : "",
                        inputClassName
                    )}
                >
                    <span className={cn(
                        "text-xs tracking-wider font-mono uppercase",
                        value ? "text-gray-900 dark:text-white" : "text-gray-400"
                    )}>
                        {displayDate || placeholder}
                    </span>
                </button>

                <ChevronDown 
                    size={14} 
                    className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300",
                        isOpen ? "rotate-180 text-attire-accent" : ""
                    )} 
                />
            </div>

            {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{error}</p>}

            {/* Centered 'Pop-out' Portal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                            />

                            {/* Calendar Pop-out */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                                className="relative bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-2xl rounded-[3rem] border border-black/10 dark:border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] p-8 overflow-hidden w-full max-w-sm"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Select Date</span>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="p-2.5 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <Calendar
                                    mode="single"
                                    selected={value ? new Date(value) : undefined}
                                    onSelect={handleSelect}
                                    disabled={(date) => minDate ? date < new Date(minDate) : false}
                                    initialFocus
                                />

                                {value && (
                                    <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-4">
                                        <div className="px-6 py-2.5 bg-[#0d3542]/5 dark:bg-[#f5a81c]/5 rounded-full border border-[#0d3542]/10 dark:border-[#f5a81c]/10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c]">
                                                {new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="w-full h-12 bg-[#0d3542] dark:bg-[#f5a81c] text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#0d3542]/20 dark:shadow-[#f5a81c]/20"
                                        >
                                            Confirm Selection
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
