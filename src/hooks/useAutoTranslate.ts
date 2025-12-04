'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleTranslateService, LANGUAGE_CODES, SupportedLanguage } from '@/lib/translate';

interface UseAutoTranslateOptions {
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  enabled?: boolean;
  cache?: boolean;
}

interface TranslationCache {
  [key: string]: string;
}

export function useAutoTranslate({
  apiKey,
  sourceLanguage,
  targetLanguage,
  enabled = true,
  cache: enableCache = true
}: UseAutoTranslateOptions) {
  const [translateService] = useState(() => new GoogleTranslateService(apiKey));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<TranslationCache>({});

  // Load cache from localStorage
  useEffect(() => {
    if (enableCache && typeof window !== 'undefined') {
      const savedCache = localStorage.getItem(`translate_cache_${sourceLanguage}_${targetLanguage}`);
      if (savedCache) {
        try {
          setCache(JSON.parse(savedCache));
        } catch (e) {
          console.warn('Failed to load translation cache');
        }
      }
    }
  }, [sourceLanguage, targetLanguage, enableCache]);

  // Save cache to localStorage
  const saveCache = useCallback((newCache: TranslationCache) => {
    if (enableCache && typeof window !== 'undefined') {
      localStorage.setItem(`translate_cache_${sourceLanguage}_${targetLanguage}`, JSON.stringify(newCache));
    }
  }, [sourceLanguage, targetLanguage, enableCache]);

  // Translate single text
  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!enabled || !text.trim()) return text;

    // Check cache first
    const cacheKey = `${sourceLanguage}_${targetLanguage}_${text}`;
    if (enableCache && cache[cacheKey]) {
      return cache[cacheKey];
    }

    setIsLoading(true);
    setError(null);

    try {
      const translatedText = await translateService.translateText(
        text,
        LANGUAGE_CODES[targetLanguage as SupportedLanguage] || targetLanguage,
        LANGUAGE_CODES[sourceLanguage as SupportedLanguage] || sourceLanguage
      );

      // Update cache
      if (enableCache) {
        const newCache = { ...cache, [cacheKey]: translatedText };
        setCache(newCache);
        saveCache(newCache);
      }

      return translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      return text; // Return original text on error
    } finally {
      setIsLoading(false);
    }
  }, [enabled, sourceLanguage, targetLanguage, enableCache, cache, translateService, saveCache]);

  // Translate multiple texts
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    if (!enabled || texts.length === 0) return texts;

    setIsLoading(true);
    setError(null);

    try {
      const translatedTexts = await translateService.translateBatch(
        texts,
        LANGUAGE_CODES[targetLanguage as SupportedLanguage] || targetLanguage,
        LANGUAGE_CODES[sourceLanguage as SupportedLanguage] || sourceLanguage
      );

      // Update cache
      if (enableCache) {
        const newCache = { ...cache };
        texts.forEach((text, index) => {
          const cacheKey = `${sourceLanguage}_${targetLanguage}_${text}`;
          newCache[cacheKey] = translatedTexts[index];
        });
        setCache(newCache);
        saveCache(newCache);
      }

      return translatedTexts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch translation failed';
      setError(errorMessage);
      console.error('Batch translation error:', err);
      return texts; // Return original texts on error
    } finally {
      setIsLoading(false);
    }
  }, [enabled, sourceLanguage, targetLanguage, enableCache, cache, translateService, saveCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({});
    if (enableCache && typeof window !== 'undefined') {
      localStorage.removeItem(`translate_cache_${sourceLanguage}_${targetLanguage}`);
    }
  }, [sourceLanguage, targetLanguage, enableCache]);

  // Get supported languages
  const getSupportedLanguages = useCallback(async () => {
    try {
      return await translateService.getSupportedLanguages();
    } catch (err) {
      console.error('Failed to get supported languages:', err);
      return [];
    }
  }, [translateService]);

  return {
    translateText,
    translateBatch,
    clearCache,
    getSupportedLanguages,
    isLoading,
    error,
    cache: cache
  };
}
