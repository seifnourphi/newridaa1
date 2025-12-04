export interface SeoConfig {
  siteUrl: string;
  brandNameAr: string;
  brandNameEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keywords: string[];
}

// يمكنك تعديل هذه القيم فقط للتحكم في شكل ظهور الموقع في جوجل
export const seoConfig: SeoConfig = {
  // غيّر هذا إلى الدومين الحقيقي للموقع في الإنتاج
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // اسم البراند
  brandNameAr: 'رِداء للأزياء الإسلامية',
  brandNameEn: 'Ridaa Islamic Fashion',

  // سطر تعريفي قصير يظهر أحيانًا مع العنوان
  taglineAr: 'جلابيات مغربية وثياب عصرية تعبر عن هويتك',
  taglineEn: 'Elegant Moroccan djellabas & modern modest wear',

  // وصف احترافي (يظهر تحت العنوان في نتائج البحث)
  descriptionAr:
    'تسوّق أونلاين أحدث الجلابيات المغربية والثياب العصرية الرجالية من رِداء. خامات فاخرة، تفصيل دقيق، وخيارات مقاسات وألوان تناسب كل المناسبات مع شحن سريع داخل مصر.',
  descriptionEn:
    'Shop premium Moroccan djellabas and modern modest wear for men at Ridaa. High‑quality fabrics, elegant tailoring and fast delivery across Egypt.',

  // كلمات مفتاحية مقترحة (يمكنك الإضافة أو التعديل)
  keywords: [
    'رِداء',
    'رداء',
    'جلابية مغربية',
    'جلابيات رجالي',
    'ملابس إسلامية',
    'ثياب رجالية',
    'djellaba',
    'moroccan djellaba',
    'islamic clothing',
    'thobes',
    'modest wear',
  ],
};


