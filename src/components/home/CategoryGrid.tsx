'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  productCount?: number;
}

export function CategoryGrid() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default categories for demo
  const defaultCategories: Category[] = [
    {
      id: '1',
      name: 'Djellaba',
      nameAr: 'جلابية',
      slug: 'djellaba',
      description: 'Traditional Moroccan robes',
      descriptionAr: 'الجلابيات المغربية التقليدية',
      image: '/images/category-djellaba.jpg',
      productCount: 25,
    },
    {
      id: '2',
      name: 'Thobe',
      nameAr: 'ثوب',
      slug: 'thobe',
      description: 'Classic Islamic garments',
      descriptionAr: 'الأثواب الإسلامية الكلاسيكية',
      image: '/images/category-thobe.jpg',
      productCount: 18,
    },
    {
      id: '3',
      name: 'Abaya',
      nameAr: 'عباءة',
      slug: 'abaya',
      description: 'Elegant women\'s wear',
      descriptionAr: 'ملابس نسائية أنيقة',
      image: '/images/category-abaya.jpg',
      productCount: 32,
    },
    {
      id: '4',
      name: 'Accessories',
      nameAr: 'إكسسوارات',
      slug: 'accessories',
      description: 'Complete your look',
      descriptionAr: 'أكمل إطلالتك',
      image: '/images/category-accessories.jpg',
      productCount: 15,
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories?.length > 0 ? data.categories : defaultCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
          {/* Image */}
          <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative overflow-hidden">
            {/* Placeholder icon based on category */}
            <div className="text-6xl opacity-60">
              {category.slug === 'djellaba' && '👘'}
              {category.slug === 'thobe' && '🥋'}
              {category.slug === 'abaya' && '👗'}
              {category.slug === 'accessories' && '👑'}
              {!['djellaba', 'thobe', 'abaya', 'accessories'].includes(category.slug) && '👔'}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {language === 'ar' ? category.descriptionAr : category.description}
            </p>
            
            {/* Product Count */}
            {category.productCount && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {category.productCount} منتج
                </span>
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <svg
                    className="w-3 h-3 text-primary-600 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-300 rounded-lg transition-colors duration-300" />
        </Link>
      ))}
    </div>
  );
}
