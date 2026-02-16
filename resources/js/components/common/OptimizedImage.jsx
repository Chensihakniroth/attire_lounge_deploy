import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    containerClassName = '', 
    objectFit = 'cover',
    skeletonClassName = '',
    style = {},
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        setIsLoaded(false);
        setError(false);
        
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
        }
    }, [src]);

    return (
        <div 
            className={`relative ${containerClassName} ${objectFit === 'contain' ? 'flex items-center justify-center' : 'overflow-hidden'}`} 
            style={style}
        >
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
                className={`transition-opacity duration-500 ease-in-out ${
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
