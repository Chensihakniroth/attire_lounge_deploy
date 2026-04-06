import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

/**
 * DatePicker - A premium, Cyber-Bespoke date selection component.
 * Replaces standard HTML date inputs with a high-end floating calendar.
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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    onClick={() => setIsOpen(!isOpen)}
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={cn(
                            "absolute top-full left-0 mt-2 z-[100] origin-top",
                            "bg-[#fdfdfc] dark:bg-[#0d1117] rounded-3xl border border-[#0d3542]/10 dark:border-[#f5a81c]/10 shadow-2xl p-4 min-w-[280px]"
                        )}
                    >
                        {/* Demo Header Style */}
                        <div className="flex flex-col items-center gap-1 mb-4 pb-4 border-b border-black/5 dark:border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d3542] dark:text-[#f5a81c]">Date Selection</h3>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest italic">Sovereign Ledger v4</p>
                        </div>

                        <Calendar
                            mode="single"
                            selected={value ? new Date(value) : undefined}
                            onSelect={handleSelect}
                            disabled={(date) => minDate ? date < new Date(minDate) : false}
                            initialFocus
                        />

                        {/* Demo Footer Style */}
                        {value && (
                            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-center">
                                <div className="px-5 py-2 bg-[#0d3542]/5 dark:bg-[#f5a81c]/5 rounded-full border border-[#0d3542]/10 dark:border-[#f5a81c]/10">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c]">
                                        Selected: {new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
