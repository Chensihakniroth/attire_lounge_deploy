// resources/js/components/pages/LookbookPage.jsx - CINEMATIC ATELIER UTILITY OVERHAUL (SOLID VERSION)
import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { LOOKBOOK_IMAGES } from '../../data/lookbook.js';

// Sub-components
import LookbookHeader from './lookbook/LookbookHeader.jsx';
import LookbookFilter from './lookbook/LookbookFilter.jsx';
import LookbookGrid from './lookbook/LookbookGrid.jsx';
import SEO from '../common/SEO';

// --- Static Helpers ---
const ITEMS_PER_PAGE = 12;

const LookbookPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const grid = searchParams.get('grid') || 'medium';
    
    const [currentPage, setCurrentPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const timer = setTimeout(() => setIsInitialLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, sort]);

    const filteredAndSortedImages = useMemo(() => {
        let result = LOOKBOOK_IMAGES.filter(img => filter === 'all' || img.category.includes(filter));
        
        switch (sort) {
            case 'a-z':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'z-a':
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'oldest':
                result.reverse();
                break;
            case 'newest':
            default:
                break;
        }
        return result;
    }, [filter, sort]);
    
    const totalPages = Math.ceil(filteredAndSortedImages.length / ITEMS_PER_PAGE);
    const hasMore = currentPage < totalPages;
    
    const visibleImages = useMemo(() => 
        filteredAndSortedImages.slice(0, currentPage * ITEMS_PER_PAGE), 
    [filteredAndSortedImages, currentPage]);

    const updateParams = useCallback((key, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(key, value);
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleLoadMore = () => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-attire-midnight text-white relative selection:bg-attire-accent selection:text-black overflow-x-hidden">
            <SEO 
                title="Lookbook | Atelier Styling House"
                description="A curated visual journey through our finest sartorial collections. Hand-crafted elegance for the modern gentleman."
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                *::-webkit-scrollbar { display: none !important; }
                * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `}} />
            
            <div className="relative z-10">
                <LookbookHeader />

                <LookbookFilter 
                    currentFilter={filter} 
                    currentSort={sort}
                    currentGrid={grid}
                    onFilterChange={(v) => updateParams('filter', v)} 
                    onSortChange={(v) => updateParams('sort', v)}
                    onGridChange={(v) => updateParams('grid', v)}
                />

                <main className="max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 pb-48">
                    <AnimatePresence mode="wait">
                        {isInitialLoading ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-48"
                            >
                                <div className="relative mb-10">
                                    <motion.div 
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-20 h-20 bg-attire-accent/10 rounded-full flex items-center justify-center border border-attire-accent/20"
                                    >
                                        <Camera className="w-8 h-8 text-attire-accent" strokeWidth={1} />
                                    </motion.div>
                                    <Loader2 className="absolute inset-0 w-20 h-20 text-white/5 animate-spin" strokeWidth={0.5} />
                                </div>
                                <p className="text-white/60 text-[10px] uppercase tracking-[0.6em] font-black">Developing Visuals</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${filter}-${sort}-${grid}`}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <LookbookGrid images={visibleImages} gridSize={grid} />

                                {hasMore && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="flex flex-col items-center mt-32 space-y-10"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-px w-16 bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">
                                                Archive Segment {currentPage} of {totalPages}
                                            </span>
                                            <div className="h-px w-16 bg-white/10" />
                                        </div>

                                        <button 
                                            onClick={handleLoadMore} 
                                            className="group relative px-16 py-7 rounded-2xl overflow-hidden transition-all duration-700 hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-white/[0.03] border border-white/10 group-hover:bg-white group-hover:border-white transition-all duration-700" />
                                            <div className="relative flex items-center gap-6">
                                                <span className="text-[11px] tracking-[0.6em] text-white group-hover:text-black uppercase font-black transition-colors duration-500">Reveal More</span>
                                                <ChevronDown className="text-attire-accent group-hover:text-black transition-colors duration-500 group-hover:translate-y-1 transition-transform" size={18} strokeWidth={3} />
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {!hasMore && filteredAndSortedImages.length > 0 && (
                                    <div className="flex flex-col items-center mt-32 space-y-6 opacity-30">
                                        <div className="h-px w-24 bg-attire-accent/30 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">End of Collection</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default LookbookPage;
