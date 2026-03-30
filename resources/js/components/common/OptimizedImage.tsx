import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    skeletonClassName?: string;
    bgClassName?: string;
    priority?: boolean;
    fallback?: string | null;
    style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
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
    const imgRef = useRef<HTMLImageElement>(null);

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
                <Skeleton
                    className={`absolute inset-0 z-10 w-full h-full rounded-none ${skeletonClassName}`}
                />
            )}

            <img
                ref={imgRef}
                src={error && fallback ? (fallback as string) : src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                className={`transition-all duration-[400ms] ease-out ${
                    isLoaded
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-[1.02]'
                } ${
                    objectFit === 'contain'
                        ? 'max-w-full max-h-full w-auto h-auto object-contain'
                        : 'w-full h-full object-cover'
                } ${className}`}
                style={{
                    objectFit,
                    maxWidth: objectFit === 'contain' ? '100%' : 'none',
                    maxHeight: objectFit === 'contain' ? '100%' : 'none',
                    willChange: isLoaded ? 'auto' : 'transform, opacity',
                    ...style,
                }}
                {...props}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-attire-silver/20">
                    <span className="text-[10px] uppercase tracking-widest">
                        Image not available
                    </span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
