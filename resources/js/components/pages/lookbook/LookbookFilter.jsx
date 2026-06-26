// resources/js/components/pages/lookbook/LookbookFilter.jsx - MOBILE-FRIENDLY FILTERS WITH CUSTOM DROPDOWN
import React, { memo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LOOKBOOK_CATEGORIES } from '../../../data/lookbook.js';

const CustomDropdown = memo(({ options, current, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const active = options.find(o => o.id === current) || options[0];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors py-2"
            >
                <span>{label}: <span className="text-white">{active.name}</span></span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-50"
                >
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => { onChange(opt.id); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs tracking-[0.15em] transition-colors ${
                                current === opt.id
                                    ? 'text-[#f5a81c] bg-white/5'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {opt.name}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
});

CustomDropdown.displayName = 'CustomDropdown';

const LookbookFilter = memo(({
    currentFilter, onFilterChange,
    currentSort, onSortChange,
    currentGrid, onGridChange
}) => {
    const sortOptions = [
        { id: 'newest', name: 'Newest' },
        { id: 'oldest', name: 'Oldest' },
        { id: 'a-z', name: 'A-Z' },
        { id: 'z-a', name: 'Z-A' },
    ];

    return (
        <div className="relative z-40 max-w-[1600px] mx-auto px-6 mb-10 md:mb-14">
            {/* Category Filters - horizontal scroll on mobile, spread on desktop */}
            <div className="flex md:block overflow-x-auto scrollbar-hide pb-2">
                <div className="flex items-center gap-5 md:gap-6 min-w-max">
                    {LOOKBOOK_CATEGORIES.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => onFilterChange(c.id)}
                            className={`text-xs uppercase tracking-[0.2em] pb-1 transition-colors duration-300 whitespace-nowrap flex-shrink-0 ${
                                currentFilter === c.id
                                    ? 'text-white border-b border-white'
                                    : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 my-5" />

            {/* Grid + Sort controls */}
            <div className="flex items-center justify-between">
                {/* Grid Switcher */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onGridChange('large')}
                        className={`p-2 rounded transition-colors ${currentGrid === 'large' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        title="2 Columns"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.2"/></svg>
                    </button>
                    <button
                        onClick={() => onGridChange('medium')}
                        className={`p-2 rounded transition-colors ${currentGrid === 'medium' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        title="3 Columns"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/><rect x="6" y="1" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/><rect x="11" y="1" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/><rect x="6" y="9" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/><rect x="11" y="9" width="4" height="6" stroke="currentColor" strokeWidth="1.2"/></svg>
                    </button>
                    <button
                        onClick={() => onGridChange('small')}
                        className={`p-2 rounded transition-colors ${currentGrid === 'small' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        title="4 Columns"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="5" y="1" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="1" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="5" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="5" y="5" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="5" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="5" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="5" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="9" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="13" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="5" y="13" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="13" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="13" width="3" height="3" stroke="currentColor" strokeWidth="1.2"/></svg>
                    </button>
                </div>

                {/* Custom Sort Dropdown */}
                <CustomDropdown
                    options={sortOptions}
                    current={currentSort}
                    onChange={onSortChange}
                    label="Sort"
                />
            </div>
        </div>
    );
});

LookbookFilter.displayName = 'LookbookFilter';

export default LookbookFilter;
