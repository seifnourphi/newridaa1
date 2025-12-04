'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
  translationError: string | null;
  supportedLanguages: {language: string, name: string}[];
  getSupportedLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  ar: {
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.price': 'السعر',
    'common.quantity': 'الكمية',
    'common.total': 'المجموع',
    'common.name': 'الاسم',
    'common.phone': 'الهاتف',
    'common.address': 'العنوان',
    'common.size': 'المقاس',
    'common.color': 'اللون',
    
    // Header
    'header.title': 'رِداء - Ridaa',
    'header.subtitle': 'متجر الأزياء الإسلامية',
    'header.home': 'الرئيسية',
    'header.products': 'المنتجات',
    'header.categories': 'الأقسام',
    'header.about': 'من نحن',
    'header.contact': 'اتصل بنا',
    'header.language': 'اللغة',
    
    // Products
    'products.title': 'منتجاتنا',
    'products.featured': 'منتجات مميزة',
    'products.new': 'منتجات جديدة',
    'products.sale': 'تخفيضات',
    'products.viewDetails': 'عرض التفاصيل',
    'products.orderWhatsapp': 'اطلب عبر واتساب',
    'products.outOfStock': 'نفد من المخزن',
    'products.inStock': 'متوفر',
    'products.sku': 'رقم المنتج',
    'products.description': 'الوصف',
    'products.specifications': 'المواصفات',
    'products.reviews': 'التقييمات',
    'products.relatedProducts': 'منتجات ذات صلة',
    'products.discount': 'خصم',
    'products.originalPrice': 'السعر الأصلي',
    'products.salePrice': 'سعر التخفيض',
    
    // Store
    'store.featured': 'المنتجات المميزة',
    'store.categories': 'الفئات',
    'store.men': 'رجالي',
    'store.women': 'نسائي',
    'store.children': 'أطفال',
    'store.accessories': 'إكسسوارات',
    'store.orderWhatsapp': 'اطلب عبر واتساب',
    'store.currency': 'ج.م',
    'store.noProducts': 'لا توجد منتجات متاحة حالياً',
    
    // Categories
    'categories.all': 'جميع الأقسام',
    'categories.men': 'رجالي',
    'categories.women': 'نسائي',
    'categories.unisex': 'للجنسين',
    'categories.djellaba': 'جلابية',
    'categories.thobe': 'ثوب',
    'categories.abaya': 'عباءة',
    'categories.accessories': 'إكسسوارات',
    
    // Order Form
    'order.title': 'إتمام الطلب',
    'order.customerInfo': 'بيانات العميل',
    'order.productInfo': 'بيانات المنتج',
    'order.customerName': 'الاسم الكامل',
    'order.customerPhone': 'رقم الهاتف',
    'order.customerAddress': 'عنوان التوصيل',
    'order.selectSize': 'اختر المقاس',
    'order.selectColor': 'اختر اللون',
    'order.quantity': 'الكمية',
    'order.submit': 'إرسال الطلب',
    'order.whatsappRedirect': 'سيتم توجيهك إلى واتساب لإتمام الطلب',
    'order.required': 'مطلوب',
    'order.invalidPhone': 'رقم هاتف غير صحيح',
    'order.success': 'تم إرسال طلبك بنجاح!',
    
    // Footer
    'footer.about': 'عن رِداء',
    'footer.aboutText': 'رِداء للأزياء الإسلامية - نقدم أجود أنواع الجلابيات المغربية والملابس الإسلامية العصرية',
    'footer.quickLinks': 'روابط سريعة',
    'footer.contact': 'تواصل معنا',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    
    // Admin
    'admin.login': 'تسجيل دخول الإدارة',
    'admin.dashboard': 'لوحة التحكم',
    'admin.products': 'إدارة المنتجات',
    'admin.categories': 'إدارة الفئات',
    'admin.orders': 'الطلبات',
    'admin.slides': 'الشرائح',
    'admin.testimonials': 'آراء العملاء',
    'admin.sections': 'أقسام المنتجات',
    'admin.productImages': 'صور المنتج',
    'admin.addImage': 'إضافة صورة',
    'admin.addImageUrl': 'إضافة رابط صورة',
    'admin.uploadImageFile': 'رفع صورة من الجهاز',
    'admin.add': 'إضافة',
    'admin.imageInstructions': 'تعليمات الصور:',
    'admin.imageInstruction1': 'يمكنك إضافة رابط URL للصورة',
    'admin.imageInstruction2': 'الصورة الأولى ستكون الصورة الرئيسية',
    'admin.imageInstruction3': 'يمكنك إضافة عدة صور للمنتج',
    'admin.analytics': 'الإحصائيات',
    'admin.settings': 'الإعدادات',
    'admin.logout': 'تسجيل خروج',
    'admin.username': 'اسم المستخدم',
    'admin.password': 'كلمة المرور',
    'admin.loginButton': 'دخول',
    'admin.invalidCredentials': 'بيانات دخول غير صحيحة',
    
    // Products Management
    'admin.manageProducts': 'إدارة وتنظيم منتجات المتجر',
    'admin.addProduct': 'إضافة منتج جديد',
    'admin.editProduct': 'تعديل المنتج',
    'admin.deleteProduct': 'حذف المنتج',
    'admin.confirmDelete': 'هل أنت متأكد من حذف هذا العنصر؟',
    'admin.totalProducts': 'إجمالي المنتجات',
    'admin.activeProducts': 'المنتجات النشطة',
    'admin.featuredProducts': 'المنتجات المميزة',
    'admin.searchProducts': 'البحث في المنتجات...',
    'admin.filters': 'المرشحات',
    'admin.allCategories': 'جميع الأقسام',
    'admin.allStatuses': 'جميع الحالات',
    'admin.active': 'نشط',
    'admin.inactive': 'غير نشط',
    'admin.outOfStock': 'نفد من المخزن',
    'admin.featured': 'مميز',
    'admin.product': 'المنتج',
    'admin.category': 'القسم',
    'admin.stock': 'المخزون',
    'admin.status': 'الحالة',
    'admin.performance': 'الأداء',
    'admin.actions': 'الإجراءات',
    'admin.activate': 'تفعيل',
    'admin.deactivate': 'إلغاء تفعيل',
    'admin.noProducts': 'لا توجد منتجات',
    'admin.noProductsDescription': 'ابدأ بإضافة منتجك الأول',
    'admin.export': 'تصدير',
    'admin.import': 'استيراد',
    
    // Categories Management
    'admin.manageCategories': 'إدارة وتنظيم أقسام المتجر',
    'admin.addCategory': 'إضافة قسم جديد',
    'admin.editCategory': 'تعديل القسم',
    'admin.deleteCategory': 'حذف القسم',
    'admin.searchCategories': 'البحث في الأقسام...',
    'admin.noCategories': 'لا توجد أقسام',
    'admin.noCategoriesDescription': 'ابدأ بإضافة قسمك الأول',
    'admin.sortOrder': 'ترتيب العرض',
    
    // Orders Management
    'admin.manageOrders': 'إدارة ومتابعة طلبات العملاء',
    'admin.totalOrders': 'إجمالي الطلبات',
    'admin.pending': 'تم إنشاء الطلب',
    'admin.confirmed': 'جاري التجهيز',
    'admin.shipped': 'تم الشحن',
    'admin.outForDelivery': 'خرج للتوصيل',
    'admin.delivered': 'تم التوصيل',
    'admin.cancelled': 'ملغي',
    'admin.todayRevenue': 'إيرادات اليوم',
    'admin.searchOrders': 'البحث في الطلبات...',
    'admin.allDates': 'جميع التواريخ',
    'admin.today': 'اليوم',
    'admin.yesterday': 'أمس',
    'admin.thisWeek': 'هذا الأسبوع',
    'admin.order': 'الطلب',
    'admin.customer': 'العميل',
    'admin.total': 'المجموع',
    'admin.date': 'التاريخ',
    'admin.noOrders': 'لا توجد طلبات',
    'admin.noOrdersDescription': 'لم يتم تسجيل أي طلبات بعد',
    'admin.refresh': 'تحديث',
    'admin.contactWhatsApp': 'التواصل عبر واتساب',
    'admin.viewDetails': 'عرض التفاصيل',
    'admin.confirm': 'تأكيد',
    'admin.cancel': 'إلغاء',
    'admin.ship': 'شحن',
    'admin.markDelivered': 'تسليم',
    
    // Analytics
    'admin.analyticsDescription': 'تحليل شامل لأداء المتجر والمبيعات',
    'admin.noAnalyticsData': 'لا توجد بيانات تحليلية',
    'admin.last24Hours': 'آخر 24 ساعة',
    'admin.last7Days': 'آخر 7 أيام',
    'admin.last30Days': 'آخر 30 يوم',
    'admin.last90Days': 'آخر 90 يوم',
    'admin.totalRevenue': 'إجمالي الإيرادات',
    'admin.totalViews': 'إجمالي المشاهدات',
    'admin.conversionRate': 'معدل التحويل',
    'admin.revenueOverTime': 'الإيرادات عبر الوقت',
    'admin.deviceBreakdown': 'توزيع الأجهزة',
    'admin.mobile': 'الهاتف المحمول',
    'admin.desktop': 'سطح المكتب',
    'admin.tablet': 'الجهاز اللوحي',
    'admin.topProducts': 'أفضل المنتجات',
    'admin.recentOrders': 'الطلبات الأخيرة',
    'admin.averageOrderValue': 'متوسط قيمة الطلب',
    'admin.whatsappClicks': 'نقرات واتساب',
    'admin.clickToOrderRate': 'معدل التحويل من النقر للطلب',
    'admin.chartPlaceholder': 'الرسم البياني قيد التطوير',
    'admin.views': 'مشاهدات',
    
    // Export
    'admin.exportOrders': 'تصدير الطلبات',
    'admin.exportDescription': 'تصدير الطلبات بتنسيق CSV أو JSON',
    'admin.exportFormat': 'تنسيق التصدير',
    'admin.exportCSV': 'تصدير CSV',
    'admin.exportJSON': 'تصدير JSON',
    'admin.exporting': 'جاري التصدير...',
    'admin.exportSuccess': 'تم تصدير الطلبات بنجاح',
    'admin.exportError': 'حدث خطأ في تصدير الطلبات',
    
    // Security
    'admin.securitySettings': 'إعدادات الأمان',
    'admin.securitySettingsDescription': 'إدارة إعدادات الأمان والحماية',
    'admin.sessionSettings': 'إعدادات الجلسة',
    'admin.sessionTimeout': 'انتهاء الجلسة',
    'admin.maxLoginAttempts': 'الحد الأقصى لمحاولات تسجيل الدخول',
    'admin.passwordExpiry': 'انتهاء كلمة المرور',
    'admin.rateLimiting': 'تحديد معدل الطلبات',
    'admin.enableRateLimiting': 'تفعيل تحديد معدل الطلبات',
    'admin.maxRequestsPerWindow': 'الحد الأقصى للطلبات في النافذة',
    'admin.windowSize': 'حجم النافذة',
    'admin.passwordStrength': 'قوة كلمة المرور',
    'admin.passwordWeak': 'ضعيفة',
    'admin.passwordMedium': 'متوسطة',
    'admin.passwordStrong': 'قوية',
    'admin.passwordTooWeak': 'كلمة المرور ضعيفة جداً',
    'admin.passwordNeedsLowercase': 'تحتاج حروف صغيرة',
    'admin.passwordNeedsUppercase': 'تحتاج حروف كبيرة',
    'admin.passwordNeedsNumber': 'تحتاج أرقام',
    'admin.passwordNeedsSpecial': 'تحتاج رموز خاصة',
    'admin.securityStatus': 'حالة الأمان',
    'admin.httpsEnabled': 'HTTPS مفعل',
    'admin.secureConnection': 'اتصال آمن',
    'admin.rateLimitingActive': 'تحديد معدل الطلبات',
    'admin.enabled': 'مفعل',
    'admin.disabled': 'معطل',
    'admin.securityHeaders': 'رؤوس الأمان',
    
    // Settings
    'admin.settingsDescription': 'إدارة إعدادات المتجر والحساب',
    'admin.profile': 'الملف الشخصي',
    'admin.storeSettings': 'إعدادات المتجر',
    'admin.security': 'الأمان',
    'admin.notifications': 'الإشعارات',
    'admin.profileInformation': 'معلومات الملف الشخصي',
    'admin.fullName': 'الاسم الكامل',
    'admin.changePassword': 'تغيير كلمة المرور',
    'admin.currentPassword': 'كلمة المرور الحالية',
    'admin.newPassword': 'كلمة المرور الجديدة',
    'admin.confirmPassword': 'تأكيد كلمة المرور',
    'admin.saveChanges': 'حفظ التغييرات',
    'admin.saving': 'جاري الحفظ...',
    'admin.changing': 'جاري التغيير...',
    'admin.settingsSaved': 'تم حفظ الإعدادات بنجاح',
    'admin.settingsError': 'حدث خطأ في حفظ الإعدادات',
    'admin.passwordChanged': 'تم تغيير كلمة المرور بنجاح',
    'admin.passwordChangeError': 'حدث خطأ في تغيير كلمة المرور',
    'admin.passwordMismatch': 'كلمات المرور غير متطابقة',
    'admin.passwordTooShort': 'كلمة المرور قصيرة جداً',
    'admin.storeInformation': 'معلومات المتجر',
    'admin.storeName': 'اسم المتجر',
    'admin.storeDescription': 'وصف المتجر',
    'admin.storePhone': 'هاتف المتجر',
    'admin.storeEmail': 'بريد المتجر الإلكتروني',
    'admin.whatsappNumber': 'رقم واتساب',
    'admin.currency': 'العملة',
    'admin.twoFactorAuth': 'المصادقة الثنائية',
    'admin.twoFactorDescription': 'تفعيل المصادقة الثنائية لحماية إضافية',
    'admin.hours': 'ساعات',
    'admin.notificationSettings': 'إعدادات الإشعارات',
    'admin.emailNotifications': 'إشعارات البريد الإلكتروني',
    'admin.emailNotificationsDescription': 'تلقي إشعارات عبر البريد الإلكتروني',
    'admin.orderNotifications': 'إشعارات الطلبات',
    'admin.orderNotificationsDescription': 'تلقي إشعارات عند وصول طلبات جديدة',
    'admin.lowStockAlerts': 'تنبيهات نفاد المخزون',
    'admin.lowStockAlertsDescription': 'تلقي تنبيهات عند انخفاض المخزون',
    'admin.dailyReports': 'التقارير اليومية',
    'admin.dailyReportsDescription': 'تلقي تقارير يومية عن أداء المتجر',
    
    // Slides
    'admin.manageSlides': 'إدارة شرائح الصفحة الرئيسية',
    'admin.addSlide': 'إضافة شريحة جديدة',
    'admin.noSlides': 'لا توجد شرائح',
    'admin.noSlidesDescription': 'ابدأ بإضافة شريحتك الأولى',
    'admin.scheduled': 'مجدولة',
    'admin.expired': 'منتهية الصلاحية',
    'admin.starts': 'تبدأ',
    'admin.ends': 'تنتهي',
    
    // Product Form
    'admin.back': 'رجوع',
    'admin.addProductDescription': 'إضافة منتج جديد إلى المتجر',
    'admin.editProductDescription': 'تعديل بيانات المنتج في المتجر',
    'admin.basicInformation': 'المعلومات الأساسية',
    'admin.productName': 'اسم المنتج',
    'admin.slug': 'الرابط المختصر',
    'admin.sku': 'رقم المنتج',
    'admin.selectCategory': 'اختر القسم',
    'admin.gender': 'الجنس',
    'admin.unisex': 'للجنسين',
    'admin.male': 'رجالي',
    'admin.female': 'نسائي',
    'admin.descriptions': 'الأوصاف',
    'admin.shortDescription': 'الوصف المختصر',
    'admin.description': 'الوصف',
    'admin.pricingInventory': 'التسعير والمخزون',
    'admin.price': 'السعر',
    'admin.salePrice': 'سعر التخفيض',
    'admin.discountPercent': 'نسبة الخصم',
    'admin.stockQuantity': 'كمية المخزون',
    'admin.weight': 'الوزن',
    'admin.dimensions': 'الأبعاد',
    'admin.color': 'اللون',
    'admin.value': 'القيمة',
    'admin.valueArabic': 'القيمة بالعربية',
    'admin.variantStock': 'مخزون المتغير',
    'admin.noVariantsAdded': 'لم يتم إضافة متغيرات بعد',
    'admin.productSettings': 'إعدادات المنتج',
    'admin.activeProduct': 'منتج نشط',
    'admin.featuredProduct': 'منتج مميز',
    'admin.cancelAction': 'إلغاء',
    'admin.saveProduct': 'حفظ المنتج',
    'admin.updateProduct': 'تحديث المنتج',
    'admin.fillRequiredFields': 'يرجى ملء جميع الحقول المطلوبة',
    'admin.productCreated': 'تم إنشاء المنتج بنجاح',
    'admin.productUpdated': 'تم تحديث المنتج بنجاح',
    'admin.errorCreatingProduct': 'حدث خطأ في إنشاء المنتج',
    'admin.errorUpdatingProduct': 'حدث خطأ في تحديث المنتج',
    'admin.enterImageUrl': 'أدخل رابط الصورة',
    'admin.noImagesAdded': 'لم يتم إضافة صور بعد',
    'admin.updateError': 'حدث خطأ في التحديث',
    'admin.csrfTokenMissing': 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    
    // Category Form
    'admin.addCategoryDescription': 'إضافة قسم جديد إلى المتجر',
    'admin.categoryName': 'اسم القسم',
    'admin.categoryImage': 'صورة القسم',
    'admin.noImageAdded': 'لم يتم إضافة صورة بعد',
    'admin.categorySettings': 'إعدادات القسم',
    'admin.activeCategory': 'قسم نشط',
    'admin.saveCategory': 'حفظ القسم',
    'admin.categoryCreated': 'تم إنشاء القسم بنجاح',
    'admin.errorCreatingCategory': 'حدث خطأ في إنشاء القسم',
    
    // Slide Form
    'admin.addSlideDescription': 'إضافة شريحة جديدة للصفحة الرئيسية',
    'admin.slideTitle': 'عنوان الشريحة',
    'admin.slideSubtitle': 'العنوان الفرعي',
    'admin.slideLink': 'رابط الشريحة',
    'admin.buttonSettings': 'إعدادات الزر',
    'admin.buttonText': 'نص الزر',
    'admin.slideImages': 'صور الشريحة',
    'admin.desktopImage': 'صورة سطح المكتب',
    'admin.mobileImage': 'صورة الهاتف المحمول',
    'admin.slideSchedule': 'جدولة الشريحة',
    'admin.startDate': 'تاريخ البداية',
    'admin.endDate': 'تاريخ النهاية',
    'admin.slideSettings': 'إعدادات الشريحة',
    'admin.activeSlide': 'شريحة نشطة',
    'admin.saveSlide': 'حفظ الشريحة',
    'admin.slideCreated': 'تم إنشاء الشريحة بنجاح',
    'admin.errorCreatingSlide': 'حدث خطأ في إنشاء الشريحة',
    
    // Search & Filter
    'search.placeholder': 'ابحث عن المنتجات...',
    'search.noResults': 'لا توجد نتائج',
    'search.results': 'نتائج البحث',
    'filter.priceRange': 'نطاق السعر',
    'filter.category': 'القسم',
    'filter.size': 'المقاس',
    'filter.color': 'اللون',
    'filter.availability': 'التوفر',
    'filter.apply': 'تطبيق',
    'filter.clear': 'مسح',
    
    // Notifications
    'notification.addedToCart': 'تم إضافة المنتج',
    'notification.error': 'حدث خطأ، يرجى المحاولة مرة أخرى',
    'notification.orderSent': 'تم إرسال طلبك بنجاح',
    
    // SEO & Meta
    'meta.title': 'رِداء - Ridaa',
    'meta.description': 'رِداء للأزياء الإسلامية - جلابيات مغربية وملابس إسلامية عصرية بأفضل الأسعار',
    'meta.keywords': 'جلابية, ملابس إسلامية, أزياء إسلامية, جلابية مغربية, رِداء, Ridaa',
  },
  en: {
    // Common
    
    // Header
    
    // Products
    
    // Store
    
    // Categories
    
    // Order Form
    
    // Footer
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.categories': 'Categories',
    'admin.orders': 'Orders',
    'admin.slides': 'Slides',
    'admin.testimonials': 'Testimonials',
    'admin.sections': 'Product Sections',
    'admin.productImages': 'Product Images',
    'admin.addImage': 'Add Image',
    'admin.addImageUrl': 'Add Image URL',
    'admin.uploadImageFile': 'Upload Image File',
    'admin.add': 'Add',
    'admin.imageInstructions': 'Image Instructions:',
    'admin.imageInstruction1': 'You can add image URL links',
    'admin.imageInstruction2': 'The first image will be the main image',
    'admin.imageInstruction3': 'You can add multiple images for the product',
    'admin.analytics': 'Analytics',
    'admin.settings': 'Settings',
    'admin.logout': 'Logout',
    'admin.username': 'Username',
    'admin.password': 'Password',
    'admin.loginButton': 'Login',
    
    // Products Management
    
    // Categories Management
    
    // Orders Management
    
    // Analytics
    
    // Export
    
    // Security
    
    // Settings
    
    // Slides
    
    // Product Form
    
    // Category Form
    
    // Slide Form
    
    // Search & Filter
    
    // Notifications
    
    // SEO & Meta
  },
  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.price': 'Prix',
    'common.quantity': 'Quantité',
    'common.total': 'Total',
    'common.name': 'Nom',
    'common.phone': 'Téléphone',
    'common.address': 'Adresse',
    'common.size': 'Taille',
    'common.color': 'Couleur',
    
    // Header
    'header.title': 'Aboud',
    'header.subtitle': 'Boutique de mode islamique',
    'header.home': 'Accueil',
    'header.products': 'Produits',
    'header.categories': 'Catégories',
    'header.about': 'À propos',
    'header.contact': 'Contact',
    'header.language': 'Langue',
    
    // Products
    'products.title': 'Nos produits',
    'products.featured': 'Produits vedettes',
    'products.new': 'Nouveaux produits',
    'products.sale': 'Soldes',
    'products.viewDetails': 'Voir les détails',
    'products.orderWhatsapp': 'Commander via WhatsApp',
    'products.outOfStock': 'Rupture de stock',
    'products.inStock': 'En stock',
    'products.sku': 'Référence produit',
    'products.description': 'Description',
    'products.specifications': 'Spécifications',
    'products.reviews': 'Avis',
    'products.relatedProducts': 'Produits connexes',
    'products.discount': 'Remise',
    'products.originalPrice': 'Prix original',
    'products.salePrice': 'Prix de vente',
    
    // Store
    'store.featured': 'Produits vedettes',
    'store.categories': 'Catégories',
    'store.men': 'Hommes',
    'store.women': 'Femmes',
    'store.children': 'Enfants',
    'store.accessories': 'Accessoires',
    'store.orderWhatsapp': 'Commander via WhatsApp',
    'store.currency': '€',
    'store.noProducts': 'Aucun produit disponible pour le moment',
    
    // Categories
    'categories.all': 'Toutes les catégories',
    'categories.men': 'Hommes',
    'categories.women': 'Femmes',
    'categories.unisex': 'Unisexe',
    'categories.djellaba': 'Djellaba',
    'categories.thobe': 'Thobe',
    'categories.abaya': 'Abaya',
    'categories.accessories': 'Accessoires',
    
    // Order Form
    'order.title': 'Finaliser la commande',
    'order.customerInfo': 'Informations client',
    'order.productInfo': 'Informations produit',
    'order.customerName': 'Nom complet',
    'order.customerPhone': 'Numéro de téléphone',
    'order.customerAddress': 'Adresse de livraison',
    'order.selectSize': 'Choisir la taille',
    'order.selectColor': 'Choisir la couleur',
    'order.quantity': 'Quantité',
    'order.submit': 'Envoyer la commande',
    'order.whatsappRedirect': 'Vous serez redirigé vers WhatsApp pour finaliser la commande',
    'order.required': 'Requis',
    'order.invalidPhone': 'Numéro de téléphone invalide',
    'order.success': 'Votre commande a été envoyée avec succès!',
    
    // Footer
    'footer.about': 'À propos d\'Aboud',
    'footer.aboutText': 'Boutique Aboud de mode islamique - Nous proposons les meilleures djellabas marocaines et vêtements islamiques modernes',
    'footer.quickLinks': 'Liens rapides',
    'footer.contact': 'Contactez-nous',
    'footer.followUs': 'Suivez-nous',
    'footer.rights': 'Tous droits réservés',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    
    // Admin
    'admin.login': 'Connexion administration',
    'admin.dashboard': 'Tableau de bord',
    'admin.products': 'Produits',
    'admin.categories': 'Catégories',
    'admin.orders': 'Commandes',
    'admin.slides': 'Diapositives',
    'admin.testimonials': 'Témoignages',
    'admin.analytics': 'Analyses',
    'admin.settings': 'Paramètres',
    'admin.logout': 'Déconnexion',
    'admin.username': 'Nom d\'utilisateur',
    'admin.password': 'Mot de passe',
    'admin.loginButton': 'Connexion',
    'admin.invalidCredentials': 'Identifiants invalides',
    
    // Products Management
    'admin.manageProducts': 'Gérer et organiser les produits de la boutique',
    'admin.addProduct': 'Ajouter un nouveau produit',
    'admin.editProduct': 'Modifier le produit',
    'admin.deleteProduct': 'Supprimer le produit',
    'admin.confirmDelete': 'Êtes-vous sûr de vouloir supprimer cet élément?',
    'admin.totalProducts': 'Total des produits',
    'admin.activeProducts': 'Produits actifs',
    'admin.featuredProducts': 'Produits vedettes',
    'admin.searchProducts': 'Rechercher dans les produits...',
    'admin.filters': 'Filtres',
    'admin.allCategories': 'Toutes les catégories',
    'admin.allStatuses': 'Tous les statuts',
    'admin.active': 'Actif',
    'admin.inactive': 'Inactif',
    'admin.outOfStock': 'Rupture de stock',
    'admin.featured': 'Vedette',
    'admin.product': 'Produit',
    'admin.category': 'Catégorie',
    'admin.stock': 'Stock',
    'admin.status': 'Statut',
    'admin.performance': 'Performance',
    'admin.actions': 'Actions',
    'admin.activate': 'Activer',
    'admin.deactivate': 'Désactiver',
    'admin.noProducts': 'Aucun produit',
    'admin.noProductsDescription': 'Commencez par ajouter votre premier produit',
    'admin.export': 'Exporter',
    'admin.import': 'Importer',
    
    // Categories Management
    'admin.manageCategories': 'Gérer et organiser les catégories de la boutique',
    'admin.addCategory': 'Ajouter une nouvelle catégorie',
    'admin.editCategory': 'Modifier la catégorie',
    'admin.deleteCategory': 'Supprimer la catégorie',
    'admin.searchCategories': 'Rechercher dans les catégories...',
    'admin.noCategories': 'Aucune catégorie',
    'admin.noCategoriesDescription': 'Commencez par ajouter votre première catégorie',
    'admin.sortOrder': 'Ordre d\'affichage',
    
    // Orders Management
    'admin.manageOrders': 'Gérer et suivre les commandes clients',
    'admin.totalOrders': 'Total des commandes',
    'admin.pending': 'En attente',
    'admin.confirmed': 'Confirmé',
    'admin.shipped': 'Expédié',
    'admin.delivered': 'Livré',
    'admin.cancelled': 'Annulé',
    'admin.todayRevenue': 'Revenus d\'aujourd\'hui',
    'admin.searchOrders': 'Rechercher dans les commandes...',
    'admin.allDates': 'Toutes les dates',
    'admin.today': 'Aujourd\'hui',
    'admin.yesterday': 'Hier',
    'admin.thisWeek': 'Cette semaine',
    'admin.order': 'Commande',
    'admin.customer': 'Client',
    'admin.total': 'Total',
    'admin.date': 'Date',
    'admin.noOrders': 'Aucune commande',
    'admin.noOrdersDescription': 'Aucune commande n\'a encore été enregistrée',
    'admin.refresh': 'Actualiser',
    'admin.contactWhatsApp': 'Contacter via WhatsApp',
    'admin.viewDetails': 'Voir les détails',
    'admin.confirm': 'Confirmer',
    'admin.cancel': 'Annuler',
    'admin.ship': 'Expédier',
    'admin.markDelivered': 'Marquer comme livré',
    
    // Analytics
    'admin.analyticsDescription': 'Analyse complète des performances de la boutique et des ventes',
    'admin.noAnalyticsData': 'Aucune donnée d\'analyse',
    'admin.last24Hours': 'Dernières 24 heures',
    'admin.last7Days': '7 derniers jours',
    'admin.last30Days': '30 derniers jours',
    'admin.last90Days': '90 derniers jours',
    'admin.totalRevenue': 'Revenus totaux',
    'admin.totalViews': 'Vues totales',
    'admin.conversionRate': 'Taux de conversion',
    'admin.revenueOverTime': 'Revenus dans le temps',
    'admin.deviceBreakdown': 'Répartition des appareils',
    'admin.mobile': 'Mobile',
    'admin.desktop': 'Bureau',
    'admin.tablet': 'Tablette',
    'admin.topProducts': 'Meilleurs produits',
    'admin.recentOrders': 'Commandes récentes',
    'admin.averageOrderValue': 'Valeur moyenne de commande',
    'admin.whatsappClicks': 'Clics WhatsApp',
    'admin.clickToOrderRate': 'Taux de conversion clic-commande',
    'admin.chartPlaceholder': 'Le graphique est en cours de développement',
    'admin.views': 'Vues',
    
    // Export
    'admin.exportOrders': 'Exporter les commandes',
    'admin.exportDescription': 'Exporter les commandes au format CSV ou JSON',
    'admin.exportFormat': 'Format d\'exportation',
    'admin.exportCSV': 'Exporter CSV',
    'admin.exportJSON': 'Exporter JSON',
    'admin.exporting': 'Exportation en cours...',
    'admin.exportSuccess': 'Commandes exportées avec succès',
    'admin.exportError': 'Erreur lors de l\'exportation des commandes',
    
    // Security
    'admin.securitySettings': 'Paramètres de sécurité',
    'admin.securitySettingsDescription': 'Gérer les paramètres de sécurité et de protection',
    'admin.sessionSettings': 'Paramètres de session',
    'admin.sessionTimeout': 'Expiration de session',
    'admin.maxLoginAttempts': 'Nombre maximum de tentatives de connexion',
    'admin.passwordExpiry': 'Expiration du mot de passe',
    'admin.rateLimiting': 'Limitation du taux',
    'admin.enableRateLimiting': 'Activer la limitation du taux',
    'admin.maxRequestsPerWindow': 'Nombre maximum de requêtes par fenêtre',
    'admin.windowSize': 'Taille de fenêtre',
    'admin.passwordStrength': 'Force du mot de passe',
    'admin.passwordWeak': 'Faible',
    'admin.passwordMedium': 'Moyen',
    'admin.passwordStrong': 'Fort',
    'admin.passwordTooWeak': 'Mot de passe trop faible',
    'admin.passwordNeedsLowercase': 'Nécessite des minuscules',
    'admin.passwordNeedsUppercase': 'Nécessite des majuscules',
    'admin.passwordNeedsNumber': 'Nécessite des chiffres',
    'admin.passwordNeedsSpecial': 'Nécessite des caractères spéciaux',
    'admin.securityStatus': 'Statut de sécurité',
    'admin.httpsEnabled': 'HTTPS activé',
    'admin.secureConnection': 'Connexion sécurisée',
    'admin.rateLimitingActive': 'Limitation du taux',
    'admin.enabled': 'Activé',
    'admin.disabled': 'Désactivé',
    'admin.securityHeaders': 'En-têtes de sécurité',
    
    // Settings
    'admin.settingsDescription': 'Gérer les paramètres de la boutique et du compte',
    'admin.profile': 'Profil',
    'admin.storeSettings': 'Paramètres de la boutique',
    'admin.security': 'Sécurité',
    'admin.notifications': 'Notifications',
    'admin.profileInformation': 'Informations du profil',
    'admin.fullName': 'Nom complet',
    'admin.changePassword': 'Changer le mot de passe',
    'admin.currentPassword': 'Mot de passe actuel',
    'admin.newPassword': 'Nouveau mot de passe',
    'admin.confirmPassword': 'Confirmer le mot de passe',
    'admin.saveChanges': 'Enregistrer les modifications',
    'admin.saving': 'Enregistrement en cours...',
    'admin.changing': 'Modification en cours...',
    'admin.settingsSaved': 'Paramètres enregistrés avec succès',
    'admin.settingsError': 'Erreur lors de l\'enregistrement des paramètres',
    'admin.passwordChanged': 'Mot de passe changé avec succès',
    'admin.passwordChangeError': 'Erreur lors du changement de mot de passe',
    'admin.passwordMismatch': 'Les mots de passe ne correspondent pas',
    'admin.passwordTooShort': 'Mot de passe trop court',
    'admin.storeInformation': 'Informations de la boutique',
    'admin.storeName': 'Nom de la boutique',
    'admin.storeDescription': 'Description de la boutique',
    'admin.storePhone': 'Téléphone de la boutique',
    'admin.storeEmail': 'Email de la boutique',
    'admin.whatsappNumber': 'Numéro WhatsApp',
    'admin.currency': 'Devise',
    'admin.twoFactorAuth': 'Authentification à deux facteurs',
    'admin.twoFactorDescription': 'Activer l\'authentification à deux facteurs pour une protection supplémentaire',
    'admin.hours': 'Heures',
    'admin.notificationSettings': 'Paramètres de notification',
    'admin.emailNotifications': 'Notifications par email',
    'admin.emailNotificationsDescription': 'Recevoir des notifications par email',
    'admin.orderNotifications': 'Notifications de commande',
    'admin.orderNotificationsDescription': 'Recevoir des notifications pour les nouvelles commandes',
    'admin.lowStockAlerts': 'Alertes de stock faible',
    'admin.lowStockAlertsDescription': 'Recevoir des alertes lorsque le stock est faible',
    'admin.dailyReports': 'Rapports quotidiens',
    'admin.dailyReportsDescription': 'Recevoir des rapports quotidiens sur les performances de la boutique',
    
    // Slides
    'admin.manageSlides': 'Gérer les diapositives de la page d\'accueil',
    'admin.addSlide': 'Ajouter une nouvelle diapositive',
    'admin.noSlides': 'Aucune diapositive',
    'admin.noSlidesDescription': 'Commencez par ajouter votre première diapositive',
    'admin.scheduled': 'Programmé',
    'admin.expired': 'Expiré',
    'admin.starts': 'Commence',
    'admin.ends': 'Se termine',
    
    // Product Form
    'admin.back': 'Retour',
    'admin.addProductDescription': 'Ajouter un nouveau produit à la boutique',
    'admin.editProductDescription': 'Modifier les informations du produit dans la boutique',
    'admin.basicInformation': 'Informations de base',
    'admin.productName': 'Nom du produit',
    'admin.slug': 'Lien raccourci',
    'admin.sku': 'Référence produit',
    'admin.selectCategory': 'Choisir la catégorie',
    'admin.gender': 'Genre',
    'admin.unisex': 'Unisexe',
    'admin.male': 'Homme',
    'admin.female': 'Femme',
    'admin.descriptions': 'Descriptions',
    'admin.shortDescription': 'Description courte',
    'admin.description': 'Description',
    'admin.pricingInventory': 'Prix et stock',
    'admin.price': 'Prix',
    'admin.salePrice': 'Prix de vente',
    'admin.discountPercent': 'Pourcentage de remise',
    'admin.stockQuantity': 'Quantité en stock',
    'admin.weight': 'Poids',
    'admin.dimensions': 'Dimensions',
    'admin.productImages': 'Images du produit',
    'admin.addImage': 'Ajouter une image',
    'admin.noImagesAdded': 'Aucune image ajoutée',
    'admin.enterImageUrl': 'Entrer l\'URL de l\'image',
    'admin.productVariants': 'Variantes du produit',
    'admin.addVariant': 'Ajouter une variante',
    'admin.size': 'Taille',
    'admin.color': 'Couleur',
    'admin.value': 'Valeur',
    'admin.valueArabic': 'Valeur en arabe',
    'admin.variantStock': 'Stock de la variante',
    'admin.noVariantsAdded': 'Aucune variante ajoutée',
    'admin.productSettings': 'Paramètres du produit',
    'admin.activeProduct': 'Produit actif',
    'admin.featuredProduct': 'Produit vedette',
    'admin.cancelAction': 'Annuler',
    'admin.saveProduct': 'Enregistrer le produit',
    'admin.updateProduct': 'Mettre à jour le produit',
    'admin.fillRequiredFields': 'Veuillez remplir tous les champs requis',
    'admin.productCreated': 'Produit créé avec succès',
    'admin.productUpdated': 'Produit mis à jour avec succès',
    'admin.errorCreatingProduct': 'Erreur lors de la création du produit',
    'admin.errorUpdatingProduct': 'Erreur lors de la mise à jour du produit',
    'admin.updateError': 'Erreur lors de la mise à jour',
    'admin.csrfTokenMissing': 'Votre session a expiré. Veuillez actualiser la page et réessayer.',
    
    // Category Form
    'admin.addCategoryDescription': 'Ajouter une nouvelle catégorie à la boutique',
    'admin.categoryName': 'Nom de la catégorie',
    'admin.categoryImage': 'Image de la catégorie',
    'admin.noImageAdded': 'Aucune image ajoutée',
    'admin.categorySettings': 'Paramètres de la catégorie',
    'admin.activeCategory': 'Catégorie active',
    'admin.saveCategory': 'Enregistrer la catégorie',
    'admin.categoryCreated': 'Catégorie créée avec succès',
    'admin.errorCreatingCategory': 'Erreur lors de la création de la catégorie',
    
    // Slide Form
    'admin.addSlideDescription': 'Ajouter une nouvelle diapositive à la page d\'accueil',
    'admin.slideTitle': 'Titre de la diapositive',
    'admin.slideSubtitle': 'Sous-titre',
    'admin.slideLink': 'Lien de la diapositive',
    'admin.buttonSettings': 'Paramètres du bouton',
    'admin.buttonText': 'Texte du bouton',
    'admin.slideImages': 'Images de la diapositive',
    'admin.desktopImage': 'Image de bureau',
    'admin.mobileImage': 'Image mobile',
    'admin.slideSchedule': 'Programmation de la diapositive',
    'admin.startDate': 'Date de début',
    'admin.endDate': 'Date de fin',
    'admin.slideSettings': 'Paramètres de la diapositive',
    'admin.activeSlide': 'Diapositive active',
    'admin.saveSlide': 'Enregistrer la diapositive',
    'admin.slideCreated': 'Diapositive créée avec succès',
    'admin.errorCreatingSlide': 'Erreur lors de la création de la diapositive',
    
    // Search & Filter
    'search.placeholder': 'Rechercher des produits...',
    'search.noResults': 'Aucun résultat',
    'search.results': 'Résultats de recherche',
    'filter.priceRange': 'Gamme de prix',
    'filter.category': 'Catégorie',
    'filter.size': 'Taille',
    'filter.color': 'Couleur',
    'filter.availability': 'Disponibilité',
    'filter.apply': 'Appliquer',
    'filter.clear': 'Effacer',
    
    // Notifications
    'notification.addedToCart': 'Produit ajouté',
    'notification.error': 'Une erreur s\'est produite, veuillez réessayer',
    'notification.orderSent': 'Votre commande a été envoyée avec succès',
    
    // SEO & Meta
    'meta.title': 'Aboud - Boutique de mode islamique',
    'meta.description': 'Boutique Aboud de mode islamique - Djellabas marocaines et vêtements islamiques modernes aux meilleurs prix',
    'meta.keywords': 'djellaba, vêtements islamiques, mode islamique, djellaba marocaine, aboud',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize language from localStorage immediately to avoid flash of wrong language
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage === 'ar' || savedLanguage === 'en') {
        return savedLanguage;
      }
    }
    return 'ar'; // Default to Arabic if nothing is saved
  });
  const [supportedLanguages, setSupportedLanguages] = useState<{language: string, name: string}[]>([]);
  
  // Simple state for translation
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    // Update document language only (keep layout fixed)
    document.documentElement.lang = language;
    // Don't change dir to keep layout consistent
    
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  // Load supported languages on mount
  useEffect(() => {
    // Set only Arabic and English
    setSupportedLanguages([
      { language: 'ar', name: 'العربية' },
      { language: 'en', name: 'English' },
    ]);
  }, []);

  const t = (key: string): string => {
    // Get from static translations (ar, en only)
    const langTranslations = translations[language];
    if (langTranslations && key in langTranslations) {
      return langTranslations[key as keyof typeof langTranslations];
    }

    // Try fallback to English if current language doesn't have the key
    if (language !== 'en' && translations.en && key in translations.en) {
      return translations.en[key as keyof typeof translations.en];
    }

    // Fallback to key (remove common prefixes for cleaner display)
    return key.replace(/^(admin|common|products|order|header|footer)\./, '');
  };

  // Simple translate function (no API needed)
  const translateTextAsync = async (text: string): Promise<string> => {
    // Just return the text as-is since we're using static translations
    return text;
  };

  const getSupportedLanguages = async () => {
    // Languages are already set in useEffect
    return;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
    translateText: translateTextAsync,
    isTranslating,
    translationError,
    supportedLanguages,
    getSupportedLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
