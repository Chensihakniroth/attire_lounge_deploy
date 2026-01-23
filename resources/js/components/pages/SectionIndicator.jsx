import React from 'react';
import { motion } from 'framer-motion';

const SectionIndicator = ({ sections, activeSection, scrollToSection, isMenuOpen }) => {
    if (isMenuOpen) {
        return null;
    }

    const getBubbleStyle = (index) => {
        const distance = Math.abs(activeSection - index);

        if (distance === 0) {
            return {
                scale: 1,
                backgroundColor: '#f5a81c'
            };
        }

        const scale = Math.max(1 - distance * 0.2, 0.3);
        const opacity = Math.max(1 - distance * 0.25, 0.2);

        return {
            scale: scale,
            backgroundColor: `rgba(255, 255, 255, ${opacity})`
        };
    };
    
    return (
        <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 mr-1">
            <ul className="flex flex-col items-center justify-center p-0 space-y-2">
                {sections.map((section, index) => {
                    const bubbleStyle = getBubbleStyle(index);
                    
                    return (
                        <li key={index} className="relative group">
                            <button
                                onClick={() => scrollToSection(index)}
                                className="w-3 h-3 rounded-full flex items-center justify-center"
                            >
                                <motion.div 
                                    className="w-full h-full rounded-full"
                                    animate={bubbleStyle}
                                    whileHover={{ 
                                        scale: activeSection === index ? 1 : bubbleStyle.scale * 1.2
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                />
                            </button>
                            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-900/80 text-white text-xs rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap origin-right">
                                {section}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SectionIndicator;
