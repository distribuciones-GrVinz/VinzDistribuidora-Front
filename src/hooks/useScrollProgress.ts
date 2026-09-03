import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const calculateProgress = () => {
      const scrollTotal = el.scrollHeight - el.clientHeight;
      if (scrollTotal > 0) {
        setCanScroll(true);
        // Add a small epsilon to handle float rounding errors near the bottom
        const scrolled = (el.scrollTop / scrollTotal) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      } else {
        setCanScroll(false);
        setProgress(100);
      }
    };

    // Calculate initially
    calculateProgress();

    // Calculate on scroll
    el.addEventListener('scroll', calculateProgress, { passive: true });

    // Calculate on resize (window or element)
    window.addEventListener('resize', calculateProgress);
    
    // Also use ResizeObserver to catch content size changes (e.g. accordions opening)
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        calculateProgress();
      });
      // Observe both the container and its first child (which usually contains the content)
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    return () => {
      el.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [ref]);

  return { progress, canScroll };
}
