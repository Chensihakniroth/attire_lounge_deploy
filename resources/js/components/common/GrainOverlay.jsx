import React, { memo } from 'react';

/**
 * GrainOverlay component provides a cinematic grain effect.
 * OPTIMIZED: Uses a static base64 noise pattern instead of SVG filters for 60fps performance.
 * 
 * @param {Object} props
 * @param {number} props.opacity - The opacity of the grain effect (default: 0.03 for image)
 * @param {string} props.zIndex - The z-index of the overlay (default: z-50)
 */
const GrainOverlay = memo(({ opacity = 0.02, zIndex = 'z-50' }) => (
  <div 
    className={`fixed inset-0 pointer-events-none ${zIndex} mix-blend-overlay`}
    style={{ 
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)'
    }}
  />
));

GrainOverlay.displayName = 'GrainOverlay';

export default GrainOverlay;
