import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Heart, Share2, Info, ArrowRight } from 'lucide-react';
import OptimizedImage from '../../common/OptimizedImage.jsx';

// --- Animation Configs ---
const transitionBase = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };
const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
};

const Lightbox = ({
    selectedImage,
    closeLightbox,
    direction,
    paginate,
    toggleFavorite,
    favorites
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginate, closeLightbox]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-attire-navy/98 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 md:p-8 lg:p-12 overflow-hidden"
            onClick={closeLightbox}
        >
            {/* Background Decorations (Sync with ProductListPage) */}
            <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-attire-accent/[0.05] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px]" />
            </div>

            {/* Main Modal Shell */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={transitionBase}
                className="relative w-full max-w-[1400px] h-full lg:h-[80vh] bg-attire-navy lg:rounded-3xl border border-white/10 flex flex-col lg:flex-row overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Fixed Top Right) */}
                <button 
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 z-[60] p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all border border-white/10 backdrop-blur-xl group"
                >
                    <X size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>

                {/* LEFT COLUMN: IMAGE SECTION */}
                <div className="relative w-full lg:w-[50%] h-[50vh] lg:h-full bg-black/20 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={selectedImage.id}
                            custom={direction}
                            initial={{ opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.98 }}
                            transition={transitionBase}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.4}
                            onDragEnd={(_, { offset }) => {
                                if (offset.x < -50) paginate(1);
                                else if (offset.x > 50) paginate(-1);
                            }}
                            whileTap={{ cursor: "grabbing" }}
                            className="w-full h-full flex items-center justify-center p-4 lg:p-10 cursor-grab active:cursor-grabbing touch-pan-y"
                        >
                            {/* Stylish Frame Container */}
                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                                <OptimizedImage
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    objectFit="contain"
                                    containerClassName="w-full h-full max-h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Overlays */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 lg:px-6 pointer-events-none z-20">
                        <button 
                            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all pointer-events-auto backdrop-blur-md border border-white/5"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); paginate(1); }}
                            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all pointer-events-auto backdrop-blur-md border border-white/5"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: TEXT SECTION */}
                <div className="w-full lg:w-[50%] h-[50vh] lg:h-full bg-attire-navy flex flex-col p-5 lg:p-12 xl:p-16 pt-8 lg:pt-16 pb-8 lg:pb-24 overflow-hidden selection:bg-attire-accent selection:text-black">
                    
                    {/* Product Info */}
                    <div className="flex-grow flex flex-col justify-center space-y-4 lg:space-y-6 min-h-0">
                        {/* Breadcrumb / Category */}
                        <motion.div {...slideUp} transition={{ delay: 0.1 }} className="flex items-center gap-3 lg:mb-1">
                            <div className="h-px w-6 bg-attire-accent" />
                            <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.4em] text-attire-accent">
                                {selectedImage.collection || 'The Collection'}
                            </span>
                        </motion.div>

                        <div className="space-y-2 lg:space-y-4 shrink-0">
                            <motion.h2 
                                {...slideUp} 
                                transition={{ delay: 0.2 }}
                                className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif text-white italic leading-[1] tracking-tighter truncate"
                            >
                                {selectedImage.title}
                            </motion.h2>
                            
                            <motion.p 
                                {...slideUp} 
                                transition={{ delay: 0.3 }}
                                className="text-attire-silver/50 text-[10px] lg:text-sm xl:text-base font-light leading-snug max-w-md line-clamp-3 lg:line-clamp-none"
                            >
                                An exceptional expression of craftsmanship. This piece harmonizes traditional tailoring with contemporary aesthetic sensibilities.
                            </motion.p>
                        </div>

                        {/* Specification Grid */}
                        <motion.div 
                            {...slideUp} 
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-y-8 py-3 lg:py-8 border-y border-white/5 shrink-0"
                        >
                            {[
                                { label: 'Category', value: selectedImage.category || 'Outerwear' },
                                { label: 'Silhouette', value: 'Sartorial Fit' },
                                { label: 'Material', value: 'Bespoke Selection' },
                                { label: 'Availability', value: 'Made to Measure' }
                            ].map((spec) => (
                                <div key={spec.label} className="space-y-0.5 lg:space-y-1">
                                    <p className="text-[7px] lg:text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{spec.label}</p>
                                    <p className="text-white font-serif italic text-xs lg:text-base xl:text-lg truncate">{spec.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Interaction & CTA */}
                        <motion.div 
                            {...slideUp} 
                            transition={{ delay: 0.5 }}
                            className="space-y-3 lg:space-y-6 shrink-0"
                        >
                            <div className="flex items-center gap-3 lg:gap-4">
                                <button 
                                    onClick={() => toggleFavorite(selectedImage.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full border transition-all duration-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 ${
                                        favorites.includes(selectedImage.id)
                                            ? 'bg-attire-accent text-black border-attire-accent shadow-lg shadow-attire-accent/20'
                                            : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/5'
                                    }`}
                                >
                                    <Heart size={14} className={favorites.includes(selectedImage.id) ? 'fill-current' : ''} />
                                    {favorites.includes(selectedImage.id) ? 'Saved to Favorites' : 'Add to Favorites'}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer Info */}
                    <motion.div 
                        {...slideUp} 
                        transition={{ delay: 0.6 }}
                        className="mt-8 lg:mt-20 pt-3 lg:pt-8 border-t border-white/5 flex items-center justify-between shrink-0"
                    >
                        <div className="text-[7px] lg:text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                            Attire Lounge Collective
                        </div>
                        <div className="text-[7px] lg:text-[9px] italic font-serif text-white/10">
                            © 2026 Sartorial House
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Lightbox;
