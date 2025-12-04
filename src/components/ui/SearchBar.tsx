'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="search-query"
                name="search"
                ref={inputRef}
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Suggestions */}
          {(suggestions.length > 0 || isLoading) && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                اقتراحات البحث
              </h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                    <span>جاري البحث...</span>
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-right p-2 hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              عمليات بحث شائعة
            </h3>
            <div className="flex flex-wrap gap-2">
              {['جلابية', 'ثوب', 'عباءة', 'ملابس رجالي', 'ملابس نسائي'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(term)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
