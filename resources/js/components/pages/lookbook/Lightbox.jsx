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
            {/* Minimal Background Noise */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {/* Header */}
            {!isFullscreen && (
                <div className="absolute top-0 left-0 right-0 z-[110] p-4 md:p-10 flex justify-between items-center pointer-events-none">
                    <div className="flex flex-col pointer-events-auto">
                        <span className="text-[8px] md:text-[10px] font-bold text-attire-accent uppercase tracking-[0.4em] mb-1">
                            {selectedImage.collection || 'Collection'}
                        </span>
                        <h3 className="text-white font-serif text-sm md:text-lg tracking-wide">{selectedImage.title}</h3>
                    </div>
                    
                    <button
                        onClick={closeLightbox}
                        className="p-2.5 md:p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all pointer-events-auto text-white"
                    >
                        <X className="w-4 h-4 md:w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className={`relative w-full h-full flex flex-col lg:flex-row items-center justify-center transition-all ${isFullscreen ? 'p-0' : 'p-4 pt-24 pb-8 md:p-16 lg:p-24 lg:gap-20 overflow-y-auto lg:overflow-hidden max-w-[1600px] mx-auto'}`}>
                
                {/* Image Section */}
                <div className={`relative flex-shrink-0 flex items-center justify-center ${isFullscreen ? 'w-full h-full' : 'w-full lg:w-[55%] py-8 lg:py-0'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImage.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={handleToggleFullscreen}
                        >
                            <div className={`relative w-full h-full flex items-center justify-center ${isFullscreen ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                                <OptimizedImage
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    containerClassName="w-full h-full flex items-center justify-center"
                                    className={isFullscreen ? 'w-full h-full' : 'max-w-full max-h-[45vh] lg:max-h-[70vh] shadow-2xl'}
                                    objectFit="contain"
                                    draggable="false"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {!isFullscreen && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-0 pointer-events-none">
                            <button 
                                onClick={(e) => { e.stopPropagation(); paginate(-1); }} 
                                className="p-2 md:p-4 text-white/20 hover:text-white transition-colors pointer-events-auto"
                            >
                                <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); paginate(1); }} 
                                className="p-2 md:p-4 text-white/20 hover:text-white transition-colors pointer-events-auto"
                            >
                                <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {!isFullscreen && (
                    <div className="w-full lg:w-[35%] flex flex-col justify-center text-left space-y-6 md:space-y-10 px-2 pb-10 lg:pb-0">
                        <div className="space-y-3 md:space-y-6">
                            <h2 className="text-2xl md:text-5xl font-serif text-white leading-tight">
                                {selectedImage.title}
                            </h2>
                            <p className="text-attire-silver/60 text-xs md:text-base font-light leading-relaxed max-w-sm">
                                A showcase of technical precision and timeless design. This piece highlights the intersection of classic elegance and modern silhouettes.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8 md:gap-x-12 border-t border-white/5 pt-6 md:pt-10">
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1">Details</p>
                                <p className="text-white/80 text-xs md:text-sm font-light">Custom Hand-finished</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1">Fabric</p>
                                <p className="text-white/80 text-xs md:text-sm font-light">Italian Wool-Silk</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1">Fit</p>
                                <p className="text-white/80 text-xs md:text-sm font-light">Sartorial Slim</p>
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-bold text-attire-accent uppercase tracking-[0.3em] mb-1">Look</p>
                                <p className="text-white/80 text-xs md:text-sm font-light">#{selectedImage.id.toString().padStart(2, '0')}</p>
                            </div>
                        </div>

                        <div className="pt-2 md:pt-4">
                            <button 
                                onClick={() => toggleFavorite(selectedImage.id)}
                                className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                                    favorites.includes(selectedImage.id) 
                                        ? 'bg-attire-accent text-black' 
                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <Heart size={14} className={favorites.includes(selectedImage.id) ? 'fill-current' : ''} />
                                {favorites.includes(selectedImage.id) ? 'Added' : 'Favorite'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Close */}
            {isFullscreen && (
                <button 
                    onClick={handleToggleFullscreen}
                    className="absolute top-6 right-6 p-4 bg-black/40 rounded-full text-white hover:bg-black/60 transition-all"
                >
                    <Minimize className="w-6 h-6" />
                </button>
            )}
        </motion.div>
    );
};

export default Lightbox;
