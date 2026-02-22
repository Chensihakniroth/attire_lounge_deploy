import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const GalleryItem = memo(({ image }) => {
    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1] 
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.3 }
        }
    };

    return (
        <Link to={`/product/${image.id}`}>
            <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden aspect-[3/4.2] rounded-[2px] shadow-2xl border border-white/5 bg-white/5"
            >
                <OptimizedImage
                    src={image.src}
                    alt={image.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    objectFit="cover"
                    priority={false}
                    loading="lazy"
                />
            </motion.div>
        </Link>
    );
});

GalleryItem.displayName = 'GalleryItem';

export default GalleryItem;
