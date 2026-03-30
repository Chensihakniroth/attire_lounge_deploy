import React from 'react';

const Skeleton = ({ className = '' }) => (
    <>
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes pulse-gentle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
            .animate-pulse-gentle {
                animation: pulse-gentle 2s ease-in-out infinite;
            }
        `}} />
        <div 
            className={`bg-white/5 rounded-xl animate-pulse-gentle ${className}`}
            style={{
                willChange: 'opacity'
            }}
        />
    </>
);

export default Skeleton;
