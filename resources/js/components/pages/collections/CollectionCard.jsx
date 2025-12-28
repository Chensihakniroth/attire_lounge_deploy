import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 80, damping: 20, mass: 1 }
    }
};

const CollectionCard = ({ collection }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <motion.div
            variants={cardVariants}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl group cursor-pointer"
        >
            {!isLoaded && (
                <div className="absolute inset-0 bg-attire-cream animate-pulse" />
            )}
            
            <motion.img
                src={collection.image}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setIsLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
            />

            {collection.featured && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Star className="w-3 h-3 text-attire-gold" fill="currentColor" />
                    <span>Featured</span>
                </div>
            )}

            <motion.div
                className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
            >
                <div>
                    <h3 className="text-2xl font-serif text-white tracking-wide">{collection.title}</h3>
                    <p className="text-sm text-white/70 mt-1 mb-4 max-w-xs">{collection.description}</p>
                </div>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white font-semibold">
                        <span>Explore</span>
                        <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </div>
                    <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        {collection.itemsCount} items
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CollectionCard;
