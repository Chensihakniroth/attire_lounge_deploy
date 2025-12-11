import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-attire-light border-t-attire-accent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
