import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Share2, Download, Heart, Maximize2, Minimize } from 'lucide-react';

const lightboxVariants = {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: { opacity: 1, backdropFilter: 'blur(24px)' },
};

const imageSlideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
        scale: 0.95
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0,
        scale: 0.95
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

    if (!selectedImage) return null;

    const handleToggleFullscreen = (e) => {
        e.stopPropagation();
        setIsFullscreen(!isFullscreen);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        alert('Sharing feature to be implemented');
    };

    return (
        <motion.div
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={closeLightbox} // Always close lightbox on backdrop click
        >
            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center">
                
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    onClick={closeLightbox}
                    className="absolute top-6 right-6 z-[60] p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-6 h-6 text-white" />
                </motion.button>
                
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        // This single motion component now handles EVERYTHING
                        key={selectedImage.id}
                        layout
                        layoutId={`lookbook-image-container-${selectedImage.id}`}
                        variants={imageSlideVariants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                        }}
                        className={`absolute rounded-xl overflow-hidden shadow-2xl bg-attire-cream ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[30rem] max-w-[90vw] aspect-[3/4]'}`}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (isFullscreen) return; // Disable drag navigation in fullscreen
                            const swipe = Math.abs(offset.x);
                            if (swipe > 50) paginate(offset.x > 0 ? -1 : 1);
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking on the image itself
                    >
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.title}
                            className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
                        />
                        <div className="absolute inset-0 p-6 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent">
                            <div>
                                <h2 className="text-3xl font-serif text-white">{selectedImage.title}</h2>
                                <p className="text-attire-gold">{selectedImage.collection}</p>
                            </div>
                            <div className="flex items-center self-end gap-3">
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedImage.id); }} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                                    <Heart className={`w-5 h-5 transition-all ${favorites.includes(selectedImage.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                </button>
                                <button onClick={handleToggleFullscreen} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                                    {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
                                </button>
                                <button onClick={handleShare} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                                    <Share2 className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {!isFullscreen && ( // Navigation buttons hidden in fullscreen mode
                    <div onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => paginate(-1)} className="absolute left-4 md:left-10 xl:left-24 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                            <ChevronLeft className="w-7 h-7 text-white" />
                        </button>
                        <button onClick={() => paginate(1)} className="absolute right-4 md:right-10 xl:right-24 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                            <ChevronRight className="w-7 h-7 text-white" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Lightbox;