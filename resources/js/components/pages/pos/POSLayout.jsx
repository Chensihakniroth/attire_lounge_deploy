import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { POSProvider } from './POSContext';
import POSHeader from './POSHeader';
import { useTheme } from '../admin/ThemeContext';

const POSLayout = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <POSProvider>
            <div className={`h-screen w-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-background text-gray-900'}`}>
                {/* Scoped Reset for Full Screen */}
                <style dangerouslySetInnerHTML={{ __html: `
                    html, body, #app { height: 100% !important; width: 100% !important; overflow: hidden !important; margin: 0; padding: 0; }
                `}} />
                
                {/* Background Decoration */}
                <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full" />
                </div>

                {/* POS Header */}
                <POSHeader />

                {/* Main Content Area */}
                <main className="flex-1 flex overflow-hidden relative z-10 transition-all duration-500">
                    <Outlet />
                </main>
            </div>
        </POSProvider>
    );
};

export default POSLayout;
