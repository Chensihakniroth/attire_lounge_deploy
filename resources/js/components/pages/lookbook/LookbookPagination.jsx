import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LookbookPagination = memo(({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-12 mt-32">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-500"
                aria-label="Previous page"
            >
                <ChevronLeft size={24} strokeWidth={1} className="group-hover:-translate-x-2 transition-transform duration-500" />
                <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Previous</span>
            </button>
            
            <div className="flex flex-col items-center gap-2">
                 <div className="text-attire-accent font-serif italic text-xl">
                    {currentPage.toString().padStart(2, '0')}
                </div>
                <div className="w-12 h-px bg-white/10" />
                <div className="text-white/20 text-[10px] font-bold">
                    {totalPages.toString().padStart(2, '0')}
                </div>
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-500"
                aria-label="Next page"
            >
                <ChevronRight size={24} strokeWidth={1} className="group-hover:translate-x-2 transition-transform duration-500" />
                <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Next Page</span>
            </button>
        </div>
    );
});

LookbookPagination.displayName = 'LookbookPagination';

export default LookbookPagination;
