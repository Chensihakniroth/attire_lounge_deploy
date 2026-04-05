import React from 'react';
import { motion } from 'framer-motion';
import { LumaSpin } from '../ui/luma-spin';

/**
 * Premium Loading Component for Admin Panel
 * Uses the LumaSpin animation with custom branding and optional text.
 */
const Loading = ({ 
    text = "Neural Syncing...", 
    fullScreen = false, 
    size = "md",
    className = "" 
}) => {
    const content = (
        <div className={`flex flex-col items-center justify-center space-y-8 ${className}`}>
            <LumaSpin size={size} />
            {text && (
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl flex items-center justify-center"
            >
                {content}
            </motion.div>
        );
    }

    return content;
};

export default Loading;
