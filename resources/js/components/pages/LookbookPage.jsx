import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { LOOKBOOK_IMAGES } from '../../data/lookbook.js';

// Sub-components
import LookbookHeader from './lookbook/LookbookHeader.jsx';
import LookbookFilter from './lookbook/LookbookFilter.jsx';
import LookbookGrid from './lookbook/LookbookGrid.jsx';
import GrainOverlay from '../common/GrainOverlay.jsx';
import SEO from '../common/SEO';

// --- Static Helpers ---
const ITEMS_PER_PAGE = 12;

const BackgroundAesthetics = memo(() => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-attire-accent/[0.02] rounded-full blur-[150px] will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] will-change-transform" />
    </div>
));
BackgroundAesthetics.displayName = 'BackgroundAesthetics';

const LookbookPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'all';
    const [currentPage, setCurrentPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Initial scroll to top and loader simulation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const timer = setTimeout(() => setIsInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Memoized filtering logic
    const filteredImages = useMemo(() => 
        LOOKBOOK_IMAGES.filter(img => filter === 'all' || img.category.includes(filter)), 
    [filter]);
    
    const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
    const hasMore = currentPage < totalPages;
    
    // Memoized progressive loading logic
    const visibleImages = useMemo(() => 
        filteredImages.slice(0, currentPage * ITEMS_PER_PAGE), 
    [filteredImages, currentPage]);

    // Optimized Handlers
    const handleFilterChange = useCallback((newFilter) => {
        setSearchParams({ filter: newFilter });
    }, [setSearchParams]);

    const handleLoadMore = () => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div 
            className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white"
            style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden'
            }}
        >
            <SEO 
                title="Lookbook | Elite Styling House"
                description="A visual journey through our finest collections. Expertly curated luxury styles for the modern gentleman."
            />
            
            <style>
                {`
                    ::-webkit-scrollbar { display: none; }
                    html, body { scrollbar-width: none; }
                    .will-change-transform { 
                        will-change: transform; 
                        transform: translateZ(0);
                        -webkit-backface-visibility: hidden;
                    }
                `}
            </style>

            <GrainOverlay />
            <BackgroundAesthetics />

            <LookbookHeader />

            <LookbookFilter 
                currentFilter={filter} 
                setFilter={handleFilterChange} 
            />

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <AnimatePresence mode="wait">
                    {isInitialLoading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32"
                        >
                            <Loader2 className="w-12 h-12 text-attire-accent animate-spin mb-4" />
                            <p className="text-attire-silver/40 text-[10px] uppercase tracking-[0.5em] font-bold">Curating Visuals...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <LookbookGrid 
                                images={visibleImages} 
                            />

                            {hasMore && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex justify-center mt-24"
                                >
                                    <button 
                                        onClick={handleLoadMore} 
                                        className="group flex flex-col items-center gap-6"
                                    >
                                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700 shadow-2xl relative overflow-hidden">
                                            <ChevronDown className="text-white group-hover:text-black transition-colors duration-500 relative z-10 group-hover:translate-y-1 transition-transform" size={24} />
                                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                        </div>
                                        <span className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-bold group-hover:text-attire-accent transition-colors duration-500">Reveal More</span>
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LookbookPage;
