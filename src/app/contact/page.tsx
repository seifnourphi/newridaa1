'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const { language } = useLanguage();
  const [storeSettings, setStoreSettings] = useState({
    phone: '',
    email: '',
    name: '',
    nameAr: ''
  });
  const [whatsappNumber, setWhatsappNumber] = useState('+201000000000');
  const [pagesContent, setPagesContent] = useState<any>(null);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch('/api/settings/store');
        if (response.ok) {
          const data = await response.json();
          setStoreSettings(data.storeSettings || {
            phone: '+20 100 000 0000',
            email: 'ridaa.store.team@gmail.com',
            name: 'RIDAA Fashion',
            nameAr: 'رِداء للأزياء'
          });
        } else {
          setStoreSettings({
            phone: '+20 100 000 0000',
            email: 'ridaa.store.team@gmail.com',
            name: 'RIDAA Fashion',
            nameAr: 'رِداء للأزياء'
          });
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
        setStoreSettings({
          phone: '+20 100 000 0000',
          email: 'ridaa.store.team@gmail.com',
          name: 'RIDAA Fashion',
          nameAr: 'رِداء للأزياء'
        });
      }
    };

    const fetchWhatsappNumber = async () => {
      try {
        const response = await fetch('/api/settings/whatsapp');
        if (response.ok) {
          const data = await response.json();
          const number = data.whatsappNumber || data.whatsapp?.number || '+201000000000';
          if (number) {
            setWhatsappNumber(number);
          }
        } else {
          setWhatsappNumber('+201000000000');
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
        setWhatsappNumber('+201000000000');
      }
    };

    const fetchPagesContent = async () => {
      try {
        const response = await fetch('/api/settings/pages-content');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.pagesContent) {
            setPagesContent(data.pagesContent);
          }
        }
      } catch (error) {
        console.error('Error fetching pages content:', error);
      }
    };

    fetchStoreSettings();
    fetchWhatsappNumber();
    fetchPagesContent();
  }, []);

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: storeSettings.email,
      description: pagesContent?.contact?.emailDescriptionAr && pagesContent?.contact?.emailDescriptionEn
        ? (language === 'ar' ? pagesContent.contact.emailDescriptionAr : pagesContent.contact.emailDescriptionEn)
        : (language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message')
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: language === 'ar' ? 'واتساب' : 'WhatsApp',
      value: whatsappNumber,
      description: pagesContent?.contact?.whatsappDescriptionAr && pagesContent?.contact?.whatsappDescriptionEn
        ? (language === 'ar' ? pagesContent.contact.whatsappDescriptionAr : pagesContent.contact.whatsappDescriptionEn)
        : (language === 'ar' ? 'تواصل معنا مباشرة' : 'Contact us directly')
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: language === 'ar' ? 'العنوان' : 'Address',
      value: pagesContent?.contact?.addressAr && pagesContent?.contact?.addressEn
        ? (language === 'ar' ? pagesContent.contact.addressAr : pagesContent.contact.addressEn)
        : (language === 'ar' ? 'مصر' : 'Egypt'),
      description: pagesContent?.contact?.addressDescriptionAr && pagesContent?.contact?.addressDescriptionEn
        ? (language === 'ar' ? pagesContent.contact.addressDescriptionAr : pagesContent.contact.addressDescriptionEn)
        : (language === 'ar' ? 'نحن موجودون في مصر' : 'We are located in Egypt')
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: language === 'ar' ? 'ساعات العمل' : 'Working Hours',
      value: pagesContent?.contact?.workingHoursAr && pagesContent?.contact?.workingHoursEn
        ? (language === 'ar' ? pagesContent.contact.workingHoursAr : pagesContent.contact.workingHoursEn)
        : (language === 'ar' ? '9:00 ص - 10:00 م' : '9:00 AM - 10:00 PM'),
      description: pagesContent?.contact?.workingHoursDescriptionAr && pagesContent?.contact?.workingHoursDescriptionEn
        ? (language === 'ar' ? pagesContent.contact.workingHoursDescriptionAr : pagesContent.contact.workingHoursDescriptionEn)
        : (language === 'ar' ? 'من السبت إلى الخميس' : 'Saturday to Thursday')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {pagesContent?.contact?.heroTitleAr && pagesContent?.contact?.heroTitleEn
              ? (language === 'ar' ? pagesContent.contact.heroTitleAr : pagesContent.contact.heroTitleEn)
              : (language === 'ar' ? 'اتصل بنا' : 'Contact Us')}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {pagesContent?.contact?.heroDescriptionAr && pagesContent?.contact?.heroDescriptionEn
              ? (language === 'ar' ? pagesContent.contact.heroDescriptionAr : pagesContent.contact.heroDescriptionEn)
              : (language === 'ar' 
                ? 'نحن هنا لمساعدتك في أي وقت. تواصل معنا وسنكون سعداء لخدمتك'
                : 'We are here to help you anytime. Contact us and we will be happy to serve you'
              )}
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#DAA520] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-[#DAA520] font-medium mb-2">
                  {info.value}
                </p>
                <p className="text-gray-600 text-sm">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-[#DAA520]" />
                  <div>
                    <p className="font-semibold text-gray-900">{storeSettings.email}</p>
                    <p className="text-gray-600">
                      {pagesContent?.contact?.emailDescriptionAr && pagesContent?.contact?.emailDescriptionEn
                        ? (language === 'ar' ? pagesContent.contact.emailDescriptionAr : pagesContent.contact.emailDescriptionEn)
                        : (language === 'ar' ? 'أرسل لنا إيميل' : 'Send us an email')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-green-500 rounded-lg shadow-md p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <MessageCircle className="w-8 h-8" />
                <h3 className="text-2xl font-bold">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </h3>
              </div>
              <p className="text-green-100 mb-6">
                {pagesContent?.contact?.whatsappDescriptionAr && pagesContent?.contact?.whatsappDescriptionEn
                  ? (language === 'ar' ? pagesContent.contact.whatsappDescriptionAr : pagesContent.contact.whatsappDescriptionEn)
                  : (language === 'ar' 
                    ? 'تواصل معنا عبر واتساب للحصول على استجابة سريعة'
                    : 'Contact us via WhatsApp for quick response'
                  )}
              </p>
              <div className="mb-4">
                <p className="text-white font-semibold mb-2">
                  {language === 'ar' ? 'رقم واتساب:' : 'WhatsApp Number:'}
                </p>
                <p className="text-green-100 text-lg font-bold">
                  {whatsappNumber || '+201000000000'}
                </p>
              </div>
              <a
                href={`https://wa.me/${(whatsappNumber || '+201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  pagesContent?.contact?.whatsappMessageAr && pagesContent?.contact?.whatsappMessageEn
                    ? (language === 'ar' ? pagesContent.contact.whatsappMessageAr : pagesContent.contact.whatsappMessageEn)
                    : (language === 'ar' ? 'مرحباً، أريد الاستفسار عن المنتجات' : 'Hello, I want to inquire about products')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {pagesContent?.contact?.whatsappButtonTextAr && pagesContent?.contact?.whatsappButtonTextEn
                  ? (language === 'ar' ? pagesContent.contact.whatsappButtonTextAr : pagesContent.contact.whatsappButtonTextEn)
                  : (language === 'ar' ? 'ابدأ المحادثة' : 'Start Chat')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}