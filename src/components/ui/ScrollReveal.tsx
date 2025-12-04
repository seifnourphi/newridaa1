'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  popup?: boolean; // Add popup effect (scale + translateY)
  scale?: number; // Initial scale for popup effect
}

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0,
  duration = 600,
  distance = 50,
  className = '',
  popup = false,
  scale = 0.85
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      const translate = (() => {
        switch (direction) {
          case 'up':
            return `translateY(${distance}px)`;
          case 'down':
            return `translateY(-${distance}px)`;
          case 'left':
            return `translateX(${distance}px)`;
          case 'right':
            return `translateX(-${distance}px)`;
          default:
            return `translateY(${distance}px)`;
        }
      })();
      
      // Add popup effect (scale)
      if (popup) {
        return `${translate} scale(${scale})`;
      }
      
      return translate;
    }
    
    // When visible, return to normal position with scale 1 if popup
    if (popup) {
      return 'translateY(0) translateX(0) scale(1)';
    }
    
    return 'translateY(0) translateX(0)';
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'ease-out'
      }}
    >
      {children}
    </div>
  );
}
