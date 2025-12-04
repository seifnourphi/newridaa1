'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ArrowRight, CheckCircle, Users, Award, Heart, Globe } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();
  const [storeSettings, setStoreSettings] = useState({
    phone: '',
    email: '',
    name: '',
    nameAr: ''
  });
  const [pagesContent, setPagesContent] = useState<any>(null);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch('/api/settings/store');
        if (response.ok) {
          const data = await response.json();
          setStoreSettings(data.storeSettings);
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
    fetchPagesContent();
  }, []);

  const features = pagesContent?.about?.features || [
    {
      icon: <Users className="w-8 h-8" />,
      title: language === 'ar' ? 'عملاء سعداء' : 'Happy Customers',
      description: language === 'ar' ? 'أكثر من 10,000 عميل راضي' : 'Over 10,000 satisfied customers'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: language === 'ar' ? 'جودة عالية' : 'High Quality',
      description: language === 'ar' ? 'منتجات عالية الجودة فقط' : 'Only high quality products'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: language === 'ar' ? 'شغف بالتفاصيل' : 'Passion for Details',
      description: language === 'ar' ? 'نحن نهتم بكل التفاصيل' : 'We care about every detail'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: language === 'ar' ? 'توصيل لكل المحافظات' : 'Nationwide Delivery',
      description: language === 'ar'
        ? 'توصيل سريع وآمن لجميع محافظات مصر'
        : 'Fast, reliable delivery to all governorates in Egypt'
    }
  ].map((feature: any, index: number) => {
    const contentFeature = pagesContent?.about?.features?.[index];
    return {
      ...feature,
      title: contentFeature 
        ? (language === 'ar' ? contentFeature.titleAr : contentFeature.titleEn)
        : feature.title,
      description: contentFeature
        ? (language === 'ar' ? contentFeature.descriptionAr : contentFeature.descriptionEn)
        : feature.description
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] py-24 relative overflow-hidden animate-fade-in">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none" style={{backgroundImage:'url(/uploads/1761573409020-island-night-moon-scenery-digital-art-8k-wallpaper-uhdpaper.com-289@0@j.jpg)', backgroundSize:'cover', backgroundPosition:'center'}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 animate-slide-down">
            <span className="bg-gradient-to-r from-[#fffbe6] to-[#FFD700] bg-clip-text text-transparent block mb-2">
              {storeSettings[language === 'ar' ? 'nameAr' : 'name'] || 'RIDAA' }
            </span>
            {pagesContent?.about?.heroTitleAr && pagesContent?.about?.heroTitleEn
              ? (language === 'ar' ? pagesContent.about.heroTitleAr : pagesContent.about.heroTitleEn)
              : (language === 'ar' ? 'من نحن' : 'About Us')}
          </h1>
          <div className="w-44 h-2 mx-auto rounded-full bg-gradient-to-r from-[#fffbe6]/80 to-[#FFD700]/40 mb-4" />
          <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in [animation-delay:200ms]">
            {pagesContent?.about?.heroSubtitleAr && pagesContent?.about?.heroSubtitleEn
              ? (language === 'ar' ? pagesContent.about.heroSubtitleAr : pagesContent.about.heroSubtitleEn)
              : (language === 'ar' 
                ? 'اكتشف قصة رِداء ورؤيتنا للأزياء العربية الأصيلة'
                : 'Discover RIDAA\'s story and our vision for authentic Arabic fashion'
              )}
          </p>
        </div>
      </section>

      {/* Vivid decorative divider */}
      <div className="w-32 h-1 mx-auto my-6 bg-gradient-to-r from-[#DAA520] via-[#fffbe6] to-[#DAA520] rounded-full opacity-80" />

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {pagesContent?.about?.storyTitleAr && pagesContent?.about?.storyTitleEn
                  ? (language === 'ar' ? pagesContent.about.storyTitleAr : pagesContent.about.storyTitleEn)
                  : (language === 'ar' ? 'قصتنا' : 'Our Story')}
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                {pagesContent?.about?.storyContentAr && pagesContent?.about?.storyContentEn
                  ? (language === 'ar' ? pagesContent.about.storyContentAr : pagesContent.about.storyContentEn)
                      .split('\n\n')
                      .map((paragraph: string, index: number) => (
                        <p key={index}>{paragraph}</p>
                      ))
                  : (
                    <>
                      <p>
                        {language === 'ar' 
                          ? 'رِداء هو وجهتك للأناقة الأصيلة والذوق الرفيع. نقدّم تصاميم تجمع بين الأصالة والحداثة ممزوجة بحب التفاصيل، مستوحاة من الهوية العربية وروح الفخامة الهادئة والتقاليد العريقة.'
                          : 'RIDAA is your destination for authentic elegance and refined taste. We offer designs that blend authenticity and modernism with a passion for details, inspired by rich Arabic identity and the spirit of timeless luxury.'
                        }
                      </p>
                      <p>
                        {language === 'ar' 
                          ? 'في رِداء، نؤمن أن اللباس تعبير عن الهوية والثقة، وأن كل قطعة تحمل رسالة، وأصالة، وبصمة فريدة لصاحبها.'
                          : 'At RIDAA, we believe clothing is an expression of identity and confidence, with every piece carrying a message, heritage, and a unique fingerprint for its owner.'
                        }
                      </p>
                      <p>
                        {language === 'ar' 
                          ? 'نحن ملتزمون بتقديم أعلى مستويات الجودة، مع خدمة شخصيّة وتجربة تليق بك كجزء من عائلة رداء.'
                          : 'We are committed to delivering top-notch quality, personal service, and an experience worthy of you as part of the RIDAA family.'
                        }
                      </p>
                    </>
                  )}
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="bg-gradient-to-br from-[#DAA520] to-[#B8860B] rounded-3xl p-12 h-[460px] flex items-center justify-center shadow-xl border-[6px] border-white/40">
                <div className="text-center text-white">
                  <div className="text-8xl mb-6 animate-bounce">🕊️</div>
                  <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">
                    {pagesContent?.about?.storyImageTextAr && pagesContent?.about?.storyImageTextEn
                      ? (language === 'ar' ? pagesContent.about.storyImageTextAr : pagesContent.about.storyImageTextEn)
                      : (language === 'ar' ? 'الهوية والثقة' : 'Identity & Confidence')}
                  </h3>
                  <p className="text-lg opacity-90">
                    {pagesContent?.about?.storyImageSubtextAr && pagesContent?.about?.storyImageSubtextEn
                      ? (language === 'ar' ? pagesContent.about.storyImageSubtextAr : pagesContent.about.storyImageSubtextEn)
                      : (language === 'ar' ? 'نصنع كل تصميم ليعكس شخصيتك ويلهم من حولك' : 'We craft each design to reflect your character and inspire those around you.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              {pagesContent?.about?.featuresTitleAr && pagesContent?.about?.featuresTitleEn
                ? (language === 'ar' ? pagesContent.about.featuresTitleAr : pagesContent.about.featuresTitleEn)
                : (language === 'ar' ? 'لماذا تختار رِداء؟' : 'Why Choose RIDAA?')}
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-[#DAA520]/80 via-[#fffbe6] to-[#DAA520]/60 mb-6 opacity-90" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {pagesContent?.about?.featuresDescriptionAr && pagesContent?.about?.featuresDescriptionEn
                ? (language === 'ar' ? pagesContent.about.featuresDescriptionAr : pagesContent.about.featuresDescriptionEn)
                : (language === 'ar' 
                  ? 'نحن نقدم تجربة تسوق فريدة مع أعلى مستويات الجودة والخدمة والابتكار.'
                  : 'We offer a unique shopping experience with the highest levels of quality, service, and innovation.'
                )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 border-t-4 border-b-4 border-transparent hover:border-[#FFD700] animate-fade-in [animation-delay:300ms]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#DAA520] via-[#FFD700] to-[#B8860B] shadow-[0_2px_8px_rgba(170,134,0,0.22)] ring-2 ring-[#FFF4] rounded-full flex items-center justify-center mx-auto mb-6 text-white border-2 border-white animate-fade-in [animation-delay:300ms]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider before mission/vision */}
      <div className="w-24 h-1 mx-auto my-14 bg-gradient-to-r from-[#DAA520]/80 via-[#fffbe6] to-[#DAA520]/80 rounded-full opacity-80 animate-fade-in" />

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Mission */}
            <div className="bg-white rounded-lg shadow-md p-8 animate-slide-up">
              <div className="w-16 h-16 bg-[#DAA520] rounded-full flex items-center justify-center mb-6 ring-2 ring-[#FFD700]/40">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {pagesContent?.about?.missionTitleAr && pagesContent?.about?.missionTitleEn
                  ? (language === 'ar' ? pagesContent.about.missionTitleAr : pagesContent.about.missionTitleEn)
                  : (language === 'ar' ? 'مهمتنا' : 'Our Mission')}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {pagesContent?.about?.missionContentAr && pagesContent?.about?.missionContentEn
                  ? (language === 'ar' ? pagesContent.about.missionContentAr : pagesContent.about.missionContentEn)
                  : (language === 'ar' 
                    ? 'نهدف إلى إحياء أناقة وتقاليد التراث العربي العصري وتقديمها للعالم في قالب من الجودة والرقي.'
                    : 'We aim to revive the elegance and traditions of modern Arab heritage, and present them to the world with quality and sophistication.'
                  )}
              </p>
            </div>
            {/* Vision */}
            <div className="bg-white rounded-lg shadow-md p-8 animate-slide-up [animation-delay:100ms]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center mb-6 ring-2 ring-[#FFD700]/40">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {pagesContent?.about?.visionTitleAr && pagesContent?.about?.visionTitleEn
                  ? (language === 'ar' ? pagesContent.about.visionTitleAr : pagesContent.about.visionTitleEn)
                  : (language === 'ar' ? 'رؤيتنا' : 'Our Vision')}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {pagesContent?.about?.visionContentAr && pagesContent?.about?.visionContentEn
                  ? (language === 'ar' ? pagesContent.about.visionContentAr : pagesContent.about.visionContentEn)
                  : (language === 'ar' 
                    ? 'أن نكون الوجهة الأولى للأزياء الراقية العربية والأصيلة عالمياً، وأن نوّصل فخامة ثقافتنا لكل عميل باحث عن التفرد.'
                    : 'To be the foremost destination for elegant and authentic Arabic fashion globally, bringing the luxury of our culture to every client seeking uniqueness.'
                  )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - more vibrant */}
      <section className="py-20 bg-gradient-to-r from-[#DAA520] via-[#FFD700] to-[#B8860B] animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-md">
            {pagesContent?.about?.ctaTitleAr && pagesContent?.about?.ctaTitleEn
              ? (language === 'ar' ? pagesContent.about.ctaTitleAr : pagesContent.about.ctaTitleEn)
              : (language === 'ar' ? 'انضم إلى رحلة الأناقة' : 'Join the Elegance Journey')}
          </h2>
          <div className="w-36 h-1 mx-auto rounded-full bg-gradient-to-r from-[#fffbe6]/80 to-[#FFD700]/60 mb-6 opacity-95" />
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {pagesContent?.about?.ctaDescriptionAr && pagesContent?.about?.ctaDescriptionEn
              ? (language === 'ar' ? pagesContent.about.ctaDescriptionAr : pagesContent.about.ctaDescriptionEn)
              : (language === 'ar' 
                ? 'اكتشف مجموعتنا المميزة من الأزياء العربية الأصيلة واختر ما يناسبك واقتنِ الجودة التي تستحقها.'
                : 'Discover our exclusive collection of authentic Arabic fashion and choose what suits you and experience the quality you deserve.'
              )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="bg-white text-[#DAA520] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-md border border-[#FFD700]/50 animate-slide-up"
            >
              {pagesContent?.about?.ctaButton1TextAr && pagesContent?.about?.ctaButton1TextEn
                ? (language === 'ar' ? pagesContent.about.ctaButton1TextAr : pagesContent.about.ctaButton1TextEn)
                : (language === 'ar' ? 'تصفح المنتجات' : 'Browse Products')}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#DAA520] transition-colors animate-slide-up [animation-delay:100ms]"
            >
              {pagesContent?.about?.ctaButton2TextAr && pagesContent?.about?.ctaButton2TextEn
                ? (language === 'ar' ? pagesContent.about.ctaButton2TextAr : pagesContent.about.ctaButton2TextEn)
                : (language === 'ar' ? 'تواصل معنا' : 'Contact Us')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}