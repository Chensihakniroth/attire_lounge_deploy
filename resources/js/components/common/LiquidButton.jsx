import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import MagneticWrapper from './MagneticWrapper';

const LiquidButton = ({
    children,
    onClick,
    className = '',
    glowColor = 'rgba(245, 168, 28, 0.4)', // Default to attire-accent glow
    type = 'button',
    disabled = false,
}) => {
    const ref = useRef(null);

    // Motion values to track mouse X and Y accurately inside the button
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth them out with springs for that luxurious feel
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const smoothedX = useSpring(x, springConfig);
    const smoothedY = useSpring(y, springConfig);

    // Fade the inner glow in/out on hover
    const opacity = useMotionValue(0);
    const smoothedOpacity = useSpring(opacity, { damping: 15, stiffness: 100 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        // Calculate raw position of mouse relative to the button's top-left corner
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Update the motion values driving the gradient center
        x.set(relativeX);
        y.set(relativeY);
    };

    const handleMouseEnter = () => opacity.set(1);
    const handleMouseLeave = () => opacity.set(0);

    return (
        <MagneticWrapper strength={0.3}>
            {/* The main button acts as the boundary for the internal liquid glow */}
            <motion.button
                ref={ref}
                type={type}
                onClick={onClick}
                disabled={disabled}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`relative overflow-hidden inline-flex items-center justify-center transition-colors duration-300 ${className}`}
                // Scale slightly down on click for tactile physical feedback
                whileTap={{ scale: 0.96 }}
            >
                {/* The Liquid Hover Mask */}
                <motion.div
                    className="pointer-events-none absolute inset-0 z-0 opacity-0"
                    style={{
                        opacity: smoothedOpacity,
                        background: useTransform(
                            [smoothedX, smoothedY],
                            ([latestX, latestY]) =>
                                `radial-gradient(120px circle at ${latestX}px ${latestY}px, ${glowColor}, transparent 100%)`
                        ),
                    }}
                />

                {/* Button Content (must have z-10 to stay above the liquid glow) */}
                <span className="relative z-10 flex items-center gap-2 pointer-events-none">
                    {children}
                </span>
            </motion.button>
        </MagneticWrapper>
    );
};

export default LiquidButton;
