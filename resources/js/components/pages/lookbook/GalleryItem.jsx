import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Maximize2 } from 'lucide-react';

const GalleryItem = ({ image, openLightbox, toggleFavorite, isFavorite }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Variant for the grid item's animated entry
    const itemVariants = {
        hidden: { opacity: 0, y: 25, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 80, damping: 20, mass: 1 }
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="relative aspect-[3/4] overflow-hidden rounded-xl cursor-pointer group"
            onClick={openLightbox}
            layoutId={`lookbook-image-container-${image.id}`}
        >
            {/* Image with loading state and hover effect */}
            <motion.img
                src={image.src}
                alt={image.title}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setIsLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.6 }}
            />
            
            {/* Animated overlay with content */}
            <motion.div
                className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
            >
                {/* Text Content */}
                <div>
                    <h3 className="text-xl font-serif text-white tracking-wide">{image.title}</h3>
                    <p className="text-sm text-attire-gold/90">{image.collection}</p>
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(image.id);
                        }}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-full transition-colors hover:bg-white/20"
                        aria-label="Toggle Favorite"
                    >
                        <Heart
                            className={`w-4 h-4 transition-all duration-300 ${
                                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                            }`}
                        />
                    </button>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default GalleryItem;
