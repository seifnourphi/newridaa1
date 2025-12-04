'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!mounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-[#DAA520] hover:bg-[#C4941F] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Back to top"
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

