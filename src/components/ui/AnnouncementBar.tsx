'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

type Variant = 'marquee' | 'vertical';

interface AnnouncementBarProps {
  messages?: string[];
  speed?: number; // pixels per second
  closable?: boolean;
  className?: string;
  variant?: Variant;
}

export function AnnouncementBar({
  messages,
  speed = 160,
  closable = true,
  className = '',
  variant = 'marquee', // Default to horizontal marquee for continuous scrolling
}: AnnouncementBarProps) {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const animationDurationRef = useRef<number>(0);

  const items = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages;
    }
    const defaultMessages = [
      language === 'ar'
        ? '🎁 خصم 20% على أول طلب — استخدم الكود: FIRST20'
        : '🎁 20% off your first order — Use code: FIRST20',
      language === 'ar'
        ? '🚚 شحن سريع لجميع المحافظات'
        : '🚚 Fast shipping to all governorates',
      language === 'ar'
        ? '💬 تواصل معنا على واتساب لأي استفسار'
        : '💬 Contact us on WhatsApp for any questions',
    ];
    return defaultMessages;
  }, [messages, language]);

  // Always show - no close button
  // if (!visible) return null;

  // Direction RTL/LTR
  const isRTL = language === 'ar';

  // Duplicate items multiple times for seamless infinite loop - ensure continuous scrolling
  const loopItems = useMemo(() => {
    // Duplicate items 4 times to ensure smooth continuous scrolling
    return [...items, ...items, ...items, ...items];
  }, [items]);

  // Calculate track width for seamless loop - recalculate when speed changes
  useEffect(() => {
    if (variant === 'marquee' && trackRef.current) {
      const updateWidth = () => {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (trackRef.current) {
            // Force reflow to get accurate measurements
            trackRef.current.offsetWidth;
            
            // Get the actual width of one copy (scrollWidth includes all 4 copies)
            const totalWidth = trackRef.current.scrollWidth;
            const oneCopyWidth = totalWidth / 4;
            
            if (oneCopyWidth > 0) {
              setTrackWidth(oneCopyWidth);
              // Ensure content starts visible - set transform to -25% for left-to-right scrolling
              if (trackRef.current) {
                trackRef.current.style.transform = 'translateX(-25%)';
              }
            }
          }
        });
      };
      
      // Wait for DOM to render, but start immediately to show content
      const timeout = setTimeout(updateWidth, 100);
      updateWidth();
      
      // Update on window resize and speed change
      window.addEventListener('resize', updateWidth);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateWidth);
      };
    }
  }, [variant, items, messages, loopItems.length, speed]);

  // Vertical ticker timer (fade in from bottom -> stay -> fade out to top)
  useEffect(() => {
    if (variant === 'vertical' && items.length > 0) {
      // 3s per message (enter 400ms, hold 1800ms, leave 800ms)
      const enterMs = 400;
      const holdMs = 1800;
      const leaveMs = 800;
      const totalMs = enterMs + holdMs + leaveMs;
      
      const id = setInterval(() => {
        setIndex((i) => (i + 1) % items.length);
        setAnimKey((k) => k + 1);
      }, totalMs);
      
      return () => clearInterval(id);
    }
  }, [variant, items.length]);

  // Calculate animation duration for smooth continuous scrolling
  const animationDuration = useMemo(() => {
    if (trackWidth > 0) {
      // Ensure smooth continuous movement - use trackWidth divided by speed
      // The animation moves from -25% to 0, which is 1/4 of the total width (since we have 4 copies)
      // This creates a seamless loop where content scrolls from left to right continuously
      // When it reaches 0, it loops back to -25% seamlessly
      // Minimum duration to prevent too fast scrolling
      return Math.max(20, Math.round((trackWidth / speed) * 1.2));
    }
    // Fallback calculation
    return Math.max(20, Math.round(((items.length * 500) / speed) * 1.2));
  }, [trackWidth, speed, items.length]);

  return (
    <div className={`relative bg-[#DAA520] text-white select-none ${className}`} dir="ltr">
      <div className="py-1.5">
        <div className="mx-auto px-6 w-full" style={{ maxWidth: 'calc(80rem * 0.97)' }}>
          {variant === 'marquee' ? (
            <div className="slider-container relative w-full overflow-hidden" dir="ltr">
              {/* Marquee: continuous horizontal scrolling from left to right, never stops */}
              {/* Content starts visible and scrolls continuously without disappearing */}
              <div 
                ref={trackRef}
                className="marquee-track flex gap-10 items-center"
                style={{ 
                  width: trackWidth > 0 ? `${trackWidth * 4}px` : `${loopItems.length * 500}px`,
                  transform: 'translateX(-25%)', // Start from position where content is visible
                  animation: `marquee-scroll-left ${animationDuration}s linear infinite`,
                  willChange: 'transform',
                  animationFillMode: 'forwards',
                  WebkitAnimation: `marquee-scroll-left ${animationDuration}s linear infinite`,
                  MozAnimation: `marquee-scroll-left ${animationDuration}s linear infinite`,
                  OAnimation: `marquee-scroll-left ${animationDuration}s linear infinite`,
                  msAnimation: `marquee-scroll-left ${animationDuration}s linear infinite`
                } as React.CSSProperties}
              >
                {loopItems.map((text, idx) => (
                  <span 
                    key={`marquee-${idx}`} 
                    className="flex-shrink-0 text-[clamp(12px,2vw,14px)] font-semibold opacity-95 px-6 whitespace-nowrap"
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="vticker-viewport overflow-hidden relative flex items-center justify-center w-full" style={{ height: '2.1em' }}>
              <div 
                key={animKey} 
                className="vticker-item text-[clamp(12px,2vw,14px)] font-semibold px-1 text-center"
                style={{
                  animation: 'slideFade 3s ease-in-out forwards',
                  WebkitAnimation: 'slideFade 3s ease-in-out forwards',
                  MozAnimation: 'slideFade 3s ease-in-out forwards',
                  OAnimation: 'slideFade 3s ease-in-out forwards'
                }}
              >
                {items[index]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;


