import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryItem from './GalleryItem.jsx';

const LookbookGrid = memo(({ images, onImageClick }) => {
    // Container variants to coordinate the staggered reveal of children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Delay between each item's animation
                delayChildren: 0.1     // Initial delay before starting the sequence
            }
        },
        exit: {
            opacity: 0,
            transition: { staggerChildren: 0.02, staggerDirection: -1 }
        }
    };

    return (
        <AnimatePresence mode='popLayout'>
            <motion.div 
                key={images.map(img => img.id).join(',')} // Key helps trigger animation on page/filter change
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
                {images.map((image) => (
                    <GalleryItem 
                        key={image.id} 
                        image={image} 
                        onClick={() => onImageClick(image.id)} 
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    );
});

LookbookGrid.displayName = 'LookbookGrid';

export default LookbookGrid;
