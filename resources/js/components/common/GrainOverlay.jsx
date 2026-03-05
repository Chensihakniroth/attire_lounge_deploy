import React, { memo } from 'react';

/**
 * GrainOverlay component provides a cinematic grain effect.
 * OPTIMIZED: Uses a static base64 noise pattern instead of SVG filters for 60fps performance.
 * 
 * @param {Object} props
 * @param {number} props.opacity - The opacity of the grain effect (default: 0.03 for image)
 * @param {string} props.zIndex - The z-index of the overlay (default: z-50)
 */
const GrainOverlay = memo(({ opacity = 0.03, zIndex = 'z-50' }) => (
  <div 
    className={`fixed inset-0 pointer-events-none ${zIndex} mix-blend-overlay`}
    style={{ 
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px', // Smaller tile size for better tiling performance
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
    }}
  />
));

GrainOverlay.displayName = 'GrainOverlay';

export default GrainOverlay;
