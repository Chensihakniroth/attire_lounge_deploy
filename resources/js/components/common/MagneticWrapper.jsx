import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const MagneticWrapper = ({
    children,
    className = '',
    strength = 0.5, // 0 to 1, how strongly it pulls
    springConfig = { stiffness: 150, damping: 15, mass: 0.1 },
}) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Spring values for x and y translation
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { height, width, left, top } =
            ref.current.getBoundingClientRect();

        // Calculate distance from center of the element
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        // Apply magnetic pull strength
        x.set(middleX * strength);
        y.set(middleY * strength);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            animate={{ x: 0, y: 0 }} // Base state
            style={{ x, y }} // Animated state driven by springs
            className={`cursor-pointer inline-flex relative ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default MagneticWrapper;
