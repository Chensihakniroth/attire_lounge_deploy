import React, { useEffect, useState } from 'react';
import { motion, useIsPresent } from 'framer-motion';

const PageTransition = ({ children }) => {
    // isPresent lets us know if this component is actively mounted or being unmounted by AnimatePresence
    const isPresent = useIsPresent();

    return (
        <motion.div
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full min-h-screen flex flex-col will-change-opacity"
            >
            {children}
        </motion.div>
    );
};

export default PageTransition;
