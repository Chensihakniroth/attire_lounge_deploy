// resources/js/components/pages/lookbook/LookbookHeader.jsx - CINEMATIC HEADER
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
                <div className="flex items-center justify-center gap-6 mb-10">
                    <div className="h-px w-12 bg-attire-accent/40" />
                    <span className="text-attire-accent text-[10px] font-black uppercase tracking-[0.6em]">Visual Archives</span>
                    <div className="h-px w-12 bg-attire-accent/40" />
                </div>
                
                <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-12 leading-[0.85] tracking-tighter italic">
                    Sartorial <br /> <span className="text-white/30 drop-shadow-2xl">Lookbook</span>
                </h1>
                
                <p className="text-sm md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed font-light tracking-widest">
                    A definitive visual catalog of styling excellence. Explore the intersection of traditional craftsmanship and contemporary silhouette.
                </p>
            </motion.div>
        </div>
    );
});

LookbookHeader.displayName = 'LookbookHeader';

export default LookbookHeader;
