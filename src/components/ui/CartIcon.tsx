'use client';

import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function CartIcon() {
  const { getTotalItems, items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const totalItems = getTotalItems();

  const formatPrice = (price: number) => {
    return language === 'ar' 
      ? `ج.م ${price.toLocaleString('en-US')}`
      : `EGP ${price.toLocaleString('en-US')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-4 text-[#3e5258] hover:text-white transition-all duration-300 rounded-2xl bg-[#3e5258]/30 hover:bg-[#3e5258] shadow-xl hover:shadow-2xl transform hover:scale-105"
        title={language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
      >
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#3e5258] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-xl">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Dropdown Cart */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Cart Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#3e5258] rounded-xl shadow-2xl border border-[#3e5258]/30 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-[#DAA520]/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#DAA520]">
                  {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
                </h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-[#DAA520] hover:text-[#B8860B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-[#DAA520]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-[#DAA520]/50" />
                  <p>{language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          className="w-12 h-12 rounded-lg object-cover"
                          src={item.image}
                          alt={language === 'ar' ? item.nameAr : item.name}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#DAA520] truncate">
                          {language === 'ar' ? item.nameAr : item.name}
                        </h4>
                        
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="text-xs text-[#DAA520]/70">
                            {item.selectedSize && (
                              <span className="inline-block bg-[#DAA520]/20 px-1 py-0.5 rounded text-xs mr-1">
                                {language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-block bg-[#DAA520]/20 px-1 py-0.5 rounded text-xs">
                                {language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold text-[#DAA520]">
                            {formatPrice(item.salePrice || item.price)}
                          </span>
                          
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded hover:bg-[#DAA520]/20 text-[#DAA520]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="w-6 text-center text-sm font-medium text-[#DAA520]">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded hover:bg-[#DAA520]/20 text-[#DAA520]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex-shrink-0 p-1 text-[#DAA520] hover:text-[#B8860B]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-[#3e5258]/30 bg-[#3e5258]/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-[#DAA520]">
                    {language === 'ar' ? 'المجموع:' : 'Total:'}
                  </span>
                  <span className="text-lg font-bold text-[#DAA520]">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                <Link
                  href="/cart"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-[#26292B] py-2 px-4 rounded-lg font-medium hover:from-[#B8860B] hover:to-[#DAA520] transition-colors flex items-center justify-center"
                >
                  {language === 'ar' ? 'عرض السلة' : 'View Cart'}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
