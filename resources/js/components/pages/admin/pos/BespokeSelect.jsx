import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus } from 'lucide-react';

/**
 * BespokeSelect — Shared dropdown select component used by PosProductManager and ShoeManager.
 * Supports dynamic direction detection (opens up if not enough space below),
 * action items (styled differently, trigger onAction instead of onChange),
 * and click-outside-to-close.
 */
const BespokeSelect = ({ value, options, onChange, onAction, placeholder = "Select...", className = "", direction = "down" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calculatedDirection, setCalculatedDirection] = useState(direction);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 300) {
                setCalculatedDirection("up");
            } else {
                setCalculatedDirection("down");
            }
        }
    }, [isOpen]);

    const handleOptionClick = (val, isActionItem) => {
        if (isActionItem && onAction) {
            onAction(val);
        } else {
            onChange(val);
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white flex items-center justify-between rounded-xl group"
            >
                <span className={!value ? 'text-gray-400 dark:text-white/10 truncate' : 'truncate'}>
                    {value || placeholder}
                </span>
                <ChevronDown size={14} className={`text-[#0d3542] dark:text-[#58a6ff] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: calculatedDirection === "up" ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: calculatedDirection === "up" ? 10 : -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute z-100 min-w-full w-max max-w-[300px] mt-2 bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] shadow-2xl rounded-2xl overflow-hidden py-2 ${calculatedDirection === "up" ? "bottom-full mb-2" : ""}`}
                    >
                        <div className="max-h-75 overflow-y-auto attire-scrollbar">
                            {options.map((option, i) => {
                                const isString = typeof option === 'string';
                                const label = isString ? option : option.label;
                                const val = isString ? option : option.value;
                                const isAction = !isString && option.isAction;

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleOptionClick(val, isAction)}
                                        className={`w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group
                                            ${val === value
                                                ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]'
                                                : isAction
                                                    ? 'text-[#0d3542] dark:text-[#58a6ff] border-t-2 border-black/15 dark:border-[#30363d] mt-2'
                                                    : 'text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {val === value && <Check size={14} />}
                                        {isAction && <Plus size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BespokeSelect;
