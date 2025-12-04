'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { CheckCircle, Home, ShoppingBag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const { language } = useLanguage();
  const [whatsappConfigured, setWhatsappConfigured] = useState(true);

  useEffect(() => {
    // Check if WhatsApp is properly configured
    fetch('/api/settings/whatsapp')
      .then(response => response.json())
      .then(data => {
        setWhatsappConfigured(data.whatsappNumber && data.whatsappNumber !== '+201000000000');
      })
      .catch(() => setWhatsappConfigured(false));
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#2A3436] to-[#1a1d1f] flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Your order has been sent successfully!'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {language === 'ar' 
            ? 'شكراً لك! تم إرسال طلبك عبر واتساب. إذا لم يتم فتح واتساب تلقائياً، يرجى التواصل معنا مباشرة على الرقم المُعرّف في إعدادات المتجر.'
            : 'Thank you! Your order has been sent via WhatsApp. If WhatsApp did not open automatically, please contact us directly using the number configured in store settings.'
          }
        </p>
        
        {!whatsappConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                {language === 'ar' ? 'تنبيه' : 'Notice'}
              </span>
            </div>
            <p className="text-yellow-700 text-sm">
              {language === 'ar' 
                ? 'رقم الواتساب غير مُعرّف بشكل صحيح. يرجى التواصل مع الإدارة لإعداد الرقم.'
                : 'WhatsApp number is not properly configured. Please contact administration to set up the number.'
              }
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
          
          <Link
            href="/products"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    </div>
  );
}
