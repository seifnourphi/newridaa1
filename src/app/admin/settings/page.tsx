'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Key,
  Settings as SettingsIcon,
  Palette,
  Monitor,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

interface AdminSettings {
  profile: {
    username: string;
    email: string;
    phone: string;
    fullName: string;
  };
  store: {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    currency: string;
    timezone: string;
    shippingPrice: number;
    instaPayNumber: string;
    instaPayAccountName: string;
    vodafoneNumber: string;
    showAdvertisements?: boolean; // Control show/hide of hero advertisements
    socialMedia?: {
      facebook?: {
        enabled: boolean;
        url: string;
      };
      instagram?: {
        enabled: boolean;
        url: string;
      };
      twitter?: {
        enabled: boolean;
        url: string;
      };
      youtube?: {
        enabled: boolean;
        url: string;
      };
    };
    announcement?: {
      enabled: boolean;
      variant: 'marquee' | 'vertical';
      speed: number;
      messagesEn: string[];
      messagesAr: string[];
    };
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    ipWhitelist: string[];
    rateLimitEnabled: boolean;
    rateLimitMaxRequests: number;
    rateLimitWindowMs: number;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    dailyReports: boolean;
  };
  seo: {
    metaDescriptionAr: string;
    metaDescriptionEn: string;
    keywords: string;
  };
  pagesContent: {
    contact: {
      heroTitleAr: string;
      heroTitleEn: string;
      heroDescriptionAr: string;
      heroDescriptionEn: string;
      addressAr: string;
      addressEn: string;
      addressDescriptionAr: string;
      addressDescriptionEn: string;
      workingHoursAr: string;
      workingHoursEn: string;
      workingHoursDescriptionAr: string;
      workingHoursDescriptionEn: string;
      emailDescriptionAr: string;
      emailDescriptionEn: string;
      whatsappDescriptionAr: string;
      whatsappDescriptionEn: string;
      whatsappButtonTextAr: string;
      whatsappButtonTextEn: string;
      whatsappMessageAr: string;
      whatsappMessageEn: string;
    };
    about: {
      heroTitleAr: string;
      heroTitleEn: string;
      heroSubtitleAr: string;
      heroSubtitleEn: string;
      heroDescriptionAr: string;
      heroDescriptionEn: string;
      storyTitleAr: string;
      storyTitleEn: string;
      storyContentAr: string;
      storyContentEn: string;
      storyImageTextAr: string;
      storyImageTextEn: string;
      storyImageSubtextAr: string;
      storyImageSubtextEn: string;
      featuresTitleAr: string;
      featuresTitleEn: string;
      featuresDescriptionAr: string;
      featuresDescriptionEn: string;
      features: Array<{
        titleAr: string;
        titleEn: string;
        descriptionAr: string;
        descriptionEn: string;
      }>;
      missionTitleAr: string;
      missionTitleEn: string;
      missionContentAr: string;
      missionContentEn: string;
      visionTitleAr: string;
      visionTitleEn: string;
      visionContentAr: string;
      visionContentEn: string;
      ctaTitleAr: string;
      ctaTitleEn: string;
      ctaDescriptionAr: string;
      ctaDescriptionEn: string;
      ctaButton1TextAr: string;
      ctaButton1TextEn: string;
      ctaButton2TextAr: string;
      ctaButton2TextEn: string;
    };
    terms: {
      heroTitleAr: string;
      heroTitleEn: string;
      heroDescriptionAr: string;
      heroDescriptionEn: string;
      termsTitleAr: string;
      termsTitleEn: string;
      termsLastUpdatedAr: string;
      termsLastUpdatedEn: string;
      termsSections: Array<{
        subtitleAr: string;
        subtitleEn: string;
        textAr: string;
        textEn: string;
      }>;
      privacyTitleAr: string;
      privacyTitleEn: string;
      privacyLastUpdatedAr: string;
      privacyLastUpdatedEn: string;
      privacySections: Array<{
        subtitleAr: string;
        subtitleEn: string;
        textAr: string;
        textEn: string;
      }>;
      contactTitleAr: string;
      contactTitleEn: string;
      contactDescriptionAr: string;
      contactDescriptionEn: string;
      importantNoticeTitleAr: string;
      importantNoticeTitleEn: string;
      importantNoticeTextAr: string;
      importantNoticeTextEn: string;
      backToRegistrationTextAr: string;
      backToRegistrationTextEn: string;
    };
  };
}

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<AdminSettings>({
    profile: {
      username: 'admin',
      email: 'ridaa.store.team@gmail.com',
      phone: '+20123456789',
      fullName: 'Store Administrator',
    },
    store: {
      name: 'Ridaa',
      nameAr: 'رِداء',
      description: 'Premium store',
      descriptionAr: 'متجر الأزياء الإسلامية المميز',
      address: 'Cairo, Egypt',
      phone: '+20123456789',
      email: 'ridaa.store.team@gmail.com',
      whatsapp: '+20123456789',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      shippingPrice: 50,
      instaPayNumber: '',
      instaPayAccountName: '',
      vodafoneNumber: '',
      showAdvertisements: true, // Default to showing advertisements
      socialMedia: {
        facebook: {
          enabled: true,
          url: 'https://www.facebook.com'
        },
        instagram: {
          enabled: true,
          url: 'https://www.instagram.com'
        },
        twitter: {
          enabled: true,
          url: 'https://www.twitter.com'
        },
        youtube: {
          enabled: true,
          url: 'https://www.youtube.com'
        }
      },
      announcement: {
        enabled: true,
        variant: 'marquee', // Default to horizontal marquee for continuous scrolling
        speed: 160,
        messagesEn: ['20% off your first order — Use code: FIRST20'],
        messagesAr: ['خصم 20% على أول طلب — استخدم الكود: FIRST20'],
      },
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      ipWhitelist: [],
      rateLimitEnabled: true,
      rateLimitMaxRequests: 1000,
      rateLimitWindowMs: 900000,
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      dailyReports: false,
    },
    seo: {
      metaDescriptionAr: 'تسوّق أونلاين أحدث الجلابيات المغربية والثياب العصرية الرجالية من رِداء. خامات فاخرة، تفصيل دقيق، وخيارات مقاسات وألوان تناسب كل المناسبات مع شحن سريع داخل مصر.',
      metaDescriptionEn: 'Shop premium Moroccan djellabas and modern modest wear for men at Ridaa. High‑quality fabrics, elegant tailoring and fast delivery across Egypt.',
      keywords: 'رِداء, رداء, جلابية مغربية, جلابيات رجالي, ملابس إسلامية, ثياب رجالية, djellaba, moroccan djellaba, islamic clothing, thobes, modest wear'
    },
    pagesContent: {
      contact: {
        heroTitleAr: 'اتصل بنا',
        heroTitleEn: 'Contact Us',
        heroDescriptionAr: 'نحن هنا لمساعدتك في أي وقت. تواصل معنا وسنكون سعداء لخدمتك',
        heroDescriptionEn: 'We are here to help you anytime. Contact us and we will be happy to serve you',
        addressAr: 'مصر',
        addressEn: 'Egypt',
        addressDescriptionAr: 'نحن موجودون في مصر',
        addressDescriptionEn: 'We are located in Egypt',
        workingHoursAr: '9:00 ص - 10:00 م',
        workingHoursEn: '9:00 AM - 10:00 PM',
        workingHoursDescriptionAr: 'من السبت إلى الخميس',
        workingHoursDescriptionEn: 'Saturday to Thursday',
        emailDescriptionAr: 'أرسل لنا رسالة',
        emailDescriptionEn: 'Send us a message',
        whatsappDescriptionAr: 'تواصل معنا مباشرة',
        whatsappDescriptionEn: 'Contact us directly',
        whatsappButtonTextAr: 'ابدأ المحادثة',
        whatsappButtonTextEn: 'Start Chat',
        whatsappMessageAr: 'مرحباً، أريد الاستفسار عن المنتجات',
        whatsappMessageEn: 'Hello, I want to inquire about products'
      },
      about: {
        heroTitleAr: 'من نحن',
        heroTitleEn: 'About Us',
        heroSubtitleAr: 'اكتشف قصة رِداء ورؤيتنا للأزياء العربية الأصيلة',
        heroSubtitleEn: 'Discover RIDAA\'s story and our vision for authentic Arabic fashion',
        heroDescriptionAr: '',
        heroDescriptionEn: '',
        storyTitleAr: 'قصتنا',
        storyTitleEn: 'Our Story',
        storyContentAr: 'رِداء هو وجهتك للأناقة الأصيلة والذوق الرفيع. نقدّم تصاميم تجمع بين الأصالة والحداثة ممزوجة بحب التفاصيل، مستوحاة من الهوية العربية وروح الفخامة الهادئة والتقاليد العريقة.\n\nفي رِداء، نؤمن أن اللباس تعبير عن الهوية والثقة، وأن كل قطعة تحمل رسالة، وأصالة، وبصمة فريدة لصاحبها.\n\nنحن ملتزمون بتقديم أعلى مستويات الجودة، مع خدمة شخصيّة وتجربة تليق بك كجزء من عائلة رداء.',
        storyContentEn: 'RIDAA is your destination for authentic elegance and refined taste. We offer designs that blend authenticity and modernism with a passion for details, inspired by rich Arabic identity and the spirit of timeless luxury.\n\nAt RIDAA, we believe clothing is an expression of identity and confidence, with every piece carrying a message, heritage, and a unique fingerprint for its owner.\n\nWe are committed to delivering top-notch quality, personal service, and an experience worthy of you as part of the RIDAA family.',
        storyImageTextAr: 'الهوية والثقة',
        storyImageTextEn: 'Identity & Confidence',
        storyImageSubtextAr: 'نصنع كل تصميم ليعكس شخصيتك ويلهم من حولك',
        storyImageSubtextEn: 'We craft each design to reflect your character and inspire those around you.',
        featuresTitleAr: 'لماذا تختار رِداء؟',
        featuresTitleEn: 'Why Choose RIDAA?',
        featuresDescriptionAr: 'نحن نقدم تجربة تسوق فريدة مع أعلى مستويات الجودة والخدمة والابتكار.',
        featuresDescriptionEn: 'We offer a unique shopping experience with the highest levels of quality, service, and innovation.',
        features: [
          {
            titleAr: 'عملاء سعداء',
            titleEn: 'Happy Customers',
            descriptionAr: 'أكثر من 10,000 عميل راضي',
            descriptionEn: 'Over 10,000 satisfied customers'
          },
          {
            titleAr: 'جودة عالية',
            titleEn: 'High Quality',
            descriptionAr: 'منتجات عالية الجودة فقط',
            descriptionEn: 'Only high quality products'
          },
          {
            titleAr: 'شغف بالتفاصيل',
            titleEn: 'Passion for Details',
            descriptionAr: 'نحن نهتم بكل التفاصيل',
            descriptionEn: 'We care about every detail'
          },
          {
            titleAr: 'توصيل لكل المحافظات',
            titleEn: 'Nationwide Delivery',
            descriptionAr: 'توصيل سريع وآمن لجميع محافظات مصر',
            descriptionEn: 'Fast, reliable delivery to all governorates in Egypt'
          }
        ],
        missionTitleAr: 'مهمتنا',
        missionTitleEn: 'Our Mission',
        missionContentAr: 'نهدف إلى إحياء أناقة وتقاليد التراث العربي العصري وتقديمها للعالم في قالب من الجودة والرقي.',
        missionContentEn: 'We aim to revive the elegance and traditions of modern Arab heritage, and present them to the world with quality and sophistication.',
        visionTitleAr: 'رؤيتنا',
        visionTitleEn: 'Our Vision',
        visionContentAr: 'أن نكون الوجهة الأولى للأزياء الراقية العربية والأصيلة عالمياً، وأن نوّصل فخامة ثقافتنا لكل عميل باحث عن التفرد.',
        visionContentEn: 'To be the foremost destination for elegant and authentic Arabic fashion globally, bringing the luxury of our culture to every client seeking uniqueness.',
        ctaTitleAr: 'انضم إلى رحلة الأناقة',
        ctaTitleEn: 'Join the Elegance Journey',
        ctaDescriptionAr: 'اكتشف مجموعتنا المميزة من الأزياء العربية الأصيلة واختر ما يناسبك واقتنِ الجودة التي تستحقها.',
        ctaDescriptionEn: 'Discover our exclusive collection of authentic Arabic fashion and choose what suits you and experience the quality you deserve.',
        ctaButton1TextAr: 'تصفح المنتجات',
        ctaButton1TextEn: 'Browse Products',
        ctaButton2TextAr: 'تواصل معنا',
        ctaButton2TextEn: 'Contact Us'
      },
      terms: {
        heroTitleAr: 'الشروط وسياسة الخصوصية',
        heroTitleEn: 'Terms & Privacy Policy',
        heroDescriptionAr: 'اقرأ شروط الاستخدام وسياسة الخصوصية الخاصة بنا',
        heroDescriptionEn: 'Read our terms of use and privacy policy',
        termsTitleAr: 'شروط وأحكام الاستخدام',
        termsTitleEn: 'Terms and Conditions',
        termsLastUpdatedAr: 'آخر تحديث: 2025',
        termsLastUpdatedEn: 'Last Updated: 2025',
        termsSections: [
          {
            subtitleAr: '1. القبول',
            subtitleEn: '1. Acceptance',
            textAr: 'باستخدام موقع رِداء، أنت توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام موقعنا.',
            textEn: 'By using the RIDAA website, you agree to be bound by these terms and conditions. If you do not agree to any part of these terms, please do not use our website.'
          },
          {
            subtitleAr: '2. استخدام الموقع',
            subtitleEn: '2. Use of the Website',
            textAr: 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.',
            textEn: 'You are responsible for maintaining the confidentiality of your account information and password.'
          },
          {
            subtitleAr: '3. المنتجات والأسعار',
            subtitleEn: '3. Products and Pricing',
            textAr: 'نحتفظ بالحق في تغيير الأسعار والمعلومات المتعلقة بالمنتجات في أي وقت دون إشعار مسبق. جميع الصور والنصوص هي لأغراض توضيحية وقد تختلف عن المنتج الفعلي.',
            textEn: 'We reserve the right to change prices and product information at any time without prior notice. All images and descriptions are for illustrative purposes and may differ from the actual product.'
          },
          {
            subtitleAr: '4. الطلبات والدفع',
            subtitleEn: '4. Orders and Payment',
            textAr: 'عند تقديم طلب، فإنك توافق على شراء المنتجات بالأسعار المذكورة. جميع المدفوعات تتم بشكل آمن من خلال أنظمة الدفع المعتمدة.',
            textEn: 'By placing an order, you agree to purchase products at the stated prices. All payments are processed securely through approved payment systems.'
          },
          {
            subtitleAr: '5. الشحن والتسليم',
            subtitleEn: '5. Shipping and Delivery',
            textAr: 'نوفر خدمة الشحن لجميع محافظات مصر. وقت التسليم التقريبي يتراوح بين 3-7 أيام عمل حسب الموقع. قد تتغير التواريخ بسبب ظروف خارجة عن إرادتنا.',
            textEn: 'We provide shipping services to all governorates in Egypt. Estimated delivery time ranges from 3-7 business days depending on location. Delivery dates may change due to circumstances beyond our control.'
          },
          {
            subtitleAr: '6. الإرجاع والاستبدال',
            subtitleEn: '6. Returns and Exchanges',
            textAr: 'يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون في حالتها الأصلية وبلا ضرر. بعض المنتجات قد لا تكون قابلة للإرجاع.',
            textEn: 'You may return products within 14 days of receipt, provided they are in their original condition and undamaged. Some products may not be returnable.'
          },
          {
            subtitleAr: '7. الملكية الفكرية',
            subtitleEn: '7. Intellectual Property',
            textAr: 'جميع محتويات الموقع بما في ذلك النصوص والصور والشعارات محمية بحقوق الطبع والنشر. يحظر استخدام أو نسخ أي محتوى دون إذن كتابي.',
            textEn: 'All website content including text, images, and logos are protected by copyright. Use or reproduction of any content without written permission is prohibited.'
          },
          {
            subtitleAr: '8. التعديلات',
            subtitleEn: '8. Modifications',
            textAr: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. يُنصح بمراجعة هذه الصفحة بانتظام.',
            textEn: 'We reserve the right to modify these terms and conditions at any time. It is recommended to review this page regularly.'
          }
        ],
        privacyTitleAr: 'سياسة الخصوصية',
        privacyTitleEn: 'Privacy Policy',
        privacyLastUpdatedAr: 'آخر تحديث: 2025',
        privacyLastUpdatedEn: 'Last Updated: 2025',
        privacySections: [
          {
            subtitleAr: '1. المعلومات التي نجمعها',
            subtitleEn: '1. Information We Collect',
            textAr: 'نجمع المعلومات التي تقدمها لنا مباشرة مثل الاسم، البريد الإلكتروني، رقم الهاتف، والعنوان عند إتمام عملية الشراء.',
            textEn: 'We collect information you provide directly to us such as name, email, phone number, and address when completing a purchase.'
          },
          {
            subtitleAr: '2. استخدام المعلومات',
            subtitleEn: '2. How We Use Information',
            textAr: 'نستخدم المعلومات التي نجمعها لمعالجة الطلبات، التواصل معك، تحسين خدماتنا، وإرسال التحديثات والعروض الخاصة (إذا وافقت على ذلك).',
            textEn: 'We use the information we collect to process orders, communicate with you, improve our services, and send updates and special offers (if you have agreed to this).'
          },
          {
            subtitleAr: '3. حماية المعلومات',
            subtitleEn: '3. Information Protection',
            textAr: 'نتخذ تدابير أمنية قوية لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف. جميع المعاملات تتم عبر قنوات آمنة.',
            textEn: 'We implement strong security measures to protect your personal information from unauthorized access, alteration, or disclosure. All transactions are conducted through secure channels.'
          },
          {
            subtitleAr: '4. مشاركة المعلومات',
            subtitleEn: '4. Information Sharing',
            textAr: 'لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات مع شركاء الشحن وخدمات الدفع فقط لتنفيذ طلباتك.',
            textEn: 'We do not sell or rent your personal information to third parties. We may share information with shipping partners and payment services only to fulfill your orders.'
          },
          {
            subtitleAr: '5. ملفات تعريف الارتباط (Cookies)',
            subtitleEn: '5. Cookies',
            textAr: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا، تتبع سلوك الشراء، وتخصيص المحتوى. يمكنك إدارة ملفات تعريف الارتباط من إعدادات المتصفح.',
            textEn: 'We use cookies to enhance your experience on our website, track purchasing behavior, and personalize content. You can manage cookies through your browser settings.'
          },
          {
            subtitleAr: '6. حقوقك',
            subtitleEn: '6. Your Rights',
            textAr: 'لديك الحق في الوصول إلى معلوماتك الشخصية، تحديثها، أو حذفها في أي وقت. يمكنك أيضاً إلغاء الاشتراك في رسائل البريد الإلكتروني التسويقية.',
            textEn: 'You have the right to access, update, or delete your personal information at any time. You can also unsubscribe from marketing emails.'
          },
          {
            subtitleAr: '7. روابط خارجية',
            subtitleEn: '7. External Links',
            textAr: 'قد يحتوي موقعنا على روابط لمواقع خارجية. نحن لسنا مسؤولين عن ممارسات الخصوصية لتلك المواقع.',
            textEn: 'Our website may contain links to external sites. We are not responsible for the privacy practices of those websites.'
          },
          {
            subtitleAr: '8. التغييرات على السياسة',
            subtitleEn: '8. Policy Changes',
            textAr: 'قد نحدث سياسة الخصوصية هذه من وقت لآخر. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.',
            textEn: 'We may update this privacy policy from time to time. You will be notified of any significant changes via email or a notice on the website.'
          }
        ],
        contactTitleAr: 'هل لديك أسئلة؟',
        contactTitleEn: 'Have Questions?',
        contactDescriptionAr: 'إذا كان لديك أي استفسارات حول شروط الاستخدام أو سياسة الخصوصية، يرجى التواصل معنا',
        contactDescriptionEn: 'If you have any questions about our terms or privacy policy, please contact us',
        importantNoticeTitleAr: 'مهم',
        importantNoticeTitleEn: 'Important Notice',
        importantNoticeTextAr: 'باستخدام موقع رِداء وخدماته، فإنك تقر بأنك قد قرأت وفهمت ووافقت على هذه الشروط والأحكام وسياسة الخصوصية. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام موقعنا.',
        importantNoticeTextEn: 'By using the RIDAA website and its services, you acknowledge that you have read, understood, and agree to these terms and conditions and privacy policy. If you do not agree to these terms, please do not use our website.',
        backToRegistrationTextAr: 'العودة إلى صفحة التسجيل',
        backToRegistrationTextEn: 'Back to Registration'
      }
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[Settings Page] Response data:', data);
        
        // Handle structured response format: {success: true, data: {settings: {...}}}
        let settingsData: AdminSettings | null = null;
        if (data.success && data.data) {
          // New structured format
          settingsData = data.data.settings || data.data;
        } else if (data.settings) {
          // Old format fallback
          settingsData = data.settings;
        }
        
        if (settingsData) {
          console.log('[Settings Page] Extracted settings:', settingsData);
          
          // Ensure all nested objects are properly initialized to avoid uncontrolled input warnings
          const normalizedSettings: AdminSettings = {
            profile: {
              username: settingsData.profile?.username || '',
              email: settingsData.profile?.email || '',
              phone: settingsData.profile?.phone || '',
              fullName: settingsData.profile?.fullName || '',
            },
            store: {
              name: settingsData.store?.name || '',
              nameAr: settingsData.store?.nameAr || '',
              description: settingsData.store?.description || '',
              descriptionAr: settingsData.store?.descriptionAr || '',
              address: settingsData.store?.address || '',
              phone: settingsData.store?.phone || '',
              email: settingsData.store?.email || '',
              whatsapp: settingsData.store?.whatsapp || '',
              currency: settingsData.store?.currency || 'EGP',
              timezone: settingsData.store?.timezone || 'Africa/Cairo',
              shippingPrice: typeof settingsData.store?.shippingPrice === 'number' && !isNaN(settingsData.store.shippingPrice) ? settingsData.store.shippingPrice : 0,
              instaPayNumber: settingsData.store?.instaPayNumber || '',
              instaPayAccountName: settingsData.store?.instaPayAccountName || '',
              vodafoneNumber: settingsData.store?.vodafoneNumber || '',
              showAdvertisements: settingsData.store?.showAdvertisements !== undefined ? settingsData.store.showAdvertisements : true,
              socialMedia: {
                facebook: settingsData.store?.socialMedia?.facebook || { enabled: false, url: '' },
                instagram: settingsData.store?.socialMedia?.instagram || { enabled: false, url: '' },
                twitter: settingsData.store?.socialMedia?.twitter || { enabled: false, url: '' },
                youtube: settingsData.store?.socialMedia?.youtube || { enabled: false, url: '' },
              },
              announcement: {
                enabled: settingsData.store?.announcement?.enabled || false,
                variant: settingsData.store?.announcement?.variant || 'marquee', // Default to horizontal marquee
                speed: typeof settingsData.store?.announcement?.speed === 'number' && !isNaN(settingsData.store.announcement.speed) ? settingsData.store.announcement.speed : 160,
                messagesEn: settingsData.store?.announcement?.messagesEn || [],
                messagesAr: settingsData.store?.announcement?.messagesAr || [],
              },
            },
            security: {
              twoFactorEnabled: settingsData.security?.twoFactorEnabled || false,
              sessionTimeout: typeof settingsData.security?.sessionTimeout === 'number' && !isNaN(settingsData.security.sessionTimeout) ? settingsData.security.sessionTimeout : 24,
              maxLoginAttempts: typeof settingsData.security?.maxLoginAttempts === 'number' && !isNaN(settingsData.security.maxLoginAttempts) ? settingsData.security.maxLoginAttempts : 5,
              passwordExpiry: typeof settingsData.security?.passwordExpiry === 'number' && !isNaN(settingsData.security.passwordExpiry) ? settingsData.security.passwordExpiry : 90,
              ipWhitelist: settingsData.security?.ipWhitelist || [],
              rateLimitEnabled: settingsData.security?.rateLimitEnabled !== undefined ? settingsData.security.rateLimitEnabled : true,
              rateLimitMaxRequests: typeof settingsData.security?.rateLimitMaxRequests === 'number' && !isNaN(settingsData.security.rateLimitMaxRequests) ? settingsData.security.rateLimitMaxRequests : 100,
              rateLimitWindowMs: typeof settingsData.security?.rateLimitWindowMs === 'number' && !isNaN(settingsData.security.rateLimitWindowMs) ? settingsData.security.rateLimitWindowMs : 900000,
            },
            notifications: {
              emailNotifications: settingsData.notifications?.emailNotifications !== undefined ? settingsData.notifications.emailNotifications : true,
              orderNotifications: settingsData.notifications?.orderNotifications !== undefined ? settingsData.notifications.orderNotifications : true,
              lowStockAlerts: settingsData.notifications?.lowStockAlerts !== undefined ? settingsData.notifications.lowStockAlerts : true,
              dailyReports: settingsData.notifications?.dailyReports || false,
            },
            seo: {
              metaDescriptionAr: settingsData.seo?.metaDescriptionAr || 'تسوّق أونلاين أحدث الجلابيات المغربية والثياب العصرية الرجالية من رِداء. خامات فاخرة، تفصيل دقيق، وخيارات مقاسات وألوان تناسب كل المناسبات مع شحن سريع داخل مصر.',
              metaDescriptionEn: settingsData.seo?.metaDescriptionEn || 'Shop premium Moroccan djellabas and modern modest wear for men at Ridaa. High‑quality fabrics, elegant tailoring and fast delivery across Egypt.',
              keywords: settingsData.seo?.keywords || 'رِداء, رداء, جلابية مغربية, جلابيات رجالي, ملابس إسلامية, ثياب رجالية, djellaba, moroccan djellaba, islamic clothing, thobes, modest wear',
            },
            pagesContent: settingsData.pagesContent || settings.pagesContent,
          };
          
          setSettings(normalizedSettings);
        } else {
          console.warn('[Settings Page] No settings data found in response');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Settings Page] Failed to fetch settings:', response.status, errorData);
      }
    } catch (error) {
      console.error('[Settings Page] Error fetching settings:', error);
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activePageContentTab, setActivePageContentTab] = useState<'contact' | 'about' | 'terms'>('contact');

  const tabs = [
    { id: 'profile', name: t('admin.profile'), icon: User },
    { id: 'store', name: t('admin.storeSettings'), icon: SettingsIcon },
    { id: 'seo', name: 'SEO & Google', icon: Globe },
    { id: 'pages', name: language === 'ar' ? 'محتوى الصفحات' : 'Pages Content', icon: FileText },
    { id: 'security', name: t('admin.security'), icon: Shield },
    { id: 'notifications', name: t('admin.notifications'), icon: Bell },
  ];

  const handleNotificationToggle = async (key: string, enabled: boolean) => {
    if (!enabled) return; // Only send email when enabling
    
    try {
      const notificationNames: Record<string, { ar: string; en: string }> = {
        emailNotifications: { ar: 'إشعارات البريد الإلكتروني', en: 'Email Notifications' },
        orderNotifications: { ar: 'إشعارات الطلبات', en: 'Order Notifications' },
        lowStockAlerts: { ar: 'تنبيهات نفاد المخزون', en: 'Low Stock Alerts' },
        dailyReports: { ar: 'التقارير اليومية', en: 'Daily Reports' },
      };

      const notificationName = notificationNames[key as keyof typeof notificationNames] || { ar: key, en: key };
      const adminEmail = settings.profile.email || 'ridaa.store.team@gmail.com';
      
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: adminEmail,
          subject: language === 'ar' 
            ? `تم تفعيل ${notificationName.ar} - رِداء`
            : `${notificationName.en} Enabled - Ridaa`,
          text: language === 'ar'
            ? `تم تفعيل ${notificationName.ar} بنجاح.\n\nستتلقى الآن إشعارات على البريد الإلكتروني: ${adminEmail}\n\nشكراً لاستخدامك رِداء!`
            : `${notificationName.en} has been enabled successfully.\n\nYou will now receive notifications at: ${adminEmail}\n\nThank you for using Ridaa!`,
          html: language === 'ar'
            ? `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #DAA520; margin-bottom: 20px;">تم تفعيل ${notificationName.ar}</h2>
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
                    تم تفعيل ${notificationName.ar} بنجاح.
                  </p>
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
                    ستتلقى الآن إشعارات على البريد الإلكتروني: <strong>${adminEmail}</strong>
                  </p>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      شكراً لاستخدامك رِداء!<br>
                      Ridaa Store Team
                    </p>
                  </div>
                </div>
              </div>
            `
            : `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #DAA520; margin-bottom: 20px;">${notificationName.en} Enabled</h2>
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
                    ${notificationName.en} has been enabled successfully.
                  </p>
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
                    You will now receive notifications at: <strong>${adminEmail}</strong>
                  </p>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                      Thank you for using Ridaa!<br>
                      Ridaa Store Team
                    </p>
                  </div>
                </div>
              </div>
            `,
        }),
      });

      if (emailResponse.ok) {
        console.log(`✅ Test email sent for ${key} notification`);
      } else {
        console.error(`❌ Failed to send test email for ${key}`);
      }
    } catch (error) {
      console.error('Error sending notification test email:', error);
    }
  };

  const handleSaveSettings = async (section: keyof AdminSettings) => {
    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error',
        3000
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          section, 
          data: settings[section],
          csrfToken,
        }),
      });
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        // Handle structured response format
        const successMessage = data.success && data.message 
          ? data.message 
          : (language === 'ar' 
            ? `تم حفظ إعدادات ${section === 'store' ? 'المتجر' : section === 'profile' ? 'الملف الشخصي' : section === 'security' ? 'الأمان' : section === 'seo' ? 'SEO' : 'الإشعارات'} بنجاح!`
            : `Successfully saved ${section} settings!`);
        
        showToast(successMessage, 'success', 3000);
        
        // Notify other windows/components that settings were updated
        if (section === 'store') {
          // Dispatch custom event to refresh announcement bar
          window.dispatchEvent(new CustomEvent('storeSettingsUpdated'));
          // Also use localStorage for cross-tab communication
          localStorage.setItem('storeSettingsUpdated', Date.now().toString());
        }
        
        // Update settings from response if available (avoids full page reload)
        // This preserves activeTab and scroll position
        if (data.success && data.data && data.data.settings) {
          const updatedSettingsData = data.data.settings;
          
          // Normalize the updated section data (same logic as fetchSettings)
          if (section === 'store' && updatedSettingsData.store) {
            const storeData = updatedSettingsData.store;
            setSettings(prev => ({
              ...prev,
              store: {
                ...prev.store,
                ...storeData,
                socialMedia: {
                  facebook: storeData.socialMedia?.facebook || prev.store.socialMedia?.facebook || { enabled: false, url: '' },
                  instagram: storeData.socialMedia?.instagram || prev.store.socialMedia?.instagram || { enabled: false, url: '' },
                  twitter: storeData.socialMedia?.twitter || prev.store.socialMedia?.twitter || { enabled: false, url: '' },
                  youtube: storeData.socialMedia?.youtube || prev.store.socialMedia?.youtube || { enabled: false, url: '' },
                },
                announcement: storeData.announcement || prev.store.announcement || {
                  enabled: false,
                  variant: 'marquee',
                  speed: 160,
                  messagesEn: [],
                  messagesAr: [],
                },
              }
            }));
          } else if (section === 'profile' && updatedSettingsData.profile) {
            // For profile section, update with proper normalization
            const profileData = updatedSettingsData.profile;
            setSettings(prev => ({
              ...prev,
              profile: {
                username: profileData.username || prev.profile.username || '',
                email: profileData.email || prev.profile.email || '',
                phone: profileData.phone || prev.profile.phone || '',
                fullName: profileData.fullName || prev.profile.fullName || '',
              }
            }));
          } else if (updatedSettingsData[section]) {
            // For other sections, update directly
            setSettings(prev => ({
              ...prev,
              [section]: updatedSettingsData[section]
            }));
          }
        } else {
          // Fallback: only refresh if response doesn't contain updated settings
          // This preserves activeTab and scroll position
          const currentTab = activeTab;
          fetchSettings().then(() => {
            setActiveTab(currentTab);
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.success === false && errorData.error
          ? errorData.error
          : (language === 'ar' 
            ? 'حدث خطأ أثناء حفظ الإعدادات'
            : 'Error saving settings');
        showToast(errorMessage, 'error', 4000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = language === 'ar' 
        ? 'حدث خطأ أثناء حفظ الإعدادات'
        : 'Error saving settings';
      showToast(errorMessage, 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast(t('admin.passwordMismatch'), 'error', 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast(t('admin.passwordTooShort'), 'error', 3000);
      return;
    }

    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error',
        3000
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...passwordData,
          csrfToken,
        }),
      });
      
      if (response.ok) {
        showToast(t('admin.passwordChanged'), 'success', 3000);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        showToast(data.error || t('admin.passwordChangeError'), 'error', 4000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(t('admin.passwordChangeError'), 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.profileInformation')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.username')}
            </label>
            <input
              id="profile-username"
              name="profile-username"
              type="text"
              value={settings.profile.username}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, username: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.fullName')}
            </label>
            <input
              id="profile-fullName"
              name="profile-fullName"
              type="text"
              value={settings.profile.fullName}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, fullName: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.email')}
            </label>
            <input
              id="profile-email"
              name="profile-email"
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.phone')}
            </label>
            <input
              id="profile-phone"
              name="profile-phone"
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSaveSettings('profile')}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الملف الشخصي' : 'Save Profile')}
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.changePassword')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.currentPassword')}
            </label>
            <div className="relative">
              <input
                id="current-password"
                name="current-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.newPassword')}
            </label>
            <input
              id="new-password"
              name="new-password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({
                ...passwordData,
                newPassword: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.confirmPassword')}
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handlePasswordChange}
            disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <Key className="w-4 h-4 mr-2" />
            {isLoading ? t('admin.changing') : t('admin.changePassword')}
          </button>
        </div>
      </div>
    </div>
  );

  function renderStoreTab() {
    const content = (
      <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.storeInformation')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storeName')} (English)
            </label>
            <input
              id="store-name"
              name="store-name"
              type="text"
              value={settings.store.name}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storeName')} (العربية)
            </label>
            <input
              id="store-nameAr"
              name="store-nameAr"
              type="text"
              value={settings.store.nameAr}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, nameAr: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="rtl"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storeDescription')} (English)
            </label>
            <textarea
              id="store-description"
              name="store-description"
              value={settings.store.description}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, description: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storeDescription')} (العربية)
            </label>
            <textarea
              id="store-descriptionAr"
              name="store-descriptionAr"
              value={settings.store.descriptionAr}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, descriptionAr: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="rtl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storePhone')}
            </label>
            <input
              id="store-phone"
              name="store-phone"
              type="tel"
              value={settings.store.phone}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.storeEmail')}
            </label>
            <input
              id="store-email"
              name="store-email"
              type="email"
              value={settings.store.email}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.whatsappNumber')}
            </label>
            <input
              id="store-whatsapp"
              name="store-whatsapp"
              type="tel"
              value={settings.store.whatsapp}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, whatsapp: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.currency')}
            </label>
            <select
              id="store-currency"
              name="store-currency"
              value={settings.store.currency}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, currency: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="EGP">Egyptian Pound (EGP)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="SAR">Saudi Riyal (SAR)</option>
              <option value="AED">UAE Dirham (AED)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'سعر الشحن (جنيه)' : 'Shipping Price (EGP)'}
            </label>
            <input
              id="store-shippingPrice"
              name="store-shippingPrice"
              type="number"
              value={settings.store.shippingPrice || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSettings({
                  ...settings,
                  store: { ...settings.store, shippingPrice: isNaN(val) ? 0 : val }
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="50"
            />
          </div>
        </div>

                     <div className="mt-8">
                       <h3 className="text-lg font-medium text-gray-900 mb-4">
                         {language === 'ar' ? 'إعدادات الإعلانات الرئيسية' : 'Hero Advertisements Settings'}
                       </h3>
                       <div className="space-y-6">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="text-sm font-medium text-gray-900">
                               {language === 'ar' ? 'إظهار الإعلانات' : 'Show Advertisements'}
                             </h4>
                             <p className="text-sm text-gray-500">
                               {language === 'ar' ? 'إظهار/إخفاء سلايد الإعلانات في الصفحة الرئيسية' : 'Show/Hide the hero advertisement slider on homepage'}
                             </p>
                           </div>
                           <button
                             onClick={() => setSettings(prev => ({
                               ...prev,
                               store: {
                                 ...prev.store,
                                 showAdvertisements: !prev.store.showAdvertisements
                               }
                             }))}
                             type="button"
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                               settings.store.showAdvertisements !== false ? 'bg-primary-600' : 'bg-gray-200'
                             }`}
                           >
                             <span
                               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                 settings.store.showAdvertisements !== false ? 'translate-x-6' : 'translate-x-1'
                               }`}
                             />
                           </button>
                         </div>
                       </div>
                     </div>

                     <div className="mt-8">
                       <h3 className="text-lg font-medium text-gray-900 mb-4">
                         {language === 'ar' ? 'إعدادات شريط الإعلانات' : 'Announcement Bar Settings'}
                       </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {language === 'ar' ? 'تفعيل الشريط' : 'Enable Bar'}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'إظهار/إخفاء شريط الإعلانات في الموقع' : 'Show/Hide the announcement bar sitewide'}
                </p>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    announcement: {
                      ...settings.store.announcement!,
                      enabled: !settings.store.announcement?.enabled,
                    }
                  }
                })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-md ${settings.store.announcement?.enabled ? 'bg-[#DAA520] hover:bg-[#B8860B]' : 'bg-gray-300 hover:bg-gray-400'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.store.announcement?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'النمط' : 'Variant'}
                </label>
                <select
                  value={settings.store.announcement?.variant || 'vertical'}
                  onChange={(e) => setSettings({
                    ...settings,
                    store: {
                      ...settings.store,
                      announcement: { ...settings.store.announcement!, variant: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="vertical">{language === 'ar' ? 'رأسي (من أسفل لأعلى)' : 'Vertical (bottom to top)'}</option>
                  <option value="marquee">{language === 'ar' ? 'أفقي مستمر' : 'Horizontal Marquee'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السرعة' : 'Speed'}
                </label>
                <input
                  type="number"
                  min={40}
                  max={400}
                  value={settings.store.announcement?.speed || 160}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        announcement: { ...settings.store.announcement!, speed: isNaN(val) ? 160 : val }
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'رسائل الإعلان (إنجليزي) — كل سطر رسالة' : 'Announcement Messages (English) — one per line'}
              </label>
              <textarea
                rows={6}
                value={(settings.store.announcement?.messagesEn || []).join('\n')}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSettings({
                    ...settings,
                    store: { 
                      ...settings.store, 
                      announcement: { 
                        ...settings.store.announcement!, 
                        messagesEn: newValue.split('\n').filter(line => line.trim() !== '' || newValue.split('\n').length === 1)
                      } 
                    }
                  });
                }}
                onKeyDown={(e) => {
                  // Allow Shift+Enter to create new line
                  if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    const newValue = value.substring(0, start) + '\n' + value.substring(end);
                    const newSelectionStart = start + 1;
                    
                    setSettings({
                      ...settings,
                      store: { 
                        ...settings.store, 
                        announcement: { 
                          ...settings.store.announcement!, 
                          messagesEn: newValue.split('\n').filter(line => line.trim() !== '' || newValue.split('\n').length === 1)
                        } 
                      }
                    });
                    
                    // Restore cursor position
                    setTimeout(() => {
                      textarea.setSelectionRange(newSelectionStart, newSelectionStart);
                    }, 0);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                placeholder={language === 'ar' ? 'اكتب رسالة واحدة في كل سطر... اضغط Shift+Enter للسطر الجديد' : 'Type one message per line... Press Shift+Enter for new line'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'رسائل الإعلان (العربية) — كل سطر رسالة' : 'Announcement Messages (Arabic) — one per line'}
              </label>
              <textarea
                rows={6}
                dir="rtl"
                value={(settings.store.announcement?.messagesAr || []).join('\n')}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSettings({
                    ...settings,
                    store: { 
                      ...settings.store, 
                      announcement: { 
                        ...settings.store.announcement!, 
                        messagesAr: newValue.split('\n').filter(line => line.trim() !== '' || newValue.split('\n').length === 1)
                      } 
                    }
                  });
                }}
                onKeyDown={(e) => {
                  // Allow Shift+Enter to create new line
                  if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    const newValue = value.substring(0, start) + '\n' + value.substring(end);
                    const newSelectionStart = start + 1;
                    
                    setSettings({
                      ...settings,
                      store: { 
                        ...settings.store, 
                        announcement: { 
                          ...settings.store.announcement!, 
                          messagesAr: newValue.split('\n').filter(line => line.trim() !== '' || newValue.split('\n').length === 1)
                        } 
                      }
                    });
                    
                    // Restore cursor position
                    setTimeout(() => {
                      textarea.setSelectionRange(newSelectionStart, newSelectionStart);
                    }, 0);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                placeholder={language === 'ar' ? 'اكتب رسالة واحدة في كل سطر... اضغط Shift+Enter للسطر الجديد' : 'Type one message per line... Press Shift+Enter for new line'}
              />
            </div>
          </div>
        </div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {language === 'ar' ? 'إعدادات الدفع' : 'Payment Settings'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'رقم إنستا باي' : 'InstaPay Number'}
              </label>
              <input
                type="text"
                value={settings.store.instaPayNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, instaPayNumber: e.target.value }
                })}
                placeholder={language === 'ar' ? 'مثال: 01234567890' : 'Example: 01234567890'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? 'سيظهر هذا الرقم للعملاء عند اختيار الدفع عبر إنستا باي' : 'This number will be shown to customers when they select InstaPay payment'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'اسم حساب إنستا باي' : 'InstaPay Account Name'}
              </label>
              <input
                type="text"
                value={settings.store.instaPayAccountName || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, instaPayAccountName: e.target.value }
                })}
                placeholder={language === 'ar' ? 'مثال: شركة رِداء' : 'Example: RIDAA Company'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? 'سيظهر اسم الحساب تحت رقم الحساب' : 'Account name will be shown below the account number'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'رقم فودافون كاش' : 'Vodafone Cash Number'}
              </label>
              <input
                type="text"
                value={settings.store.vodafoneNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  store: { ...settings.store, vodafoneNumber: e.target.value }
                })}
                placeholder={language === 'ar' ? 'مثال: 01234567890' : 'Example: 01234567890'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? 'سيظهر هذا الرقم للعملاء عند اختيار الدفع عبر فودافون كاش' : 'This number will be shown to customers when they select Vodafone Cash payment'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Social Media Settings */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {language === 'ar' ? 'إعدادات وسائل التواصل الاجتماعي' : 'Social Media Settings'}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {/* Facebook */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.store.socialMedia?.facebook?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        socialMedia: {
                          ...settings.store.socialMedia,
                          facebook: {
                            ...settings.store.socialMedia?.facebook,
                            enabled: e.target.checked,
                            url: settings.store.socialMedia?.facebook?.url || 'https://www.facebook.com'
                          }
                        }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DAA520]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA520]"></div>
                </label>
              </div>
              <input
                type="url"
                value={settings.store.socialMedia?.facebook?.url || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    socialMedia: {
                      ...settings.store.socialMedia,
                      facebook: {
                        enabled: settings.store.socialMedia?.facebook?.enabled ?? true,
                        url: e.target.value
                      }
                    }
                  }
                })}
                placeholder="https://www.facebook.com/your-page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Instagram */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-full flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Instagram</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.store.socialMedia?.instagram?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        socialMedia: {
                          ...settings.store.socialMedia,
                          instagram: {
                            ...settings.store.socialMedia?.instagram,
                            enabled: e.target.checked,
                            url: settings.store.socialMedia?.instagram?.url || 'https://www.instagram.com'
                          }
                        }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DAA520]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA520]"></div>
                </label>
              </div>
              <input
                type="url"
                value={settings.store.socialMedia?.instagram?.url || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    socialMedia: {
                      ...settings.store.socialMedia,
                      instagram: {
                        enabled: settings.store.socialMedia?.instagram?.enabled ?? true,
                        url: e.target.value
                      }
                    }
                  }
                })}
                placeholder="https://www.instagram.com/your-profile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Twitter */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Twitter</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.store.socialMedia?.twitter?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        socialMedia: {
                          ...settings.store.socialMedia,
                          twitter: {
                            ...settings.store.socialMedia?.twitter,
                            enabled: e.target.checked,
                            url: settings.store.socialMedia?.twitter?.url || 'https://www.twitter.com'
                          }
                        }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DAA520]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA520]"></div>
                </label>
              </div>
              <input
                type="url"
                value={settings.store.socialMedia?.twitter?.url || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    socialMedia: {
                      ...settings.store.socialMedia,
                      twitter: {
                        enabled: settings.store.socialMedia?.twitter?.enabled ?? true,
                        url: e.target.value
                      }
                    }
                  }
                })}
                placeholder="https://www.twitter.com/your-profile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* YouTube */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">YouTube</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.store.socialMedia?.youtube?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        socialMedia: {
                          ...settings.store.socialMedia,
                          youtube: {
                            ...settings.store.socialMedia?.youtube,
                            enabled: e.target.checked,
                            url: settings.store.socialMedia?.youtube?.url || 'https://www.youtube.com'
                          }
                        }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DAA520]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA520]"></div>
                </label>
              </div>
              <input
                type="url"
                value={settings.store.socialMedia?.youtube?.url || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    socialMedia: {
                      ...settings.store.socialMedia,
                      youtube: {
                        enabled: settings.store.socialMedia?.youtube?.enabled ?? true,
                        url: e.target.value
                      }
                    }
                  }
                })}
                placeholder="https://www.youtube.com/your-channel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSaveSettings('store')}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
          </button>
        </div>
      </div>
    );
    return content;
  }

  function renderSeoTab() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {language === 'ar' ? 'إعدادات SEO و Google' : 'SEO & Google Settings'}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {language === 'ar' 
              ? 'هذه الإعدادات تتحكم في كيفية ظهور موقعك في محركات البحث مثل Google. الوصف الذي تكتبه هنا سيظهر تحت عنوان موقعك في نتائج البحث.'
              : 'These settings control how your site appears in search engines like Google. The description you write here will appear under your site title in search results.'}
          </p>
          
          <div className="space-y-6">
            {/* Meta Description Arabic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'وصف الموقع (Meta Description) - عربي' : 'Site Description (Meta Description) - Arabic'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {language === 'ar' 
                  ? 'يُنصح أن يكون بين 120-160 حرفاً. هذا الوصف سيظهر في نتائج Google.'
                  : 'Recommended: 120-160 characters. This description will appear in Google search results.'}
              </p>
              <textarea
                value={settings.seo.metaDescriptionAr}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaDescriptionAr: e.target.value }
                })}
                rows={4}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                dir="rtl"
                placeholder={language === 'ar' ? 'اكتب وصف موقعك بالعربية...' : 'Write your site description in Arabic...'}
              />
              <p className="text-xs text-gray-400 mt-1">
                {settings.seo.metaDescriptionAr.length} / 160 {language === 'ar' ? 'حرف' : 'characters'}
              </p>
            </div>
            
            {/* Meta Description English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'وصف الموقع (Meta Description) - إنجليزي' : 'Site Description (Meta Description) - English'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {language === 'ar' 
                  ? 'يُنصح أن يكون بين 120-160 حرفاً. هذا الوصف سيظهر في نتائج Google.'
                  : 'Recommended: 120-160 characters. This description will appear in Google search results.'}
              </p>
              <textarea
                value={settings.seo.metaDescriptionEn}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaDescriptionEn: e.target.value }
                })}
                rows={4}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={language === 'ar' ? 'Write your site description in English...' : 'Write your site description in English...'}
              />
              <p className="text-xs text-gray-400 mt-1">
                {settings.seo.metaDescriptionEn.length} / 160 {language === 'ar' ? 'حرف' : 'characters'}
              </p>
            </div>
            
            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الكلمات المفتاحية (Keywords)' : 'Keywords'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {language === 'ar' 
                  ? 'اكتب الكلمات المفتاحية مفصولة بفواصل. مثال: جلابية مغربية, ملابس إسلامية, djellaba'
                  : 'Enter keywords separated by commas. Example: moroccan djellaba, islamic clothing, djellaba'}
              </p>
              <input
                type="text"
                value={settings.seo.keywords}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, keywords: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={language === 'ar' ? 'رِداء, جلابية مغربية, ملابس إسلامية...' : 'Ridaa, moroccan djellaba, islamic clothing...'}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSaveSettings('seo')}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات SEO' : 'Save SEO Settings')}
          </button>
        </div>
      </div>
    );
  }

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.securitySettings')}
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {t('admin.twoFactorAuth')}
              </h4>
              <p className="text-sm text-gray-500">
                {t('admin.twoFactorDescription')}
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.sessionTimeout')} ({t('admin.hours')})
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.security.sessionTimeout || 24}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: isNaN(val) ? 24 : val }
                });
              }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.maxLoginAttempts')}
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.security.maxLoginAttempts || 5}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSettings({
                  ...settings,
                  security: { ...settings.security, maxLoginAttempts: isNaN(val) ? 5 : val }
                });
              }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.passwordExpiry')} ({language === 'ar' ? 'بالأيام' : 'days'})
            </label>
            <input
              type="number"
              min="30"
              max="365"
              value={settings.security.passwordExpiry || 90}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSettings({
                  ...settings,
                  security: { ...settings.security, passwordExpiry: isNaN(val) ? 90 : val }
                });
              }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="mt-8 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {language === 'ar' ? 'قائمة IP المسموحة' : 'IP Whitelist'}
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            {language === 'ar' 
              ? 'أضف عناوين IP المسموح لها بالوصول إلى لوحة التحكم (اتركه فارغاً للسماح للجميع)'
              : 'Add IP addresses allowed to access admin panel (leave empty to allow all)'}
          </p>
          <div className="space-y-2">
            {settings.security.ipWhitelist.map((ip, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => {
                    const newList = [...settings.security.ipWhitelist];
                    newList[index] = e.target.value;
                    setSettings({
                      ...settings,
                      security: { ...settings.security, ipWhitelist: newList }
                    });
                  }}
                  placeholder="192.168.1.1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => {
                    const newList = settings.security.ipWhitelist.filter((_, i) => i !== index);
                    setSettings({
                      ...settings,
                      security: { ...settings.security, ipWhitelist: newList }
                    });
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  {language === 'ar' ? 'حذف' : 'Remove'}
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setSettings({
                  ...settings,
                  security: { 
                    ...settings.security, 
                    ipWhitelist: [...settings.security.ipWhitelist, ''] 
                  }
                });
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              {language === 'ar' ? '+ إضافة IP جديد' : '+ Add New IP'}
            </button>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {language === 'ar' ? 'تحديد معدل الطلبات' : 'Rate Limiting'}
              </h4>
              <p className="text-sm text-gray-500">
                {language === 'ar' 
                  ? 'الحد من عدد الطلبات في فترة زمنية معينة'
                  : 'Limit the number of requests in a time period'}
              </p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                security: { ...settings.security, rateLimitEnabled: !settings.security.rateLimitEnabled }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.rateLimitEnabled ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.rateLimitEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.security.rateLimitEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الحد الأقصى للطلبات' : 'Max Requests'}
                </label>
                <input
                  type="number"
                  value={settings.security.rateLimitMaxRequests || 100}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings({
                      ...settings,
                      security: { 
                        ...settings.security, 
                        rateLimitMaxRequests: isNaN(val) ? 100 : val 
                      }
                    });
                  }}
                  min="100"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'نافذة الوقت (بالثواني)' : 'Time Window (seconds)'}
                </label>
                <input
                  type="number"
                  value={settings.security.rateLimitWindowMs ? Math.floor(settings.security.rateLimitWindowMs / 1000) : 900}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings({
                      ...settings,
                      security: { 
                        ...settings.security, 
                        rateLimitWindowMs: isNaN(val) ? 900000 : val * 1000 
                      }
                    });
                  }}
                  min="60"
                  max="3600"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSaveSettings('security')}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات الأمان' : 'Save Security Settings')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.notificationSettings')}
        </h3>
        <div className="space-y-6">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {t(`admin.${key}`)}
                </h4>
                <p className="text-sm text-gray-500">
                  {t(`admin.${key}Description`)}
                </p>
              </div>
              <button
                onClick={() => {
                  const newValue = !value;
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: newValue }
                  });
                  // Send test email when enabling notifications
                  if (newValue) {
                    handleNotificationToggle(key, newValue);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => handleSaveSettings('notifications')}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات الإشعارات' : 'Save Notification Settings')}
          </button>
        </div>
      </div>
    </div>
  );

  function renderPagesContentTab() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {language === 'ar' ? 'محتوى الصفحات' : 'Pages Content'}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {language === 'ar' 
              ? 'تحكم في كل النصوص والمحتوى الذي يظهر في صفحة "اتصل بنا" وصفحة "من نحن" وصفحة "الشروط والأحكام"'
              : 'Control all texts and content displayed on the Contact, About, and Terms & Privacy pages'}
          </p>
          
          {/* Page Selector */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActivePageContentTab('contact')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activePageContentTab === 'contact'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'ar' ? 'صفحة اتصل بنا' : 'Contact Page'}
            </button>
            <button
              onClick={() => setActivePageContentTab('about')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activePageContentTab === 'about'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'ar' ? 'صفحة من نحن' : 'About Page'}
            </button>
            <button
              onClick={() => setActivePageContentTab('terms')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activePageContentTab === 'terms'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'ar' ? 'صفحة الشروط والأحكام' : 'Terms & Privacy Page'}
            </button>
          </div>

          {/* Contact Page Content */}
          {activePageContentTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {language === 'ar' ? 'قسم Hero (العنوان الرئيسي)' : 'Hero Section'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.heroTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, heroTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.heroTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, heroTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.contact.heroDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, heroDescriptionAr: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - إنجليزي' : 'Description - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.contact.heroDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, heroDescriptionEn: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-900 mb-2">
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Address - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.addressAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, addressAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Address - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.addressEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, addressEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف العنوان - عربي' : 'Address Description - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.addressDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, addressDescriptionAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف العنوان - إنجليزي' : 'Address Description - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.addressDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, addressDescriptionEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'ساعات العمل - عربي' : 'Working Hours - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.workingHoursAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, workingHoursAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'ساعات العمل - إنجليزي' : 'Working Hours - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.workingHoursEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, workingHoursEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف ساعات العمل - عربي' : 'Working Hours Description - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.workingHoursDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, workingHoursDescriptionAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف ساعات العمل - إنجليزي' : 'Working Hours Description - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.workingHoursDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, workingHoursDescriptionEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف البريد الإلكتروني - عربي' : 'Email Description - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.emailDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, emailDescriptionAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف البريد الإلكتروني - إنجليزي' : 'Email Description - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.emailDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, emailDescriptionEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-purple-900 mb-2">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappDescriptionAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - إنجليزي' : 'Description - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappDescriptionEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص الزر - عربي' : 'Button Text - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappButtonTextAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappButtonTextAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص الزر - إنجليزي' : 'Button Text - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappButtonTextEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappButtonTextEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'رسالة واتساب - عربي' : 'WhatsApp Message - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappMessageAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappMessageAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'رسالة واتساب - إنجليزي' : 'WhatsApp Message - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.contact.whatsappMessageEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          contact: { ...settings.pagesContent.contact, whatsappMessageEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Page Content - Simplified for now, can be expanded */}
          {activePageContentTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-900 mb-4">
                  {language === 'ar' ? 'قسم Hero' : 'Hero Section'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.heroTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, heroTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان الفرعي - عربي' : 'Subtitle - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.heroSubtitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, heroSubtitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.heroTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, heroTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان الفرعي - إنجليزي' : 'Subtitle - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.heroSubtitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, heroSubtitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-indigo-900 mb-4">
                  {language === 'ar' ? 'قصتنا' : 'Our Story'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.storyTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, storyTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المحتوى - عربي' : 'Content - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.storyContentAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, storyContentAr: e.target.value }
                        }
                      })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar' ? 'استخدم \\n\\n لفصل الفقرات' : 'Use \\n\\n to separate paragraphs'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المحتوى - إنجليزي' : 'Content - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.storyContentEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, storyContentEn: e.target.value }
                        }
                      })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar' ? 'استخدم \\n\\n لفصل الفقرات' : 'Use \\n\\n to separate paragraphs'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-pink-900 mb-4">
                  {language === 'ar' ? 'المميزات' : 'Features'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.featuresTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, featuresTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.featuresDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, featuresDescriptionAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'قائمة المميزات (4 عناصر)' : 'Features List (4 items)'}
                    </label>
                    {settings.pagesContent.about.features.map((feature, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                            </label>
                            <input
                              type="text"
                              value={feature.titleAr}
                              onChange={(e) => {
                                const newFeatures = [...settings.pagesContent.about.features];
                                newFeatures[index] = { ...feature, titleAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    about: { ...settings.pagesContent.about, features: newFeatures }
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                            </label>
                            <input
                              type="text"
                              value={feature.titleEn}
                              onChange={(e) => {
                                const newFeatures = [...settings.pagesContent.about.features];
                                newFeatures[index] = { ...feature, titleEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    about: { ...settings.pagesContent.about, features: newFeatures }
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                            </label>
                            <input
                              type="text"
                              value={feature.descriptionAr}
                              onChange={(e) => {
                                const newFeatures = [...settings.pagesContent.about.features];
                                newFeatures[index] = { ...feature, descriptionAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    about: { ...settings.pagesContent.about, features: newFeatures }
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {language === 'ar' ? 'الوصف - إنجليزي' : 'Description - English'}
                            </label>
                            <input
                              type="text"
                              value={feature.descriptionEn}
                              onChange={(e) => {
                                const newFeatures = [...settings.pagesContent.about.features];
                                newFeatures[index] = { ...feature, descriptionEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    about: { ...settings.pagesContent.about, features: newFeatures }
                                  }
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-teal-900 mb-4">
                  {language === 'ar' ? 'المهمة والرؤية' : 'Mission & Vision'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المهمة - العنوان عربي' : 'Mission - Title Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.missionTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, missionTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المهمة - العنوان إنجليزي' : 'Mission - Title English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.missionTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, missionTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المهمة - المحتوى عربي' : 'Mission - Content Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.missionContentAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, missionContentAr: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المهمة - المحتوى إنجليزي' : 'Mission - Content English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.missionContentEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, missionContentEn: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الرؤية - العنوان عربي' : 'Vision - Title Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.visionTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, visionTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الرؤية - العنوان إنجليزي' : 'Vision - Title English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.visionTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, visionTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الرؤية - المحتوى عربي' : 'Vision - Content Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.visionContentAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, visionContentAr: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الرؤية - المحتوى إنجليزي' : 'Vision - Content English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.visionContentEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, visionContentEn: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-orange-900 mb-4">
                  {language === 'ar' ? 'قسم CTA (Call to Action)' : 'CTA Section'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.ctaDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaDescriptionAr: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - إنجليزي' : 'Description - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.about.ctaDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaDescriptionEn: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'زر 1 - عربي' : 'Button 1 - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaButton1TextAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaButton1TextAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'زر 1 - إنجليزي' : 'Button 1 - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaButton1TextEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaButton1TextEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'زر 2 - عربي' : 'Button 2 - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaButton2TextAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaButton2TextAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'زر 2 - إنجليزي' : 'Button 2 - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.about.ctaButton2TextEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          about: { ...settings.pagesContent.about, ctaButton2TextEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms Page Content */}
          {activePageContentTab === 'terms' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {language === 'ar' ? 'قسم Hero (العنوان الرئيسي)' : 'Hero Section'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.heroTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, heroTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.heroTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, heroTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - عربي' : 'Description - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.heroDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, heroDescriptionAr: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الوصف - إنجليزي' : 'Description - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.heroDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, heroDescriptionEn: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Sections */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'أقسام الشروط والأحكام' : 'Terms & Conditions Sections'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.termsTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, termsTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.termsTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, termsTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'آخر تحديث - عربي' : 'Last Updated - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.termsLastUpdatedAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, termsLastUpdatedAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'آخر تحديث - إنجليزي' : 'Last Updated - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.termsLastUpdatedEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, termsLastUpdatedEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-4">
                    {language === 'ar' ? 'الأقسام' : 'Sections'}
                  </h5>
                  <div className="space-y-6">
                    {settings.pagesContent.terms.termsSections.map((section: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-medium text-gray-900">
                            {language === 'ar' ? `القسم ${index + 1}` : `Section ${index + 1}`}
                          </h6>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'العنوان الفرعي - عربي' : 'Subtitle - Arabic'}
                            </label>
                            <input
                              type="text"
                              value={section.subtitleAr}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.termsSections];
                                newSections[index] = { ...newSections[index], subtitleAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, termsSections: newSections }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'العنوان الفرعي - إنجليزي' : 'Subtitle - English'}
                            </label>
                            <input
                              type="text"
                              value={section.subtitleEn}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.termsSections];
                                newSections[index] = { ...newSections[index], subtitleEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, termsSections: newSections }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'النص - عربي' : 'Text - Arabic'}
                            </label>
                            <textarea
                              value={section.textAr}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.termsSections];
                                newSections[index] = { ...newSections[index], textAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, termsSections: newSections }
                                  }
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'النص - إنجليزي' : 'Text - English'}
                            </label>
                            <textarea
                              value={section.textEn}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.termsSections];
                                newSections[index] = { ...newSections[index], textEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, termsSections: newSections }
                                  }
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Privacy Sections */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'أقسام سياسة الخصوصية' : 'Privacy Policy Sections'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - عربي' : 'Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.privacyTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, privacyTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'العنوان - إنجليزي' : 'Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.privacyTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, privacyTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'آخر تحديث - عربي' : 'Last Updated - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.privacyLastUpdatedAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, privacyLastUpdatedAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'آخر تحديث - إنجليزي' : 'Last Updated - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.privacyLastUpdatedEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, privacyLastUpdatedEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-4">
                    {language === 'ar' ? 'الأقسام' : 'Sections'}
                  </h5>
                  <div className="space-y-6">
                    {settings.pagesContent.terms.privacySections.map((section: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-medium text-gray-900">
                            {language === 'ar' ? `القسم ${index + 1}` : `Section ${index + 1}`}
                          </h6>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'العنوان الفرعي - عربي' : 'Subtitle - Arabic'}
                            </label>
                            <input
                              type="text"
                              value={section.subtitleAr}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.privacySections];
                                newSections[index] = { ...newSections[index], subtitleAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, privacySections: newSections }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'العنوان الفرعي - إنجليزي' : 'Subtitle - English'}
                            </label>
                            <input
                              type="text"
                              value={section.subtitleEn}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.privacySections];
                                newSections[index] = { ...newSections[index], subtitleEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, privacySections: newSections }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'النص - عربي' : 'Text - Arabic'}
                            </label>
                            <textarea
                              value={section.textAr}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.privacySections];
                                newSections[index] = { ...newSections[index], textAr: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, privacySections: newSections }
                                  }
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'ar' ? 'النص - إنجليزي' : 'Text - English'}
                            </label>
                            <textarea
                              value={section.textEn}
                              onChange={(e) => {
                                const newSections = [...settings.pagesContent.terms.privacySections];
                                newSections[index] = { ...newSections[index], textEn: e.target.value };
                                setSettings({
                                  ...settings,
                                  pagesContent: {
                                    ...settings.pagesContent,
                                    terms: { ...settings.pagesContent.terms, privacySections: newSections }
                                  }
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Notice Sections */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'أقسام أخرى' : 'Other Sections'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'عنوان قسم الاتصال - عربي' : 'Contact Section Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.contactTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, contactTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'عنوان قسم الاتصال - إنجليزي' : 'Contact Section Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.contactTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, contactTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف قسم الاتصال - عربي' : 'Contact Section Description - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.contactDescriptionAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, contactDescriptionAr: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'وصف قسم الاتصال - إنجليزي' : 'Contact Section Description - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.contactDescriptionEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, contactDescriptionEn: e.target.value }
                        }
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'عنوان الإشعار المهم - عربي' : 'Important Notice Title - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.importantNoticeTitleAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, importantNoticeTitleAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'عنوان الإشعار المهم - إنجليزي' : 'Important Notice Title - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.importantNoticeTitleEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, importantNoticeTitleEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص الإشعار المهم - عربي' : 'Important Notice Text - Arabic'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.importantNoticeTextAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, importantNoticeTextAr: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص الإشعار المهم - إنجليزي' : 'Important Notice Text - English'}
                    </label>
                    <textarea
                      value={settings.pagesContent.terms.importantNoticeTextEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, importantNoticeTextEn: e.target.value }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص العودة للتسجيل - عربي' : 'Back to Registration Text - Arabic'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.backToRegistrationTextAr}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, backToRegistrationTextAr: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'نص العودة للتسجيل - إنجليزي' : 'Back to Registration Text - English'}
                    </label>
                    <input
                      type="text"
                      value={settings.pagesContent.terms.backToRegistrationTextEn}
                      onChange={(e) => setSettings({
                        ...settings,
                        pagesContent: {
                          ...settings.pagesContent,
                          terms: { ...settings.pagesContent.terms, backToRegistrationTextEn: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => handleSaveSettings('pagesContent')}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ محتوى الصفحات' : 'Save Pages Content')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('admin.settings')}
          </h1>
          <p className="text-gray-600">
            {t('admin.settingsDescription')}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'store' && renderStoreTab()}
            {activeTab === 'seo' && renderSeoTab()}
            {activeTab === 'pages' && renderPagesContentTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
