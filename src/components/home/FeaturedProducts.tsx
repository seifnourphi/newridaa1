'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: { url: string; alt?: string; altAr?: string }[];
  category: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
  };
  variants: {
    type: 'SIZE' | 'COLOR';
    value: string;
    valueAr?: string;
  }[];
  isFeatured: boolean;
  stockQuantity: number;
}

export function FeaturedProducts() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default products for demo
  const defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Moroccan Djellaba',
      nameAr: 'جلابية مغربية فاخرة',
      slug: 'premium-moroccan-djellaba',
      sku: 'ABD-DJ-001',
      price: 299,
      salePrice: 239,
      discountPercent: 20,
      images: [
        { url: '/images/product-1.jpg', alt: 'Premium Djellaba', altAr: 'جلابية فاخرة' }
      ],
      category: {
        id: '1',
        name: 'Djellaba',
        nameAr: 'جلابية',
        slug: 'djellaba'
      },
      variants: [
        { type: 'SIZE', value: 'M', valueAr: 'وسط' },
        { type: 'SIZE', value: 'L', valueAr: 'كبير' },
        { type: 'SIZE', value: 'XL', valueAr: 'كبير جداً' },
        { type: 'COLOR', value: 'White', valueAr: 'أبيض' },
        { type: 'COLOR', value: 'Beige', valueAr: 'بيج' },
      ],
      isFeatured: true,
      stockQuantity: 15,
    },
    {
      id: '2',
      name: 'Classic White Thobe',
      nameAr: 'ثوب أبيض كلاسيكي',
      slug: 'classic-white-thobe',
      sku: 'ABD-TH-002',
      price: 199,
      images: [
        { url: '/images/product-2.jpg', alt: 'White Thobe', altAr: 'ثوب أبيض' }
      ],
      category: {
        id: '2',
        name: 'Thobe',
        nameAr: 'ثوب',
        slug: 'thobe'
      },
      variants: [
        { type: 'SIZE', value: 'S', valueAr: 'صغير' },
        { type: 'SIZE', value: 'M', valueAr: 'وسط' },
        { type: 'SIZE', value: 'L', valueAr: 'كبير' },
      ],
      isFeatured: true,
      stockQuantity: 22,
    },
    {
      id: '3',
      name: 'Elegant Black Abaya',
      nameAr: 'عباءة سوداء أنيقة',
      slug: 'elegant-black-abaya',
      sku: 'ABD-AB-003',
      price: 349,
      salePrice: 279,
      discountPercent: 20,
      images: [
        { url: '/images/product-3.jpg', alt: 'Black Abaya', altAr: 'عباءة سوداء' }
      ],
      category: {
        id: '3',
        name: 'Abaya',
        nameAr: 'عباءة',
        slug: 'abaya'
      },
      variants: [
        { type: 'SIZE', value: 'S', valueAr: 'صغير' },
        { type: 'SIZE', value: 'M', valueAr: 'وسط' },
        { type: 'SIZE', value: 'L', valueAr: 'كبير' },
        { type: 'COLOR', value: 'Black', valueAr: 'أسود' },
        { type: 'COLOR', value: 'Navy', valueAr: 'كحلي' },
      ],
      isFeatured: true,
      stockQuantity: 8,
    },
    {
      id: '4',
      name: 'Traditional Kaftan',
      nameAr: 'قفطان تقليدي',
      slug: 'traditional-kaftan',
      sku: 'ABD-KF-004',
      price: 259,
      images: [
        { url: '/images/product-4.jpg', alt: 'Traditional Kaftan', altAr: 'قفطان تقليدي' }
      ],
      category: {
        id: '1',
        name: 'Djellaba',
        nameAr: 'جلابية',
        slug: 'djellaba'
      },
      variants: [
        { type: 'SIZE', value: 'M', valueAr: 'وسط' },
        { type: 'SIZE', value: 'L', valueAr: 'كبير' },
        { type: 'COLOR', value: 'Cream', valueAr: 'كريمي' },
        { type: 'COLOR', value: 'Gold', valueAr: 'ذهبي' },
      ],
      isFeatured: true,
      stockQuantity: 12,
    },
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=8');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products?.length > 0 ? data.products : defaultProducts);
        } else {
          setProducts(defaultProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts(defaultProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
