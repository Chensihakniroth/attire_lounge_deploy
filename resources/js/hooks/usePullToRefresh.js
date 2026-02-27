import { useEffect, useRef } from 'react';

const usePullToRefresh = (callback, threshold = 100) => {
  const initialTouchY = useRef(0);
  const currentTouchY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const getScrollPosition = () => {
      // Use Lenis scroll if available and active, otherwise fallback to native scroll
      if (window.lenis && !window.lenis.isStopped) {
        return window.lenis.scroll;
      }
      return window.scrollY;
    };

    const handleTouchStart = (e) => {
      initialTouchY.current = e.touches[0].clientY;
      pulling.current = false;
    };

    const handleTouchMove = (e) => {
      currentTouchY.current = e.touches[0].clientY;
      const pullDelta = currentTouchY.current - initialTouchY.current;

      // Determine if we can pull: 
      // 1. Global scroll must be at top
      // 2. No parent container of the touch target should be scrolled down
      let canPull = getScrollPosition() <= 5;
      
      if (canPull && pullDelta > 0) {
        let el = e.target;
        while (el && el !== document.body) {
          if (el.scrollTop > 5) {
            canPull = false;
            break;
          }
          el = el.parentElement;
        }
      }

      if (canPull && pullDelta > 0) {
        e.preventDefault(); // Prevent native scroll
        pulling.current = true;
      } else {
        pulling.current = false;
      }
    };

    const handleTouchEnd = () => {
      if (pulling.current && getScrollPosition() <= 5 && (currentTouchY.current - initialTouchY.current) > threshold) {
        callback();
      }
      pulling.current = false;
    };

    // Attach to document.body to capture touches over entire content
    document.body.addEventListener('touchstart', handleTouchStart);
    document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.body.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchmove', handleTouchMove);
      document.body.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callback, threshold]);
};

export default usePullToRefresh;
