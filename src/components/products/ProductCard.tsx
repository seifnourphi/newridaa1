'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  images: Array<{
    url: string;
    alt?: string;
    altAr?: string;
  }>;
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
    stock?: number;
  }[];
  variantCombinations?: Array<{
    id: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    sortOrder: number;
  }>;
  stockQuantity: number;
  createdAt?: string;
  views?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onOpenVariantModal?: (product: Product) => void;
}

export function ProductCard({ product, viewMode = 'grid', onOpenVariantModal }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product has variants
    const sizes = product.variants.filter(v => v.type === 'SIZE');
    const colors = product.variants.filter(v => v.type === 'COLOR');
    
    // If product has variants, show modal to select them or navigate to product page
    if (sizes.length > 0 || colors.length > 0) {
      if (onOpenVariantModal) {
        onOpenVariantModal(product);
      } else {
        // If no callback, navigate to product page
        window.location.href = `/products/${product.slug}`;
      }
      return;
    }
    
    // No variants, add directly to cart
    if (product.stockQuantity > 0) {
      // Get image URL - handle both string and object formats
      const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
      const imageUrl = typeof firstImage === 'string' 
        ? firstImage 
        : (firstImage && typeof firstImage === 'object' && 'url' in firstImage)
          ? firstImage.url || ''
          : '';
      
      const result = addToCart({
        name: language === 'ar' ? product.nameAr : product.name,
        nameAr: product.nameAr,
        productId: product.id,
        price: displayPrice,
        image: imageUrl,
        quantity: 1,
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


  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        price: displayPrice,
        image: product.images[0]?.url || '',
        slug: product.slug,
      });
    }
  };

  const router = useRouter();

  const handleViewProduct = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Track product view (fire and forget)
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'view_product',
        productId: product.id,
        entityType: 'product',
      }),
    }).catch(() => {
      // Silently handle error
    });

    // Navigate to product page
    router.push(`/products/${product.slug}`);
  };

  return (
    <div 
      className="group relative bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col h-[400px] cursor-pointer"
      onClick={(e) => {
        // Only navigate if clicking on the card itself, not on buttons or links
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
          return;
        }
        handleViewProduct(e);
      }}
    >
      {/* Product Image */}
      <div className="h-[250px] bg-gray-100 relative overflow-hidden">
        <div className="relative w-full h-full">
          {product.images && product.images.length > 0 ? (() => {
            // Get first image - handle both string and object formats
            const firstImage = product.images[0];
            let imageUrl: string;
            
            if (typeof firstImage === 'string') {
              imageUrl = (firstImage as string).trim() || '/uploads/good.png';
            } else if (firstImage && typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
              const urlValue = (firstImage as { url?: string }).url;
              imageUrl = (urlValue ? String(urlValue).trim() : '') || '/uploads/good.png';
            } else {
              imageUrl = '/uploads/good.png';
            }
            
            // Decode HTML entities (like &#x2F; to /) if present
            if (imageUrl && imageUrl.includes('&#')) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = imageUrl;
              imageUrl = tempDiv.textContent || tempDiv.innerText || imageUrl;
            }
            
            // Validate URL - if empty or invalid, use fallback
            if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
              imageUrl = '/uploads/good.png';
            }
            
            const imageAlt = typeof firstImage === 'object' && firstImage?.alt 
              ? (language === 'ar' ? (firstImage.altAr || firstImage.alt) : firstImage.alt)
              : (language === 'ar' ? product.nameAr : product.name);
            
            return (
              <>
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400/20 border-t-yellow-400"></div>
                  </div>
                )}
                <img
                  key={`product-${product.id}-img-0`}
                  src={imageUrl}
                  alt={imageAlt}
                  className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 cursor-pointer ${
                    isImageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onClick={handleViewProduct}
                  onLoad={() => {
                    setIsImageLoading(false);
                  }}
                  onError={(e) => {
                    setIsImageLoading(false);
                    // Fallback to placeholder on error
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/uploads/good.png' && !target.src.includes('good.png')) {
                      target.src = '/uploads/good.png';
                    }
                  }}
                />
              </>
            );
          })() : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center cursor-pointer" onClick={handleViewProduct}>
              <div className="text-6xl opacity-40">👘</div>
            </div>
          )}
        </div>

        {/* Badges Container */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md transform hover:scale-110 transition-transform flex items-center justify-center">
              <span className="relative z-10">-{discountPercent}%</span>
            </div>
          )}

          {/* New Badge */}
          {product.isNew && (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md flex items-center justify-center">
              <span>{language === 'ar' ? 'جديد' : 'New'}</span>
            </div>
          )}

          {/* Bestseller Badge */}
          {product.isBestseller && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md flex items-center justify-center">
              <span>{language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'}</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md flex items-center justify-center">
              <span>{language === 'ar' ? 'مميز' : 'Featured'}</span>
            </div>
          )}
        </div>

        {/* Stock Badge */}
        {product.stockQuantity === 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-gray-700 to-gray-900 text-white px-1.5 py-0.5 rounded-full text-[9px] font-semibold z-10 shadow-md flex items-center justify-center">
            {t('products.outOfStock')}
          </div>
        )}

        {/* Action Icons - Right side of Image */}
        <div className="absolute top-2 right-2 flex flex-col items-center justify-center gap-2 scale-0 group-hover:scale-100 transition-transform duration-300 z-20 origin-top-right">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewProduct(e);
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#DAA520] hover:text-white transition-all duration-300 shadow-md"
            title={language === 'ar' ? 'عرض المنتج' : 'View Product'}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistClick(e);
            }}
            disabled={product.stockQuantity === 0}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#DAA520] hover:text-white transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title={language === 'ar' ? 'إضافة للمفضلة' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current text-red-500' : 'text-gray-900'}`} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 
          className="text-base font-medium text-gray-900 mb-2 line-clamp-2 hover:text-[#DAA520] transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleViewProduct(e);
          }}
        >
          {language === 'ar' ? product.nameAr : product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-semibold text-[#DAA520]">
            {language === 'ar' 
              ? `ج.م ${displayPrice.toLocaleString('en-US')}`
              : `EGP ${displayPrice.toLocaleString('en-US')}`
            }
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {language === 'ar' 
                ? `ج.م ${product.price.toLocaleString('en-US')}`
                : `EGP ${product.price.toLocaleString('en-US')}`
              }
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            handleAddToCart(e);
          }}
          type="button"
          disabled={product.stockQuantity === 0}
          className={`w-full py-2 flex items-center justify-center gap-1.5 transition-all text-sm font-medium ${
            product.stockQuantity === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#DAA520] text-white hover:bg-[#B8860B]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {product.stockQuantity === 0
              ? (language === 'ar' ? 'نفد المخزون' : 'Out of Stock')
              : (language === 'ar' ? 'إضافة للسلة' : 'Add to Cart')
            }
          </span>
        </button>
      </div>

    </div>
  );
}