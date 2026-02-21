import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOOKBOOK_IMAGES } from '../../data/lookbook.js';

// Sub-components
import LookbookHeader from './lookbook/LookbookHeader.jsx';
import LookbookFilter from './lookbook/LookbookFilter.jsx';
import LookbookGrid from './lookbook/LookbookGrid.jsx';
import LookbookPagination from './lookbook/LookbookPagination.jsx';
import GrainOverlay from '../common/GrainOverlay.jsx';

// --- Static Helpers ---
const ITEMS_PER_PAGE = 16;

const BackgroundAesthetics = memo(() => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-attire-accent/[0.03] rounded-full blur-[180px] will-change-transform" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] will-change-transform" />
    </div>
));
BackgroundAesthetics.displayName = 'BackgroundAesthetics';

const LookbookPage = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Initial scroll to top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
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
    
    // Memoized pagination logic
    const paginatedImages = useMemo(() => 
        filteredImages.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), 
    [filteredImages, currentPage]);

    // Optimized Handlers
    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
    }, []);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Smooth scroll to the top of the grid area instead of the very top
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    }, [totalPages]);

    const handleImageClick = useCallback((id) => {
        navigate(`/product/${id}`);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-x-hidden selection:bg-attire-accent selection:text-white">
            <style>
                {`
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    ::-webkit-scrollbar {
                        display: none;
                    }

                    /* Hide scrollbar for IE, Edge and Firefox */
                    html, body {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }

                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .will-change-transform { will-change: transform; }
                `}
            </style>

            <GrainOverlay />

            <LookbookHeader />

            <LookbookFilter 
                currentFilter={filter} 
                setFilter={handleFilterChange} 
            />

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <LookbookGrid 
                    images={paginatedImages} 
                    onImageClick={handleImageClick} 
                />

                <LookbookPagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            </main>
        </div>
    );
};

export default LookbookPage;
