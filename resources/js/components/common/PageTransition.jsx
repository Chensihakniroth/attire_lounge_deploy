import React, { useEffect, useState } from 'react';
import { motion, useIsPresent } from 'framer-motion';

const PageTransition = ({ children }) => {
    // isPresent lets us know if this component is actively mounted or being unmounted by AnimatePresence
    const isPresent = useIsPresent();

    // We only want the entry block transition to fire on initial load
    // After that, the exit block covers the screen, and the enter block reveals it
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'linear' }}
                className="w-full flex-grow flex flex-col"
            >
                {children}
            </motion.div>

            {/* Background Overlay Mask that slides IN when leaving a page */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: isPresent ? '100%' : '0%' }}
                exit={{ y: '0%' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[99999] bg-attire-navy flex flex-col items-center justify-center overflow-hidden"
                style={{ pointerEvents: isPresent ? 'none' : 'auto' }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isPresent ? 0 : 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <span className="font-serif text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-white/50">
                        Attire Lounge Official
                    </span>
                    <div className="w-12 h-px bg-attire-accent mt-4 opacity-50" />
                </motion.div>
            </motion.div>

            {/* Background Overlay Mask that slides OUT when entering a new page */}
            <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '-100%' }}
                transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.05,
                }}
                className="fixed inset-0 z-[99998] bg-attire-navy pointer-events-none"
            />
        </>
    );
};

export default PageTransition;
