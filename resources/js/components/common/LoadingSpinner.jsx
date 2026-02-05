import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative w-20 h-20">
                {/* Outer Ring */}
                <motion.div 
                    className="absolute inset-0 border-[1px] border-attire-accent/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Spinning Accent Segment */}
                <motion.div 
                    className="absolute inset-0 border-t-[1px] border-attire-accent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Inner Pulsing Diamond / Logo Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        className="w-2 h-2 bg-attire-accent rotate-45"
                        animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="text-[10px] tracking-[0.5em] text-attire-silver uppercase font-light"
            >
                Loading Excellence
            </motion.p>
        </div>
    );
};

export default LoadingSpinner;
