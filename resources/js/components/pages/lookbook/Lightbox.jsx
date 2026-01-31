import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Share2, Download, Heart, Maximize2, Minimize, Info } from 'lucide-react';

const lightboxVariants = {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: { opacity: 1, backdropFilter: 'blur(20px)' },
};

const imageSlideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
        scale: 0.9,
        rotateY: direction > 0 ? 5 : -5
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
            duration: 0.5,
            ease: [0.19, 1, 0.22, 1] // Power4.easeOut
        }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0,
        scale: 0.9,
        rotateY: direction < 0 ? 5 : -5,
        transition: {
            duration: 0.5,
            ease: [0.19, 1, 0.22, 1]
        }
    })
};

const Lightbox = ({
    selectedImage,
    closeLightbox,
    direction,
    paginate,
    toggleFavorite,
    favorites
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInfo, setShowInfo] = useState(true);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginate, closeLightbox]);

    if (!selectedImage) return null;

    const handleToggleFullscreen = (e) => {
        e.stopPropagation();
        setIsFullscreen(!isFullscreen);
    };

    return (
        <motion.div
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 overflow-hidden"
            onClick={closeLightbox}
        >
            {/* Film Grain Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Top Bar Controls */}
            <div className="absolute top-0 left-0 right-0 z-[110] p-6 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col text-white pointer-events-auto">
                     <span className="text-[10px] tracking-[0.3em] uppercase text-attire-silver/60">Collection</span>
                     <span className="font-serif text-xl tracking-wide">{selectedImage.collection}</span>
                </div>
                
                <motion.button
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={closeLightbox}
                    className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all pointer-events-auto"
                >
                    <X className="w-5 h-5 text-white" />
                </motion.button>
            </div>

            {/* Main Content Area */}
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={selectedImage.id}
                        custom={direction}
                        variants={imageSlideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipeThreshold = 50;
                            if (offset.x < -swipeThreshold) {
                                paginate(1);
                            } else if (offset.x > swipeThreshold) {
                                paginate(-1);
                            }
                        }}
                        className={`relative shadow-2xl origin-center bg-[#050505] overflow-hidden transition-all duration-500 ease-out ${
                            isFullscreen 
                                ? 'w-full h-full rounded-none' 
                                : 'w-full max-w-4xl aspect-[3/4] md:aspect-[4/3] max-h-[85vh] rounded-sm'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.title}
                            className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'} select-none`}
                            draggable="false"
                        />
                        
                        {/* Image Overlay Gradient - Only visible when not full screen or on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-500 ${showInfo && !isFullscreen ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

                        {/* Info & Actions - Floating on Image */}
                        <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between transition-all duration-500 ${showInfo && !isFullscreen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 hover:translate-y-0 hover:opacity-100'}`}>
                            
                            <div className="max-w-md">
                                <h2 className="text-3xl md:text-5xl font-serif text-white mb-2 tracking-tight">{selectedImage.title}</h2>
                                <p className="text-attire-silver/70 text-sm font-light leading-relaxed line-clamp-2">
                                    A statement of elegance from the {selectedImage.collection}. 
                                    Tailored for the modern gentleman who appreciates the finer details.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedImage.id); }} 
                                    className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${favorites.includes(selectedImage.id) ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                                >
                                    <Heart className={`w-5 h-5 ${favorites.includes(selectedImage.id) ? 'fill-current' : ''}`} />
                                </button>
                                
                                <button 
                                    onClick={handleToggleFullscreen} 
                                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                                >
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Floating Navigation Controls - Dissociated from Image */}
                {!isFullscreen && (
                    <>
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={(e) => { e.stopPropagation(); paginate(-1); }} 
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
                        </motion.button>

                        <motion.button 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={(e) => { e.stopPropagation(); paginate(1); }} 
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </>
                )}
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                 <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    key={selectedImage.id}
                    transition={{ duration: 5, ease: "linear" }} // Auto-progress simulation visual only
                    className="h-full bg-attire-accent"
                 />
            </div>
        </motion.div>
    );
};

export default Lightbox;