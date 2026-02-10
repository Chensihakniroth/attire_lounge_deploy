/**
 * Wraps a value between a min and max range.
 * 
 * @param {number} min 
 * @param {number} max 
 * @param {number} v 
 * @returns {number}
 */
export const wrap = (min, max, v) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};
