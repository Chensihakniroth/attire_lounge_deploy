import React from 'react';
import { motion } from 'framer-motion';

const SectionIndicator = ({ sections, activeSection, scrollToSection, isMenuOpen }) => {
    if (isMenuOpen) return null;

    return (
        <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 h-[25vh] flex-col items-center justify-center">
            {/* Glass Track */}
            <div className="relative w-[1px] h-full bg-white/10 backdrop-blur-sm rounded-full overflow-visible border-0">
                {/* Active Indicator Pill */}
                <motion.div 
                    className="absolute left-[-0.5px] w-0.5 bg-attire-accent shadow-[0_0_10px_rgba(212,168,76,0.8)] rounded-full"
                    initial={false}
                    animate={{ 
                        top: `${(activeSection / (sections.length - 1)) * 100}%`,
                        y: '-50%'
                    }}
                    style={{
                        height: '10%', // Smaller pill height
                        top: 0 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            {/* Clickable Overlay & Labels */}
            <div className="absolute inset-0 flex flex-col justify-between h-full w-6 -left-3">
                {sections.map((section, index) => (
                    <div 
                        key={index} 
                        className="relative flex-1 flex items-center justify-center group cursor-pointer"
                        onClick={() => scrollToSection(index)}
                    >
                        {/* Invisible Hit Area */}
                        <div className="absolute inset-0 w-full h-full" />

                        {/* Label Tooltip */}
                        <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-2 pointer-events-none">
                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl">
                                {section}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionIndicator;
