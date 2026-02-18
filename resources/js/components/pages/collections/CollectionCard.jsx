import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const CollectionCard = ({ collection }) => {
    return (
        <motion.div
            className="group relative h-[24rem] rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-attire-dark"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <motion.div
                    className="w-full h-full"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <OptimizedImage
                        src={collection.image}
                        alt={collection.title}
                        containerClassName="w-full h-full"
                        className="w-full h-full"
                    />
                </motion.div>
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-3xl font-serif text-white mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                    {collection.title}
                </h3>
                <p className="text-white/70 text-sm max-w-xs mb-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {collection.description}
                </p>
                <div className="inline-flex items-center gap-2 text-attire-accent font-medium border-b border-attire-accent/30 pb-1 group-hover:border-attire-accent transition-colors">
                    <span className="text-sm uppercase tracking-widest">Explore</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Item Count Badge */}
            <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-tighter text-white/80 font-medium">
                    {collection.itemsCount || 'New'} Collection
                </span>
            </div>
        </motion.div>
    );
};

export default CollectionCard;

