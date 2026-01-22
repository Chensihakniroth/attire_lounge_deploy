import React from 'react';
import { motion } from 'framer-motion';

const SectionIndicator = ({ sections, activeSection, scrollToSection, isMenuOpen }) => {
    if (isMenuOpen) {
        return null;
    }
    
    return (
        <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 mr-2">
            <ul className="flex flex-col items-center justify-center p-0 space-y-3">
                {sections.map((section, index) => (
                    <li key={index} className="relative group">
                        <button
                            onClick={() => scrollToSection(index)}
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                        >
                            <motion.div 
                                className="w-full h-full rounded-full"
                                animate={{ 
                                    scale: activeSection === index ? 1 : 0.5,
                                    backgroundColor: activeSection === index ? '#f5a81c' : 'rgba(255, 255, 255, 0.5)'
                                }}
                                whileHover={{ scale: activeSection === index ? 1 : 0.75 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                            />
                        </button>
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-900/80 text-white text-xs rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap origin-right">
                            {section}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SectionIndicator;
