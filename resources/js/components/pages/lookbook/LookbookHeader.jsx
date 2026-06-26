// resources/js/components/pages/lookbook/LookbookHeader.jsx - CENTERED EDITORIAL HEADER
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const LookbookHeader = memo(() => {
    return (
        <div className="relative pt-28 pb-14 md:pt-36 md:pb-20 px-6 z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl mx-auto text-center"
            >
                <h1 className="font-serif text-4xl md:text-6xl leading-tight text-white mb-6">
                    Lookbook
                </h1>
                <p className="text-white/50 text-sm md:text-base font-light max-w-md mx-auto leading-relaxed">
                    Curated styles and editorial looks from Attire Lounge. Discover our latest collections and styling inspiration.
                </p>
            </motion.div>
        </div>
    );
});

LookbookHeader.displayName = 'LookbookHeader';

export default LookbookHeader;
