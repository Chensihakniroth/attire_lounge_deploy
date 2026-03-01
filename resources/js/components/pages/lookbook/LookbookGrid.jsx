// resources/js/components/pages/lookbook/LookbookGrid.jsx - DYNAMIC GRID
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryItem from './GalleryItem.jsx';

const LookbookGrid = memo(({ images, gridSize = 'medium' }) => {
    // Dynamic Grid Classes 💖
    const gridConfigs = {
        large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12',
        medium: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8',
        small: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
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
                key={`${images.length}-${gridSize}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`grid ${gridConfigs[gridSize] || gridConfigs.medium} transition-all duration-700`}
            >
                {images.map((image) => (
                    <GalleryItem 
                        key={image.id} 
                        image={image} 
                        size={gridSize}
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    );
});

LookbookGrid.displayName = 'LookbookGrid';

export default LookbookGrid;
