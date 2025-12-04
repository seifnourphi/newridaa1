'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Plus } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Product {
  id: number;
  name: string;
  nameAr?: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  stockQuantity: number;
  category: {
    id: number;
    name: string;
  };
  rating?: number;
  reviewCount?: number;
}

interface NewHeroStyleProps {
  products: Product[];
}

export function NewHeroStyle({ products }: NewHeroStyleProps) {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentAdSlide, setCurrentAdSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Get featured products for hero
  const featuredProducts = products.filter(product => product.isFeatured || product.isNew).slice(0, 4);
  
  // Main promotional images for fade carousel
  const mainPromotionalImages = [
    {
      id: 1,
      title: language === 'ar' ? 'عروض الشتاء' : 'Winter Sale',
      subtitle: language === 'ar' ? 'خصم حتى 50% على جميع المنتجات' : 'Up to 50% Off on All Products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
      badge: language === 'ar' ? 'خصم' : 'Sale',
      buttonText: language === 'ar' ? 'تسوق الآن' : 'Shop Now'
    },
    {
      id: 2,
      title: language === 'ar' ? 'مجموعة الصيف الجديدة' : 'New Summer Collection',
      subtitle: language === 'ar' ? 'أحدث صيحات الموضة للصيف' : 'Latest Summer Fashion Trends',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80',
      badge: language === 'ar' ? 'جديد' : 'New',
      buttonText: language === 'ar' ? 'اكتشف المجموعة' : 'Explore Collection'
    }
  ];

  // Auto-slide functionality for products
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  // Auto-slide functionality for promotional images (3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdSlide((prev) => (prev + 1) % mainPromotionalImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [mainPromotionalImages.length]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (product: Product) => {
    // Check if product has variants (assuming variants might be in a different format)
    // For now, try to add directly to cart
    if (product.stockQuantity > 0) {
      const imageUrl = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : '';
      const displayPrice = product.originalPrice && product.originalPrice > product.price 
        ? product.price 
        : product.price;
      
      const result = addToCart({
        name: language === 'ar' ? product.nameAr || product.name : product.name,
        nameAr: product.nameAr || product.name,
        productId: product.id.toString(),
        price: displayPrice,
        image: imageUrl,
        quantity: 1,
        stockQuantity: product.stockQuantity,
      });
      
      if (result.success) {
        showToast(
          language === 'ar' ? 'تم إضافة المنتج للسلة!' : 'Product added to cart!',
          'success',
          3000
        );
      } else if (result.message) {
        showToast(
          result.message,
          'error',
          3000
        );
      }
    } else {
      showToast(
        language === 'ar' ? 'المنتج غير متوفر في المخزون' : 'Product is out of stock',
        'error',
        3000
      );
    }
  };

  const getDefaultImage = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('shirt') || name.includes('t-shirt')) {
      return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
    } else if (name.includes('jeans')) {
      return 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
    } else if (name.includes('dress')) {
      return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
    } else if (name.includes('suit')) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
    } else if (name.includes('jacket')) {
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80';
  };

  return (
    <section 
      ref={heroRef}
      className="relative py-20 bg-white overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Block - Promotional Banner */}
          <div 
            className={`space-y-8 transition-all duration-1000 ease-out ${
              isVisible 
                ? 'opacity-100 transform translate-y-0 translate-x-0' 
                : 'opacity-0 transform translate-y-12 -translate-x-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {language === 'ar' ? (
                  <>
                    اكتشف <span className="text-purple-600">أحدث</span><br />
                    مجموعتنا
                  </>
                ) : (
                  <>
                    Discover Our <span className="text-purple-600">Latest</span><br />
                    Collection
                  </>
                )}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {language === 'ar' 
                  ? 'اكتشف أحدث صيحات الموضة العربية الأصيلة والأنيقة. مجموعة متنوعة من الأزياء التقليدية والحديثة تناسب جميع المناسبات.'
                  : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget tortor risus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.'
                }
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="group bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-3">
                {language === 'ar' ? 'تسوق الوافدات الجديدة' : 'Shop New Arrivals'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Main Promotional Banner with Fade Carousel */}
            <div className="mt-8">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Fade Carousel Container */}
                <div className="relative aspect-[3/1] overflow-hidden">
                  {mainPromotionalImages.map((promo, index) => (
                    <div
                      key={promo.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        currentAdSlide === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {/* Background Image */}
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="max-w-2xl px-8 text-white">
                          {/* Badge */}
                          <div className="mb-4">
                            <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                              {promo.badge}
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            {promo.title}
                          </h3>
                          
                          {/* Subtitle */}
                          <p className="text-xl mb-6 opacity-90">
                            {promo.subtitle}
                          </p>
                          
                          {/* CTA Button */}
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                            {promo.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Navigation Dots */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {mainPromotionalImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAdSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentAdSlide === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block - Product Grid/Carousel */}
          <div 
            className={`relative transition-all duration-1000 ease-out ${
              isVisible 
                ? 'opacity-100 transform translate-y-0 translate-x-0' 
                : 'opacity-0 transform translate-y-12 translate-x-12'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="relative">
              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-6">
                {featuredProducts.slice(0, 4).map((product, index) => {
                  const isHovered = hoveredProduct === product.id;
                  return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl overflow-hidden transition-all duration-500 cursor-pointer border border-gray-100 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${600 + (index * 200)}ms`,
                      transform: isVisible 
                        ? (isHovered ? 'translateY(-12px)' : 'translateY(0)')
                        : 'translateY(32px)',
                      boxShadow: isHovered 
                        ? '0 25px 50px -10px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.15)'
                        : '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={product.images[0] || getDefaultImage(product.name)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out"
                        style={{ transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}
                      />
                      
                      {/* Enhanced Overlay on hover */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent transition-all duration-500"
                        style={{ opacity: isHovered ? 1 : 0 }}
                      />
                      
                      {/* Animated shimmer effect */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none transition-transform duration-1000 ease-in-out"
                        style={{ transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)' }}
                      />
                      
                      {/* Product Badges with enhanced animations */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.isNew && (
                          <span 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl transition-all duration-300"
                            style={{ 
                              transform: isHovered ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)'
                            }}
                          >
                            {language === 'ar' ? 'جديد' : 'New'}
                          </span>
                        )}
                        {product.isBestseller && (
                          <span 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl transition-all duration-300"
                            style={{ 
                              transform: isHovered ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)'
                            }}
                          >
                            {language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button - appears on hover with enhanced effects */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-all duration-300 z-20"
                        style={{ opacity: isHovered ? 1 : 0 }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 border-2 border-white/50 backdrop-blur-md"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>{language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Info with enhanced hover effects */}
                    <div 
                      className="p-5 transition-all duration-500"
                      style={{ 
                        background: isHovered 
                          ? 'linear-gradient(to bottom, rgb(250, 245, 255), rgb(255, 255, 255))'
                          : 'rgb(255, 255, 255)'
                      }}
                    >
                      <h3 
                        className="text-base font-bold mb-2 transition-colors duration-300 line-clamp-2"
                        style={{ color: isHovered ? 'rgb(147, 51, 234)' : 'rgb(17, 24, 39)' }}
                      >
                        {language === 'ar' ? (product.nameAr || product.name) : product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-xl font-bold transition-all duration-300 inline-block"
                          style={{ 
                            color: isHovered ? 'rgb(126, 34, 206)' : 'rgb(147, 51, 234)',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                          }}
                        >
                          {language === 'ar' 
                            ? `ج.م ${product.price.toLocaleString('en-US')}`
                            : `EGP ${product.price.toLocaleString('en-US')}`
                          }
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span 
                            className="text-sm line-through transition-colors duration-300"
                            style={{ color: isHovered ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
                          >
                            {language === 'ar' 
                              ? `ج.م ${product.originalPrice.toLocaleString('en-US')}`
                              : `EGP ${product.originalPrice.toLocaleString('en-US')}`
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>


              {/* Carousel Controls */}
              <div 
                className={`flex items-center justify-center mt-8 space-x-4 transition-all duration-1000 ease-out ${
                  isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-8'
                }`}
                style={{ transitionDelay: '1600ms' }}
              >
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                  className="bg-white text-gray-600 hover:text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Dots Indicator */}
                <div className="flex space-x-2">
                  {featuredProducts.slice(0, 3).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-purple-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)}
                  className="bg-white text-gray-600 hover:text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
