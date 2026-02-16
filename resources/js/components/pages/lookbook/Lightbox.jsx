import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Heart, Maximize2, Minimize } from 'lucide-react';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const Lightbox = ({
    selectedImage,
    closeLightbox,
    direction,
    paginate,
    toggleFavorite,
    favorites
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginate, closeLightbox]);

    useEffect(() => {
        setIsLoaded(false);
        setIsFullscreen(false);
    }, [selectedImage.id]);

    if (!selectedImage) return null;

    const handleToggleFullscreen = (e) => {
        e.stopPropagation();
        setIsFullscreen(!isFullscreen);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-attire-navy overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            {/* Elegant Background Glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {/* Close Button */}
            <div className="absolute top-0 right-0 z-[110] p-4 md:p-10 flex justify-end pointer-events-none">
                <button
                    onClick={closeLightbox}
                    className="p-3 md:p-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all pointer-events-auto text-white"
                >
                    <X className="w-4 h-4 md:w-6 h-6" />
                </button>
            </div>

            {/* Main Content Area: Split View */}
            <div className={`relative w-full h-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center lg:justify-center overflow-y-auto lg:overflow-hidden no-scrollbar ${isFullscreen ? 'p-0' : 'p-4 pt-20 pb-10 md:p-12 lg:p-16 lg:gap-20'}`}>
                
                {/* Image Section */}
                <div className={`relative flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isFullscreen ? 'w-full h-full' : 'w-full lg:w-1/2 h-auto lg:h-[75vh]'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImage.id}
                            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = offset.x;
                                if (swipe < -50) {
                                    paginate(1);
                                } else if (swipe > 50) {
                                    paginate(-1);
                                }
                            }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full h-full flex items-center justify-center touch-none"
                            onClick={handleToggleFullscreen}
                        >
                            <div className={`relative group overflow-hidden transition-all duration-500 cursor-pointer ${
                                isFullscreen 
                                    ? 'w-full h-full rounded-none cursor-zoom-out' 
                                    : 'w-full max-w-sm md:max-w-xl aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] rounded-2xl cursor-zoom-in'
                            }`}>
                                <OptimizedImage
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    containerClassName="w-full h-full"
                                    className="w-full h-full"
                                    objectFit="contain"
                                    draggable="false"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {!isFullscreen && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-0 pointer-events-none">
                            <button 
                                onClick={(e) => { e.stopPropagation(); paginate(-1); }} 
                                className="p-2 md:p-4 rounded-full text-white/20 hover:text-white transition-all pointer-events-auto"
                            >
                                <ChevronLeft className="w-6 h-6 md:w-12 h-12" strokeWidth={1} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); paginate(1); }} 
                                className="p-2 md:p-4 rounded-full text-white/20 hover:text-white transition-all pointer-events-auto"
                            >
                                <ChevronRight className="w-6 h-6 md:w-12 h-12" strokeWidth={1} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {!isFullscreen && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-1/2 flex flex-col justify-center text-left space-y-6 md:space-y-8 mt-8 lg:mt-0 max-w-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-attire-accent/10 border border-attire-accent/20 rounded-full text-[9px] md:text-[10px] font-bold text-attire-accent uppercase tracking-[0.2em]">
                                    {selectedImage.collection || 'Collection'}
                                </span>
                                <span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Look #{selectedImage.id.toString().slice(-2)}</span>
                            </div>
                            
                            <h2 className="text-3xl md:text-6xl font-serif text-white leading-tight tracking-tight">
                                {selectedImage.title}
                            </h2>
                            
                            <p className="text-attire-silver/70 text-sm md:text-lg font-light leading-relaxed max-w-md">
                                A masterpiece of sartorial excellence. This look embodies the sophisticated silhouette and refined craftsmanship that defines Attire Lounge Cambodia.
                            </p>
                        </div>

                        {/* Details Table */}
                        <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8 border-y border-white/10">
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1 md:mb-2">Category</p>
                                <p className="text-xs md:text-white font-medium">Sartorial Design</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1 md:mb-2">Material</p>
                                <p className="text-xs md:text-white font-medium">Premium Selection</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1 md:mb-2">Fit</p>
                                <p className="text-xs md:text-white font-medium">Bespoke Fitting</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1 md:mb-1">Look</p>
                                <p className="text-xs md:text-white font-medium">#{selectedImage.id.toString().padStart(2, '0')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2 md:pt-4 pb-8 lg:pb-0">
                            <button 
                                onClick={() => toggleFavorite(selectedImage.id)}
                                className={`flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full text-sm font-semibold transition-all duration-300 border ${
                                    favorites.includes(selectedImage.id) 
                                        ? 'bg-attire-accent text-black border-attire-accent' 
                                        : 'bg-white text-black border-white hover:bg-attire-accent hover:border-attire-accent'
                                }`}
                            >
                                <Heart size={16} className={favorites.includes(selectedImage.id) ? 'fill-current' : ''} />
                                {favorites.includes(selectedImage.id) ? 'Added' : 'Add to Favorites'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Fullscreen Close */}
            {isFullscreen && (
                <button 
                    onClick={handleToggleFullscreen}
                    className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all border border-white/10"
                >
                    <Minimize className="w-6 h-6" />
                </button>
            )}
        </motion.div>
    );
};

export default Lightbox;
