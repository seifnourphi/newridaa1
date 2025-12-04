'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Heart, Trash2, ArrowLeft, ChevronRight, Eye, AlertTriangle, X } from 'lucide-react';

// Helper function to decode HTML entities in URLs
function decodeHtmlEntities(url: string): string {
  if (!url || typeof url !== 'string') return url;
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = url;
    return tempDiv.textContent || tempDiv.innerText || url;
  }
  // Server-side: use simple replace
  return url
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

export default function WishlistPage() {
  const { language } = useLanguage();
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { showToast } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleRemoveFromWishlist = (productId: string) => {
    if (confirm(language === 'ar' ? 'هل تريد حذف هذا المنتج من المفضلة؟' : 'Are you sure you want to remove this product from wishlist?')) {
      removeFromWishlist(productId);
    }
  };

  const handleClearWishlist = () => {
    setShowClearModal(true);
  };

  const confirmClearWishlist = () => {
    clearWishlist();
    setShowClearModal(false);
    showToast(
      language === 'ar' ? 'تم حذف جميع المنتجات من المفضلة' : 'All items removed from wishlist',
      'success',
      3000
    );
  };

  const formatPrice = (price: number | null | undefined) => {
    // Handle invalid values (NaN, null, undefined)
    if (price === null || price === undefined || isNaN(Number(price))) {
      if (language === 'ar') {
        return 'ج.م 0';
      } else {
        return 'EGP 0';
      }
    }

    // Always use en-US locale for numbers to avoid Arabic numerals (١٠٠ instead of 100)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(price));
    
    // Add currency symbol based on language
    if (language === 'ar') {
      return `ج.م ${formatted}`;
    } else {
      return `EGP ${formatted}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#DAA520] transition-colors">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {language === 'ar' ? 'المفضلة' : 'Wishlist'}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'المفضلة' : 'My Wishlist'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'ar' 
                ? `${items.length} منتج في المفضلة`
                : `${items.length} items in your wishlist`
              }
            </p>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'ar' ? 'مسح الكل' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'المفضلة فارغة' : 'Your wishlist is empty'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {language === 'ar' 
                ? 'لم تقم بإضافة أي منتجات للمفضلة بعد. تصفح منتجاتنا وأضف ما يعجبك!'
                : 'You haven\'t added any products to your wishlist yet. Browse our products and add what you like!'
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative group">
                  <img
                    src={decodeHtmlEntities(item.image || '')}
                    alt={language === 'ar' ? item.nameAr : item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop&crop=center';
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Link href={`/products/${item.slug}`}>
                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#DAA520] hover:text-white transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {language === 'ar' ? item.nameAr : item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[#DAA520]">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
                    >
                      {language === 'ar' ? 'اختر المقاس واللون' : 'Choose Size & Color'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'أكمل التسوق' : 'Continue Shopping'}
              </Link>
              <Link
                href="/cart"
                className="px-6 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors"
              >
                {language === 'ar' ? 'الذهاب للسلة' : 'Go to Cart'}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Clear Wishlist Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowClearModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'حذف جميع المنتجات' : 'Clear All Items'}
                  </h3>
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  {language === 'ar' 
                    ? 'هل أنت متأكد من حذف جميع المنتجات من المفضلة؟ لا يمكن التراجع عن هذا الإجراء.'
                    : 'Are you sure you want to remove all items from your wishlist? This action cannot be undone.'
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={confirmClearWishlist}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'ar' ? 'حذف الكل' : 'Clear All'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
