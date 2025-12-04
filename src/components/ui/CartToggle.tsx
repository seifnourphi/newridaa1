'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CartToggle() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default language value for server-side rendering
  const displayText = mounted ? (language === 'ar' ? 'السلة' : 'Cart') : 'السلة';

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return language === 'ar' 
      ? `ج.م ${price.toLocaleString('en-US')}`
      : `EGP ${price.toLocaleString('en-US')}`;
  };

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 text-white hover:text-[#DAA520] transition-colors cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden sm:block" suppressHydrationWarning>
          {displayText}
        </span>
        {totalItems > 0 && (
          <div className="absolute -top-2 -right-2 bg-[#DAA520] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </div>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-lg">👘</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {language === 'ar' ? item.nameAr : item.name}
                        </h4>
                        <p className="text-sm text-[#DAA520] font-medium">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50">
                {/* Return to Products Link */}
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-[#DAA520] transition-all duration-200 py-3 px-4 border-b border-gray-200 hover:bg-white group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>{language === 'ar' ? 'العودة للمنتجات' : 'Return to Products'}</span>
                </Link>

                {/* Total and Actions */}
                <div className="p-4">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {language === 'ar' ? 'المجموع' : 'Total'}
                    </span>
                    <span className="text-lg font-bold text-[#DAA520]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      className="w-full bg-white text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200 shadow-sm hover:shadow-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {language === 'ar' ? 'عرض السلة' : 'View Cart'}
                    </Link>
                    <Link
                      href="/checkout"
                      className="w-full bg-[#DAA520] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#B8860B] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {language === 'ar' ? 'إتمام الشراء' : 'Checkout'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
