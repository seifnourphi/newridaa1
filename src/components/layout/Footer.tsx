'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowRight } from 'lucide-react';

export function Footer() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<{
    phone: string;
    email: string;
    name: string;
    nameAr: string;
    socialMedia?: {
      facebook?: { enabled: boolean; url: string; };
      instagram?: { enabled: boolean; url: string; };
      twitter?: { enabled: boolean; url: string; };
      youtube?: { enabled: boolean; url: string; };
    };
  }>({
    phone: '',
    email: '',
    name: '',
    nameAr: ''
  });
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Cache refs to prevent excessive requests
  const settingsCacheRef = useRef<{ data: any; timestamp: number } | null>(null);
  const whatsappCacheRef = useRef<{ data: string; timestamp: number } | null>(null);
  const isFetchingSettingsRef = useRef(false);
  const isFetchingWhatsappRef = useRef(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  useEffect(() => {
    const fetchStoreSettings = async () => {
      // Check cache first
      if (settingsCacheRef.current) {
        const cacheAge = Date.now() - settingsCacheRef.current.timestamp;
        if (cacheAge < CACHE_DURATION) {
          setStoreSettings(settingsCacheRef.current.data);
          return;
        }
      }

      // Prevent concurrent requests
      if (isFetchingSettingsRef.current) {
        return;
      }

      isFetchingSettingsRef.current = true;
      try {
        const response = await fetch('/api/settings/store');
        if (response.ok) {
          const data = await response.json();
          const settings = data.storeSettings || {
            phone: '+20 100 000 0000',
            email: 'ridaa.store.team@gmail.com',
            name: 'RIDAA Fashion',
            nameAr: 'رِداء للأزياء'
          };
          
          // Update cache
          settingsCacheRef.current = {
            data: settings,
            timestamp: Date.now()
          };
          setStoreSettings(settings);
        } else {
          // Use cached data or defaults
          if (settingsCacheRef.current) {
            setStoreSettings(settingsCacheRef.current.data);
          } else {
            setStoreSettings({
              phone: '+20 100 000 0000',
              email: 'ridaa.store.team@gmail.com',
              name: 'RIDAA Fashion',
              nameAr: 'رِداء للأزياء'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
        // Use cached data or defaults
        if (settingsCacheRef.current) {
          setStoreSettings(settingsCacheRef.current.data);
        } else {
          setStoreSettings({
            phone: '+20 100 000 0000',
            email: 'ridaa.store.team@gmail.com',
            name: 'RIDAA Fashion',
            nameAr: 'رِداء للأزياء'
          });
        }
      } finally {
        isFetchingSettingsRef.current = false;
      }
    };

    const fetchWhatsappNumber = async () => {
      // Check cache first
      if (whatsappCacheRef.current) {
        const cacheAge = Date.now() - whatsappCacheRef.current.timestamp;
        if (cacheAge < CACHE_DURATION) {
          setWhatsappNumber(whatsappCacheRef.current.data);
          return;
        }
      }

      // Prevent concurrent requests
      if (isFetchingWhatsappRef.current) {
        return;
      }

      isFetchingWhatsappRef.current = true;
      try {
        const response = await fetch('/api/settings/whatsapp');
        if (response.ok) {
          const data = await response.json();
          const number = data.whatsappNumber || '+201000000000';
          
          // Update cache
          whatsappCacheRef.current = {
            data: number,
            timestamp: Date.now()
          };
          setWhatsappNumber(number);
        } else {
          // Use cached data or defaults
          if (whatsappCacheRef.current) {
            setWhatsappNumber(whatsappCacheRef.current.data);
          } else {
            setWhatsappNumber('+201000000000');
          }
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
        // Use cached data or defaults
        if (whatsappCacheRef.current) {
          setWhatsappNumber(whatsappCacheRef.current.data);
        } else {
          setWhatsappNumber('+201000000000');
        }
      } finally {
        isFetchingWhatsappRef.current = false;
      }
    };

    fetchStoreSettings();
    fetchWhatsappNumber();
    setMounted(true);
  }, []);

  return (
    <footer className="bg-[#111827] text-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="flex flex-col items-center mb-4">
                <span className="text-3xl font-bold text-[#DAA520] tracking-wide" style={{fontFamily: 'serif', width: '100%', textAlign: 'center'}}>
                  R<span className="text-2xl">i</span>DAA
                </span>
                <div className="w-full h-0.5 mt-1" style={{
                  background: 'linear-gradient(90deg, transparent 0%, transparent 20%, #DAA520 40%, #DAA520 60%, transparent 80%, transparent 100%)',
                  boxShadow: '0 0 4px #DAA520, 0 0 8px rgba(218, 165, 32, 0.5)'
                }}></div>
              </div>
              <div className="text-lg font-medium text-[#DAA520] tracking-wider text-center">
                WEAR YOUR IDENTITY
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed" suppressHydrationWarning>
              {mounted ? (language === 'ar' 
                ? 'نقدم لك أجمل الأزياء العربية الأصيلة والأنيقة من ثياب تقليدية وملابس عربية راقية تناسب جميع المناسبات'
                : 'We offer you the most beautiful authentic and elegant Arabic clothing from traditional garments to sophisticated Arabic fashion suitable for all occasions'
              ) : 'نقدم لك أجمل الأزياء العربية الأصيلة والأنيقة من ثياب تقليدية وملابس عربية راقية تناسب جميع المناسبات'}
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {storeSettings.socialMedia?.facebook?.enabled !== false && (
                <a 
                  href={storeSettings.socialMedia?.facebook?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center hover:bg-[#166FE5] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6 text-white" />
                </a>
              )}
              {storeSettings.socialMedia?.instagram?.enabled !== false && (
                <a 
                  href={storeSettings.socialMedia?.instagram?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
              )}
              {storeSettings.socialMedia?.twitter?.enabled !== false && (
                <a 
                  href={storeSettings.socialMedia?.twitter?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center hover:bg-[#1A91DA] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Twitter"
                >
                  <Twitter className="w-6 h-6 text-white" />
                </a>
              )}
              {storeSettings.socialMedia?.youtube?.enabled !== false && (
                <a 
                  href={storeSettings.socialMedia?.youtube?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6 text-white" />
                </a>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-100" suppressHydrationWarning>
              {mounted ? (language === 'ar' ? 'روابط سريعة' : 'Quick Links') : 'روابط سريعة'}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#DAA520] transition-colors flex items-center gap-2" suppressHydrationWarning>
                  <ArrowRight className="w-4 h-4" />
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'الرئيسية' : 'Home') : 'الرئيسية'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-[#DAA520] transition-colors flex items-center gap-2" suppressHydrationWarning>
                  <ArrowRight className="w-4 h-4" />
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'المنتجات' : 'Products') : 'المنتجات'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#DAA520] transition-colors flex items-center gap-2" suppressHydrationWarning>
                  <ArrowRight className="w-4 h-4" />
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'من نحن' : 'About Us') : 'من نحن'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#DAA520] transition-colors flex items-center gap-2" suppressHydrationWarning>
                  <ArrowRight className="w-4 h-4" />
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'اتصل بنا' : 'Contact Us') : 'اتصل بنا'}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-100" suppressHydrationWarning>
              {mounted ? (language === 'ar' ? 'اتصل بنا' : 'Contact Us') : 'اتصل بنا'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#DAA520]" />
                <span className="text-gray-300">{storeSettings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#DAA520]" />
                <span className="text-gray-300">{storeSettings.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#DAA520]" />
                <span className="text-gray-300" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'مصر' : 'Egypt') : 'مصر'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📱</span>
                </div>
                <a 
                  href={`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(language === 'ar' ? 'مرحباً، أريد الاستفسار عن المنتجات' : 'Hello, I want to inquire about products')}`}
                  className="text-gray-300 hover:text-[#DAA520] transition-colors"
                  suppressHydrationWarning
                >
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'واتساب' : 'WhatsApp') : 'واتساب'}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-gray-300 text-center" suppressHydrationWarning>
              {mounted ? (language === 'ar' ? 'Ridaa. جميع الحقوق محفوظة.' : 'Ridaa. All rights reserved.') : 'Ridaa. جميع الحقوق محفوظة.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}