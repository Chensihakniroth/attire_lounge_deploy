import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '' }) => (
    <motion.div 
        className={`bg-white/5 rounded-xl ${className}`}
        animate={{
            opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

export default Skeleton;
