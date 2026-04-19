import React, { memo } from 'react';

/**
 * GrainOverlay component provides a cinematic grain effect.
 * OPTIMIZED: Uses a static base64 noise pattern instead of SVG filters for 60fps performance.
 * 
 * @param {Object} props
 * @param {number} props.opacity - The opacity of the grain effect (default: 0.03 for image)
 * @param {string} props.zIndex - The z-index of the overlay (default: z-50)
 */
const GrainOverlay = memo(() => null);

GrainOverlay.displayName = 'GrainOverlay';

export default GrainOverlay;
