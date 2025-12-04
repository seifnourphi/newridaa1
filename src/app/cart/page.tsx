'use client';

import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { language } = useLanguage();

  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = totalPrice > 500 ? 0 : 50;
  const finalTotal = totalPrice + shipping;

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

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'ar' ? 'أضف بعض المنتجات إلى سلة المشتريات أولاً' : 'Add some products to your cart first'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#DAA520] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#B8860B] transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[#DAA520] hover:text-[#B8860B] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'المنتجات' : 'Products'} ({items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-2xl">👘</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {language === 'ar' ? item.nameAr : item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {language === 'ar' ? 'السعر' : 'Price'}: {formatPrice(item.price)}
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-500">
                            {language === 'ar' ? 'المقاس' : 'Size'}: {item.selectedSize}
                          </p>
                        )}
                        {item.selectedColor && (
                          <p className="text-sm text-gray-500">
                            {language === 'ar' ? 'اللون' : 'Color'}: {item.selectedColor}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#DAA520]">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Order Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                  <span className="text-gray-900">
                    {shipping === 0 
                      ? (language === 'ar' ? 'مجاني' : 'Free')
                      : formatPrice(shipping)
                    }
                  </span>
                </div>
                {shipping > 0 && totalPrice < 500 && (
                  <p className="text-xs text-gray-500">
                    {language === 'ar' 
                      ? 'الشحن مجاني للطلبات أكثر من 500 جنيه'
                      : 'Free shipping on orders over 500 EGP'
                    }
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">{language === 'ar' ? 'المجموع' : 'Total'}</span>
                    <span className="text-[#DAA520]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-[#DAA520] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#B8860B] transition-colors flex items-center justify-center gap-2"
                >
                  {language === 'ar' ? 'إتمام الشراء' : 'Checkout'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {language === 'ar' ? 'تسوق المزيد' : 'Continue Shopping'}
                </Link>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <div className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span>
                    {language === 'ar' 
                      ? 'دفع آمن ومحمي'
                      : 'Secure and protected payment'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}