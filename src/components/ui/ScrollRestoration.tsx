'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Restore scroll position on page load
    const savedScrollPosition = sessionStorage.getItem(`scrollPosition-${pathname}`);
    if (savedScrollPosition !== null) {
      const scrollY = parseInt(savedScrollPosition, 10);
      
      // Wait for page to fully load before restoring scroll
      const restoreScroll = () => {
        // Try multiple times to ensure DOM is ready
        const attempts = [0, 100, 300, 500, 1000];
        
        attempts.forEach((delay) => {
          setTimeout(() => {
            if (document.readyState === 'complete') {
              window.scrollTo({
                top: scrollY,
                behavior: 'auto' // Instant scroll, not smooth
              });
            }
          }, delay);
        });
      };

      // If page is already loaded, restore immediately
      if (document.readyState === 'complete') {
        restoreScroll();
      } else {
        // Wait for page to load
        window.addEventListener('load', restoreScroll, { once: true });
        // Also try after a short delay
        restoreScroll();
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Save scroll position before page unload/refresh
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY.toString());
    };

    // Save on scroll with throttling to avoid too many writes
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY.toString());
      }, 100); // Throttle to every 100ms
    };

    // Save on visibility change (when user switches tabs or refreshes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(scrollTimeout);
    };
  }, [pathname]);

  return null;
}

