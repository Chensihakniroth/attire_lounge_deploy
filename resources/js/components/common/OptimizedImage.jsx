import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    containerClassName = '', 
    objectFit = 'cover',
    skeletonClassName = '',
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setError(false);
        
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
        }
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${containerClassName} ${className}`}>
            {!isLoaded && !error && (
                <Skeleton className={`absolute inset-0 z-10 w-full h-full rounded-none ${skeletonClassName}`} />
            )}
            
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setError(true);
                    setIsLoaded(true);
                }}
                className={`w-full h-full transition-opacity duration-700 ease-in-out ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectFit }}
                {...props}
            />
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-attire-silver/20">
                    <span className="text-[10px] uppercase tracking-widest">Image not available</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
