import React, { memo } from 'react';
import { motion } from 'framer-motion';

const LookbookHeader = memo(() => {
    return (
        <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-6 z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl mx-auto text-center"
            >
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="h-px w-8 bg-attire-accent/30" />
                    <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold">Archives</span>
                    <div className="h-px w-8 bg-attire-accent/30" />
                </div>
                
                <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-10 leading-[0.85] tracking-tighter italic">
                    Sartorial <br /> <span className="text-attire-silver/40">Lookbook</span>
                </h1>
                
                <p className="text-sm md:text-base text-attire-silver/60 max-w-xl mx-auto leading-relaxed font-light tracking-wide">
                    A definitive visual catalog of styling excellence. Explore the intersection of traditional craftsmanship and contemporary silhouette.
                </p>
            </motion.div>
        </div>
    );
});

LookbookHeader.displayName = 'LookbookHeader';

export default LookbookHeader;
