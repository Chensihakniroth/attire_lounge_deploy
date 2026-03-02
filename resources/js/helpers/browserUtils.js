// resources/js/helpers/browserUtils.js

/**
 * Checks if the current browser is Safari.
 * This is useful for applying browser-specific styles or logic.
 * @returns {boolean} - True if the browser is Safari, false otherwise.
 */
export const isSafari = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};
