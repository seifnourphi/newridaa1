'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface Slide {
  id: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  image: string;
  link?: string;
  buttonText?: string;
  buttonTextAr?: string;
}

export function HeroSlider() {
  const { language, isRTL } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default slides for demo
  const defaultSlides: Slide[] = [
    {
      id: '1',
      title: 'New Collection 2024',
      titleAr: 'مجموعة جديدة 2024',
      subtitle: 'Discover our latest Islamic fashion collection',
      subtitleAr: 'اكتشف مجموعتنا الجديدة من الأزياء الإسلامية',
      image: '/images/hero-1.jpg',
      link: '/products',
      buttonText: 'Shop Now',
      buttonTextAr: 'تسوق الآن',
    },
    {
      id: '2',
      title: 'Premium Djellabas',
      titleAr: 'جلابيات فاخرة',
      subtitle: 'Authentic Moroccan style with modern comfort',
      subtitleAr: 'أسلوب مغربي أصيل مع الراحة العصرية',
      image: '/images/hero-2.jpg',
      link: '/categories/djellaba',
      buttonText: 'Explore',
      buttonTextAr: 'استكشف',
    },
    {
      id: '3',
      title: '20% OFF Everything',
      titleAr: 'خصم 20% على كل شيء',
      subtitle: 'Limited time offer on all products',
      subtitleAr: 'عرض محدود الوقت على جميع المنتجات',
      image: '/images/hero-3.jpg',
      link: '/products?sale=true',
      buttonText: 'Get Discount',
      buttonTextAr: 'احصل على الخصم',
    },
  ];

  useEffect(() => {
    // Fetch slides from API
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/slides');
        if (response.ok) {
          const data = await response.json();
          setSlides(data.slides?.length > 0 ? data.slides : defaultSlides);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        setSlides(defaultSlides);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="relative h-64 md:h-80 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-64 md:h-80 overflow-hidden bg-gray-900">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30">
              <div className="w-full h-full bg-gradient-to-br from-primary-600/20 to-secondary-600/20 flex items-center justify-center">
                <div className="text-8xl opacity-20">👘</div>
              </div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                    {language === 'ar' ? slide.titleAr : slide.title}
                  </h1>
                  {(slide.subtitle || slide.subtitleAr) && (
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
                      {language === 'ar' ? slide.subtitleAr : slide.subtitle}
                    </p>
                  )}
                  {slide.link && (
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 animate-slide-up"
                    >
                      {language === 'ar' ? slide.buttonTextAr : slide.buttonText}
                      {isRTL ? (
                        <ChevronLeft className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Sale Badge */}
      {(currentSlideData.titleAr.includes('خصم') || currentSlideData.title.includes('OFF')) && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-bounce-gentle">
          {language === 'ar' ? '🔥 عرض خاص' : '🔥 Special Offer'}
        </div>
      )}
    </div>
  );
}
