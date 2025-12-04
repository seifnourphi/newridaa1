'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
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

interface ModernHeroProps {
  products: Product[];
}

export function ModernHero({ products }: ModernHeroProps) {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Get featured products for hero
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 3);

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

  // Rotate featured products
  useEffect(() => {
    if (featuredProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentProduct((prev) => (prev + 1) % featuredProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  const handleAddToCart = (product: Product) => {
    // Try to add directly to cart
    if (product.stockQuantity > 0) {
      const imageUrl = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : '';
      const displayPrice = product.originalPrice && product.originalPrice > product.price 
        ? product.price 
        : product.price;
      
      const result = addToCart({
        name: product.name,
        nameAr: product.name,
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
      return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
    } else if (name.includes('jeans')) {
      return 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
    } else if (name.includes('dress')) {
      return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
    } else if (name.includes('suit')) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
    } else if (name.includes('jacket')) {
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80';
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Block - Text Content */}
          <div 
            className={`space-y-8 transition-all duration-1000 ease-out ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform -translate-x-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'منتجات مميزة' : 'Featured Products'}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {language === 'ar' ? (
                  <>
                    اكتشف <span className="text-purple-600">أحدث</span><br />
                    صيحات الموضة
                  </>
                ) : (
                  <>
                    Discover <span className="text-purple-600">Latest</span><br />
                    Fashion Trends
                  </>
                )}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {language === 'ar' 
                  ? 'مجموعة متنوعة من الأزياء العصرية والأنيقة التي تناسب جميع المناسبات. جودة عالية وتصميم مميز.'
                  : 'A diverse collection of modern and elegant fashion that suits all occasions. High quality and distinctive design.'
                }
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-3">
                {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3">
                {language === 'ar' ? 'استكشف المجموعة' : 'Explore Collection'}
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#DAA520]">500+</div>
                <div className="text-sm text-gray-600">{language === 'ar' ? 'منتج' : 'Products'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#DAA520]">10K+</div>
                <div className="text-sm text-gray-600">{language === 'ar' ? 'عميل سعيد' : 'Happy Customers'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#DAA520]">4.9</div>
                <div className="text-sm text-gray-600">{language === 'ar' ? 'تقييم' : 'Rating'}</div>
              </div>
            </div>
          </div>

          {/* Right Block - Product Showcase */}
          <div 
            className={`relative transition-all duration-1000 ease-out ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-12'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {featuredProducts.length > 0 && (
              <div className="relative">
                {/* Main Product Image */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group">
                  <div className="aspect-square relative">
                    <img
                      src={featuredProducts[currentProduct]?.images[0] || getDefaultImage(featuredProducts[currentProduct]?.name || '')}
                      alt={featuredProducts[currentProduct]?.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Second Image (on hover) - fade effect */}
                    {featuredProducts[currentProduct]?.images && featuredProducts[currentProduct].images.length > 1 && (() => {
                      const secondImageObj = featuredProducts[currentProduct].images[1] as any;
                      const secondImage = typeof secondImageObj === 'string' 
                        ? secondImageObj 
                        : (secondImageObj?.url || featuredProducts[currentProduct].images[0] || getDefaultImage(featuredProducts[currentProduct]?.name || ''));
                      return (
                        <img
                          src={secondImage}
                          alt={`${featuredProducts[currentProduct]?.name} - View 2`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
                          onError={(e) => {
                            // If second image fails, hide it
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      );
                    })()}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Product Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {featuredProducts[currentProduct]?.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#DAA520]">
                            {language === 'ar' 
                              ? `ج.م ${featuredProducts[currentProduct]?.price.toLocaleString('en-US')}`
                              : `EGP ${featuredProducts[currentProduct]?.price.toLocaleString('en-US')}`
                            }
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleAddToCart(featuredProducts[currentProduct])}
                        className="bg-white text-gray-900 p-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Product Cards */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={featuredProducts[1]?.images[0] || getDefaultImage(featuredProducts[1]?.name || '')}
                      alt={featuredProducts[1]?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={featuredProducts[2]?.images[0] || getDefaultImage(featuredProducts[2]?.name || '')}
                      alt={featuredProducts[2]?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
