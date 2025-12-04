'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageToggle() {
  const { 
    language, 
    setLanguage, 
    isTranslating
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-gray-700/30 text-white transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium" suppressHydrationWarning>
          {mounted ? currentLanguage.label : 'العربية'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                language === lang.code
                  ? 'bg-[#DAA520]/10 text-[#DAA520] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
