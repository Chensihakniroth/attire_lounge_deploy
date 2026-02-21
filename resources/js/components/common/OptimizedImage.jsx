import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    containerClassName = '', 
    objectFit = 'cover',
    skeletonClassName = '',
    bgClassName = 'bg-white/[0.02]',
    priority = false,
    fallback = null,
    style = {},
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // If image is already complete (cached), set loaded immediately
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
            return;
        }

        setIsLoaded(false);
        setError(false);
    }, [src]);

    const handleError = () => {
        if (fallback && !error) {
            // Try fallback once
            setError(true);
            // We don't set isLoaded to true here yet, 
            // the fallback image will trigger onLoad or another onError
        } else {
            setError(true);
            setIsLoaded(true);
        }
    };

    return (
        <div 
            className={`relative ${containerClassName} ${objectFit === 'contain' ? 'flex items-center justify-center' : 'overflow-hidden'} ${bgClassName}`} 
            style={style}
        >
            {!isLoaded && (!error || (error && fallback)) && (
                <Skeleton className={`absolute inset-0 z-10 w-full h-full rounded-none ${skeletonClassName}`} />
            )}
            
            <img
                ref={imgRef}
                src={error && fallback ? fallback : src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
                loading={priority ? "eager" : "lazy"}
                fetchpriority={priority ? "high" : "auto"}
                className={`transition-opacity duration-700 ease-in-out will-change-[opacity] ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                } ${
                    objectFit === 'contain' 
                        ? 'max-w-full max-h-full w-auto h-auto object-contain' 
                        : 'w-full h-full object-cover'
                } ${className}`}
                style={{ 
                    objectFit,
                    // Prevent upscaling beyond natural resolution for "original resolution" feel
                    maxWidth: objectFit === 'contain' ? '100%' : 'none',
                    maxHeight: objectFit === 'contain' ? '100%' : 'none'
                }}
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
