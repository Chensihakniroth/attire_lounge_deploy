// resources/js/components/pages/lookbook/LookbookFilter.jsx - ATELIER SOLID UTILITY BAR (UNIFIED WIDTH DROPDOWNS)
import React, { memo, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { 
    ChevronDown, Check, LayoutGrid, Grid, Square, 
    ArrowDownAZ, ArrowUpAZ, Clock, ListFilter,
    Layers, MousePointer2
} from 'lucide-react';
import { LOOKBOOK_CATEGORIES } from '../../../data/lookbook.js';

const LookbookFilter = memo(({ 
    currentFilter, onFilterChange, 
    currentSort, onSortChange,
    currentGrid, onGridChange 
}) => {
    const activeCategory = LOOKBOOK_CATEGORIES.find(c => c.id === currentFilter) || LOOKBOOK_CATEGORIES[0];

    const sortOptions = [
        { id: 'newest', name: 'Newest First', icon: Clock },
        { id: 'oldest', name: 'Oldest First', icon: Clock },
        { id: 'a-z', name: 'Alphabetical A-Z', icon: ArrowDownAZ },
        { id: 'z-a', name: 'Alphabetical Z-A', icon: ArrowUpAZ },
    ];
    const activeSort = sortOptions.find(s => s.id === currentSort) || sortOptions[0];

    const gridOptions = [
        { id: 'large', icon: Square, label: 'Showcase' },
        { id: 'medium', icon: LayoutGrid, label: 'Standard' },
        { id: 'small', icon: Grid, label: 'Archive' },
    ];

    return (
        <div className="relative z-40 sticky top-24 max-w-[1400px] mx-auto px-6 mb-32 pointer-events-auto">
            {/* The Bar Container */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#0a0f1a] border border-white/10 rounded-[2.5rem] md:rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
                    
                    {/* 1. COLLECTION SELECTOR */}
                    <div className="flex-1 border-b md:border-b-0 md:border-r border-white/5 relative">
                        <Menu as="div" className="h-full w-full">
                            <Menu.Button as={motion.button}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                className="w-full h-full flex items-center gap-5 px-10 py-6 text-left group/btn transition-colors duration-500 rounded-t-[2.5rem] md:rounded-l-full md:rounded-tr-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:border-attire-accent/40 transition-colors">
                                    <ListFilter size={16} className="text-attire-accent" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Archive</span>
                                    <span className="text-sm font-serif text-white tracking-wide">{activeCategory.name}</span>
                                </div>
                                <ChevronDown size={14} className="ml-auto text-white/20 group-hover/btn:text-white transition-colors" />
                            </Menu.Button>

                            <Transition as={Fragment} enter="transition duration-300 ease-out" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="transition duration-200 ease-in" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
                                <Menu.Items className="absolute left-0 right-0 mt-4 origin-top rounded-[2.5rem] bg-[#0a0f1a] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden py-4 p-2 z-[100]">
                                    {LOOKBOOK_CATEGORIES.map((c) => (
                                        <Menu.Item key={c.id}>
                                            {({ active }) => (
                                                <button onClick={() => onFilterChange(c.id)} className={`flex items-center justify-between w-full px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${currentFilter === c.id ? 'bg-white text-black' : active ? 'bg-white/5 text-white' : 'text-white/50'}`}>
                                                    {c.name}
                                                    {currentFilter === c.id && <Check size={14} strokeWidth={4} />}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                    {/* 2. GRID SWITCHER */}
                    <div className="flex-none flex items-center justify-center px-10 py-6 md:py-0">
                        <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10">
                            {gridOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => onGridChange(opt.id)}
                                    className={`relative p-3.5 rounded-full transition-all duration-700 group/grid ${currentGrid === opt.id ? 'bg-white text-black shadow-xl scale-110' : 'text-white/30 hover:text-white'}`}
                                    title={`${opt.label} View`}
                                >
                                    <opt.icon size={16} />
                                    {currentGrid === opt.id && (
                                        <motion.div layoutId="activeGrid" className="absolute inset-0 bg-white rounded-full -z-10" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. SORT SELECTOR */}
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-white/5 relative">
                        <Menu as="div" className="h-full w-full">
                            <Menu.Button as={motion.button}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                className="w-full h-full flex items-center gap-5 px-10 py-6 text-right group/sort transition-colors duration-500 rounded-b-[2.5rem] md:rounded-r-full md:rounded-bl-none"
                            >
                                <ChevronDown size={14} className="mr-auto text-white/20 group-hover/sort:text-white transition-colors" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Order</span>
                                    <span className="text-sm font-serif text-white tracking-wide">{activeSort.name}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/sort:border-attire-accent/40 transition-colors">
                                    <activeSort.icon size={16} className="text-attire-accent" />
                                </div>
                            </Menu.Button>

                            <Transition as={Fragment} enter="transition duration-300 ease-out" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="transition duration-200 ease-in" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
                                <Menu.Items className="absolute left-0 right-0 mt-4 origin-top rounded-[2.5rem] bg-[#0a0f1a] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden py-4 p-2 z-[100]">
                                    {sortOptions.map((s) => (
                                        <Menu.Item key={s.id}>
                                            {({ active }) => (
                                                <button onClick={() => onSortChange(s.id)} className={`flex items-center justify-between w-full px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${currentSort === s.id ? 'bg-white text-black' : active ? 'bg-white/5 text-white' : 'text-white/50'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <s.icon size={14} className={currentSort === s.id ? 'text-black' : 'text-attire-accent/60'} />
                                                        {s.name}
                                                    </div>
                                                    {currentSort === s.id && <Check size={14} strokeWidth={4} />}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>

                </div>
            </motion.div>
        </div>
    );
});

LookbookFilter.displayName = 'LookbookFilter';

export default LookbookFilter;
