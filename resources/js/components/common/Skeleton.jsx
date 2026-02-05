import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '' }) => (
    <div className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}>
        <motion.div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
                x: ['-100%', '100%'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            }}
            style={{ skewX: -20 }}
        />
    </div>
);

export default Skeleton;
