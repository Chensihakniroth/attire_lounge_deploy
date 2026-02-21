import React, { memo } from 'react';

/**
 * GrainOverlay component provides a cinematic grain effect across the viewport.
 * It's used to add texture and a high-end feel to the UI.
 * 
 * @param {Object} props
 * @param {number} props.opacity - The opacity of the grain effect (default: 0.015)
 * @param {string} props.zIndex - The z-index of the overlay (default: z-50)
 */
const GrainOverlay = memo(({ opacity = 0.015, zIndex = 'z-50' }) => (
  <div 
    className={`fixed inset-0 pointer-events-none ${zIndex} mix-blend-overlay`}
    style={{ opacity }}
  >
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
    </svg>
  </div>
));

GrainOverlay.displayName = 'GrainOverlay';

export default GrainOverlay;
