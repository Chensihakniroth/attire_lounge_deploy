import React from 'react';
import { LumaSpin } from "../ui/luma-spin";

const AdminLoadingSpinner = () => {
    return (
        <div className="flex-1 w-full h-full min-h-[100vh] bg-background flex flex-col items-center justify-center space-y-12 transition-colors duration-500 overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* The Loader Component */}
            <div className="relative z-10 flex flex-col items-center space-y-8 animate-fade-in">
                <LumaSpin size="xl" className="opacity-90 drop-shadow-sm" />
                
                <div className="flex flex-col items-center space-y-2 text-center pointer-events-none">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#0d3542] dark:text-[#58a6ff] opacity-80 animate-pulse">
                        Initializing Admin Suite
                    </p>
                    <div className="flex items-center space-y-0.5">
                        <span className="h-[1px] w-4 bg-gray-300 dark:bg-gray-700 mx-2" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">
                            Sovereign Sync Active
                        </p>
                        <span className="h-[1px] w-4 bg-gray-300 dark:bg-gray-700 mx-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoadingSpinner;
