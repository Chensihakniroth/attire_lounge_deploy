import React, { memo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LOOKBOOK_CATEGORIES } from '../../../data/lookbook.js';

const LookbookFilter = memo(({ currentFilter, setFilter }) => {
    const scrollContainerRef = useRef(null);

    const scroll = useCallback((direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="relative z-40 sticky top-24 max-w-6xl mx-auto px-6 mb-20 pointer-events-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full bg-attire-navy/80 backdrop-blur-xl border border-white/20 rounded-full p-1 sm:p-1.5 flex items-center shadow-2xl"
            >
                <button 
                    onClick={() => scroll(-1)}
                    className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors md:hidden"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={16} />
                </button>

                <div 
                    ref={scrollContainerRef} 
                    className="flex-grow flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar px-2"
                >
                    {LOOKBOOK_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setFilter(category.id)}
                            className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all duration-500 font-bold ${
                                currentFilter === category.id 
                                    ? 'bg-white text-black shadow-xl scale-[1.02]' 
                                    : 'text-white/40 hover:text-white hover:bg-white/5 scale-100'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => scroll(1)}
                    className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors md:hidden"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={16} />
                </button>
            </motion.div>
        </div>
    );
});

LookbookFilter.displayName = 'LookbookFilter';

export default LookbookFilter;
