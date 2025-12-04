'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Upload, Image as ImageIcon, RefreshCw, Search, X, Download, Crop } from 'lucide-react';
import { getCSRFToken, refreshCSRFToken } from '@/lib/csrf-client';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageCropper } from '@/components/ui/ImageCropper';

interface AdvertisementImage {
  id: string;
  url: string;
  alt?: string;
  altAr?: string;
  name?: string;
  nameAr?: string;
  price?: number;
  sortOrder: number;
}

interface Advertisement {
  id: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  badge?: string;
  badgeAr?: string;
  badgeColor?: string;
  description: string;
  descriptionAr: string;
  buttonText?: string;
  buttonTextAr?: string;
  image: string;
  price?: number;
  originalPrice?: number;
  displayType: string;
  sortOrder: number;
  isActive: boolean;
  images: AdvertisementImage[];
  highlightedWord?: string;
  highlightedWordAr?: string;
  highlightedWordColor?: string;
  highlightedWordUnderline?: boolean;
  showDiscountBadge?: boolean;
  discountBadgePosition?: string;
  features?: Array<{
    title: string;
    titleAr: string;
    icon?: string;
    sortOrder: number;
  }>;
  testimonialText?: string;
  testimonialTextAr?: string;
  testimonialAuthor?: string;
  testimonialAuthorAr?: string;
}

export default function AdvertisementsPage() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'success' | 'info';
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropImageType, setCropImageType] = useState<'single' | 'multiple' | null>(null);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    subtitle: '',
    subtitleAr: '',
    badge: '',
    badgeAr: '',
    badgeColor: '#DAA520',
    description: '',
    descriptionAr: '',
    buttonText: '',
    buttonTextAr: '',
    image: '',
    price: '',
    originalPrice: '',
    displayType: 'SINGLE',
    sortOrder: 0,
    isActive: true,
    images: [] as AdvertisementImage[],
    highlightedWord: '',
    highlightedWordAr: '',
    highlightedWordColor: '',
    highlightedWordUnderline: false,
    showDiscountBadge: true,
    discountBadgePosition: 'top-right',
    features: [] as Array<{ title: string; titleAr: string; icon?: string; sortOrder: number }>,
    testimonialText: '',
    testimonialTextAr: '',
    testimonialAuthor: '',
    testimonialAuthorAr: ''
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  // Fetch products when product selector opens (to avoid setState during render)
  useEffect(() => {
    if (isProductSelectorOpen && products.length === 0 && !isLoadingProducts) {
      fetchProducts();
    }
  }, [isProductSelectorOpen]);

  // Fetch products for selector
  const fetchProducts = async (search = '') => {
    try {
      setIsLoadingProducts(true);
      const query = search ? `?search=${encodeURIComponent(search)}&limit=50` : '?limit=50';
      const response = await fetch(`/api/products${query}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setProducts([]);
        return;
      }
      
      const data = await response.json();
      const productsList = data?.data || data?.products || [];
      setProducts(productsList);
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Open product selector
  const openProductSelector = () => {
    setIsProductSelectorOpen(true);
    // Products will be fetched in useEffect when modal opens
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product: any): string => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      // Handle both string and object formats
      const imageUrl = typeof firstImage === 'string' 
        ? firstImage 
        : (firstImage?.url || firstImage?.path || '');
      
      if (!imageUrl) return '/uploads/good.png';
      
      // Check if it's already a full URL
      if (typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
        return imageUrl;
      }
      
      // Handle relative paths
      if (typeof imageUrl === 'string') {
        return imageUrl.startsWith('/') 
          ? imageUrl 
          : `/uploads/${imageUrl.replace(/^uploads\//, '')}`;
      }
    }
    
    // Fallback to product.image or default
    if (product.image) {
      return typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('/'))
        ? product.image
        : `/uploads/${product.image.replace(/^uploads\//, '')}`;
    }
    
    return '/uploads/good.png';
  };

  // Select product and add to images
  const selectProduct = (product: any) => {
    const productImage: AdvertisementImage = {
      id: `product-${product._id || product.id}-${Date.now()}`,
      url: getProductImageUrl(product),
      alt: product.name || '',
      altAr: product.nameAr || product.name || '',
      name: product.name || '',
      nameAr: product.nameAr || product.name || '',
      price: product.price || 0,
      sortOrder: formData.images.length
    };
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, productImage]
    }));
    
    setIsProductSelectorOpen(false);
    setSearchQuery('');
    showToast(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully', 'success');
  };

  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/advertisements', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setAdvertisements([]);
        return;
      }
      
      const data = await response.json();
      
      // Handle structured response format: {success: true, data: {advertisements: [...]}}
      let advertisementsList = [];
      if (data.success && data.data?.advertisements) {
        advertisementsList = data.data.advertisements;
      } else if (data.data && Array.isArray(data.data)) {
        advertisementsList = data.data;
      } else if (data.advertisements && Array.isArray(data.advertisements)) {
        advertisementsList = data.advertisements;
      } else if (Array.isArray(data)) {
        advertisementsList = data;
      }
      
      // Sort by sortOrder to ensure correct display order
      const sortedList = [...advertisementsList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setAdvertisements(sortedList);
    } catch (error) {
      setAdvertisements([]); // Ensure advertisements is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get CSRF token
      const token = await getCSRFToken();
      if (!token) {
        // CSRF token not available - no sensitive data logged
        return;
      }

      const url = editingAd ? '/api/admin/advertisements' : '/api/admin/advertisements';
      const method = editingAd ? 'PUT' : 'POST';
      
      // Convert price and originalPrice to numbers or null
      const priceValue = formData.price && formData.price !== '' 
        ? (typeof formData.price === 'string' ? parseFloat(formData.price) : Number(formData.price))
        : null;
      const originalPriceValue = formData.originalPrice && formData.originalPrice !== ''
        ? (typeof formData.originalPrice === 'string' ? parseFloat(formData.originalPrice) : Number(formData.originalPrice))
        : null;

      // Prepare features with sortOrder
      const featuresWithSortOrder = (formData.features || []).map((feature, index) => ({
        title: feature.title || '',
        titleAr: feature.titleAr || '',
        icon: feature.icon || '',
        sortOrder: feature.sortOrder !== undefined ? feature.sortOrder : index
      }));

      const payload = editingAd 
        ? { 
            id: editingAd.id, 
            ...formData,
            price: (priceValue !== null && !isNaN(priceValue)) ? priceValue : null,
            originalPrice: (originalPriceValue !== null && !isNaN(originalPriceValue)) ? originalPriceValue : null,
            csrfToken: token,
            features: featuresWithSortOrder,
            images: formData.images.map(img => ({
              url: img.url,
              alt: img.alt || '',
              altAr: img.altAr || '',
              name: img.name || '',
              nameAr: img.nameAr || '',
              price: img.price,
              sortOrder: img.sortOrder
            }))
          }
        : {
            ...formData,
            price: (priceValue !== null && !isNaN(priceValue)) ? priceValue : null,
            originalPrice: (originalPriceValue !== null && !isNaN(originalPriceValue)) ? originalPriceValue : null,
            csrfToken: token,
            features: featuresWithSortOrder,
            images: formData.images.map(img => ({
              url: img.url,
              alt: img.alt || '',
              altAr: img.altAr || '',
              name: img.name || '',
              nameAr: img.nameAr || '',
              price: img.price,
              sortOrder: img.sortOrder
            }))
          };


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAdvertisements();
        resetForm();
        setIsModalOpen(false);
        showToast(
          language === 'ar' ? 'تم حفظ الإعلان بنجاح' : 'Advertisement saved successfully',
          'success'
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || (language === 'ar' ? 'خطأ في حفظ الإعلان' : 'Error saving advertisement');
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء حفظ الإعلان' : 'An error occurred while saving the advertisement',
        'error'
      );
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      titleAr: ad.titleAr,
      subtitle: ad.subtitle || '',
      subtitleAr: ad.subtitleAr || '',
      badge: ad.badge || '',
      badgeAr: ad.badgeAr || '',
      badgeColor: (ad as any).badgeColor || '#DAA520',
      description: ad.description,
      descriptionAr: ad.descriptionAr,
      buttonText: ad.buttonText || '',
      buttonTextAr: ad.buttonTextAr || '',
      image: ad.image,
      price: ad.price?.toString() || '',
      originalPrice: ad.originalPrice?.toString() || '',
      displayType: ad.displayType,
      sortOrder: ad.sortOrder,
      isActive: ad.isActive,
      images: ad.images || [],
      highlightedWord: ad.highlightedWord || '',
      highlightedWordAr: ad.highlightedWordAr || '',
      highlightedWordColor: ad.highlightedWordColor || '',
      highlightedWordUnderline: ad.highlightedWordUnderline || false,
      showDiscountBadge: ad.showDiscountBadge !== undefined ? ad.showDiscountBadge : true,
      discountBadgePosition: ad.discountBadgePosition || 'top-right',
      features: Array.isArray(ad.features) ? ad.features : [],
      testimonialText: ad.testimonialText || '',
      testimonialTextAr: ad.testimonialTextAr || '',
      testimonialAuthor: ad.testimonialAuthor || '',
      testimonialAuthorAr: ad.testimonialAuthorAr || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ad = advertisements.find(a => a.id === id);
    const adTitle = ad ? (language === 'ar' ? ad.titleAr : ad.title) : '';
    
    setConfirmDialog({
      isOpen: true,
      title: language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      message: language === 'ar' 
        ? `هل أنت متأكد من حذف الإعلان "${adTitle}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete the advertisement "${adTitle}"?\n\nThis action cannot be undone.`,
      type: 'confirm',
      confirmText: language === 'ar' ? 'حذف' : 'Delete',
      cancelText: language === 'ar' ? 'إلغاء' : 'Cancel',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        try {
          // Get CSRF token with retry
          let token;
          try {
            token = await getCSRFToken();
            if (!token) {
              showToast(
                language === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please sign in again.',
                'error'
              );
              return;
            }
          } catch (error) {
            showToast(
              language === 'ar' ? 'خطأ في جلب رمز الأمان. يرجى تحديث الصفحة والمحاولة مرة أخرى.' : 'Error fetching security token. Please refresh the page and try again.',
              'error'
            );
            return;
          }

          // Use path parameter instead of query parameter for better REST API practice
          const response = await fetch(`/api/admin/advertisements/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': token, // Use lowercase header name
            },
            credentials: 'include',
            body: JSON.stringify({ csrfToken: token }),
          });

          if (response.ok) {
            await fetchAdvertisements();
            showToast(
              language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Advertisement deleted successfully',
              'success'
            );
          } else {
            const errorData = await response.json().catch(() => ({}));
            let errorMessage = errorData.error || errorData.message;
            
            // Handle 403 Forbidden (session expired or CSRF error)
            if (response.status === 403) {
              // Try to refresh CSRF token and retry once
              try {
                const newToken = await refreshCSRFToken();
                // Retry the delete request with new token
                const retryResponse = await fetch(`/api/admin/advertisements/${id}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': newToken,
                  },
                  credentials: 'include',
                  body: JSON.stringify({ csrfToken: newToken }),
                });
                
                if (retryResponse.ok) {
                  await fetchAdvertisements();
                  showToast(
                    language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Advertisement deleted successfully',
                    'success'
                  );
                  return;
                } else {
                  errorMessage = language === 'ar' 
                    ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
                    : 'Your session has expired. Please sign in again.';
                }
              } catch (refreshError) {
                errorMessage = language === 'ar' 
                  ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
                  : 'Your session has expired. Please sign in again.';
              }
            } else if (!errorMessage) {
              errorMessage = language === 'ar' ? 'خطأ في حذف الإعلان' : 'Error deleting advertisement';
            }
            
            showToast(errorMessage, 'error');
          }
        } catch (error: any) {
          const errorMessage = language === 'ar' 
            ? 'حدث خطأ أثناء حذف الإعلان. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred while deleting the advertisement. Please try again.';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCropImageType('single');
      setCropImageIndex(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppedImage) return;

    try {
      // Get CSRF token
      const token = await getCSRFToken();
      if (!token) {
        showToast(
          language === 'ar' ? 'فشل تحميل رمز الأمان' : 'Failed to load security token',
          'error'
        );
        return;
      }

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      // Upload cropped image
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      formData.append('csrfToken', token);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
        },
        credentials: 'include',
        body: formData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        if (cropImageType === 'single') {
          setFormData(prev => ({ ...prev, image: data.url }));
        } else if (cropImageType === 'multiple' && cropImageIndex !== null) {
          setFormData(prev => {
            const newImages = [...prev.images];
            newImages[cropImageIndex] = {
              ...newImages[cropImageIndex],
              url: data.url
            };
            return { ...prev, images: newImages };
          });
        }
        showToast(
          language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
          'success'
        );
        
        // Close cropper after successful upload
        setCropImage(null);
        setCropImageType(null);
        setCropImageIndex(null);
      } else {
        const errorData = await uploadResponse.json().catch(() => ({}));
        let errorMessage = language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image';
        
        if (uploadResponse.status === 403) {
          errorMessage = language === 'ar' 
            ? 'غير مصرح لك برفع الصورة. يرجى التحقق من صلاحياتك' 
            : 'Forbidden: You are not authorized to upload image';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء رفع الصورة' : 'Error uploading image',
        'error'
      );
    } finally {
      setCropImage(null);
      setCropImageType(null);
      setCropImageIndex(null);
    }
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle first file for cropping
    const firstFile = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCropImageType('multiple');
      setCropImageIndex(formData.images.length);
    };
    reader.readAsDataURL(firstFile);
    
    // Reset input
    e.target.value = '';

    // If multiple files, queue them for processing after first crop
    if (files.length > 1) {
      // Store remaining files in a queue (we'll process them one by one after each crop)
      // For now, we'll just handle the first file and let user upload more if needed
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageData = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      subtitle: '',
      subtitleAr: '',
      badge: '',
      badgeAr: '',
      badgeColor: '#DAA520',
      description: '',
      descriptionAr: '',
      buttonText: '',
      buttonTextAr: '',
      image: '',
      price: '',
      originalPrice: '',
      displayType: 'SINGLE',
      sortOrder: 0,
      isActive: true,
      images: [],
      highlightedWord: '',
      highlightedWordAr: '',
      highlightedWordColor: '',
    highlightedWordUnderline: false,
    showDiscountBadge: true,
    discountBadgePosition: 'top-right',
    features: [],
    testimonialText: '',
    testimonialTextAr: '',
    testimonialAuthor: '',
    testimonialAuthorAr: ''
  });
    setEditingAd(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#DAA520]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات</h1>
          <p className="text-sm text-gray-500 mt-1">
            إجمالي الإعلانات: {advertisements.length} ({advertisements.filter(a => a.isActive).length} نشط)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!confirm('هل تريد إضافة الإعلانات الافتراضية؟')) return;
              
              try {
                setIsLoading(true);
                const response = await fetch('/api/admin/advertisements/seed?force=true', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                });
                const data = await response.json();
                
                if (response.ok && data.success) {
                  showToast(
                    language === 'ar' 
                      ? `✅ تم إضافة ${data.count || 0} إعلان افتراضي بنجاح!`
                      : `✅ Successfully added ${data.count || 0} default advertisements!`,
                    'success'
                  );
                  await fetchAdvertisements();
                } else {
                  showToast(
                    language === 'ar'
                      ? '⚠️ ' + (data.message || data.error || 'فشل إضافة الإعلانات')
                      : '⚠️ ' + (data.message || data.error || 'Failed to add advertisements'),
                    'error'
                  );
                }
              } catch (error) {
                showToast(
                  language === 'ar' ? '❌ خطأ: ' + String(error) : '❌ Error: ' + String(error),
                  'error'
                );
              } finally {
                setIsLoading(false);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            title="إضافة إعلانات افتراضية"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" />
            إضافة إعلانات افتراضية
          </button>
          <button
            onClick={fetchAdvertisements}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={openModal}
            className="bg-[#DAA520] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة إعلان جديد
          </button>
        </div>
      </div>

      {advertisements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {language === 'ar' ? 'لا توجد إعلانات' : 'No Advertisements'}
          </h3>
          <p className="text-gray-500 mb-4">
            {language === 'ar' 
              ? 'لم يتم إضافة أي إعلانات بعد. اضغط على "إضافة إعلان جديد" لبدء الإضافة.'
              : 'No advertisements have been added yet. Click "Add New Advertisement" to get started.'}
          </p>
          <button
            onClick={openModal}
            className="bg-[#DAA520] hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة إعلان جديد' : 'Add New Advertisement'}
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {advertisements
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={ad.image || '/uploads/good.png'}
                        alt={ad.title || 'Advertisement'}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/uploads/good.png') {
                            target.src = '/uploads/good.png';
                          }
                        }}
                      />
                      {!ad.image && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{ad.title}</h3>
                    <p className="text-gray-600">{ad.titleAr}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {ad.displayType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>الوصف:</strong> {ad.description}
                  </div>
                  <div>
                    <strong>الوصف العربي:</strong> {ad.descriptionAr}
                  </div>
                  {ad.price && (
                    <div>
                      <strong>السعر:</strong> EGP {ad.price.toLocaleString('en-US')}
                    </div>
                  )}
                  {ad.originalPrice && (
                    <div>
                      <strong>السعر الأصلي:</strong> EGP {ad.originalPrice.toLocaleString('en-US')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(ad)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان (إنجليزي)
                  </label>
                  <textarea
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-none"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان (عربي)
                  </label>
                  <textarea
                    value={formData.titleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-none"
                    rows={2}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان الفرعي (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان الفرعي (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitleAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشارة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشارة (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.badgeAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'لون الشارة' : 'Badge Color'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.badgeColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeColor: e.target.value }))}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.badgeColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeColor: e.target.value }))}
                    placeholder="#DAA520"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'اختر لون الشارة (اللون الذهبي الافتراضي: #DAA520)' : 'Choose badge color (default golden: #DAA520)'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (إنجليزي)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نص الزر (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نص الزر (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.buttonTextAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonTextAr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الصورة
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    <Upload className="w-5 h-5" />
                    رفع صورة
                  </label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر الأصلي
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع العرض
                  </label>
                  <select
                    value={formData.displayType}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  >
                    <option value="SINGLE">صورة واحدة (SINGLE)</option>
                    <option value="MULTIPLE">صور متعددة (MULTIPLE)</option>
                    <option value="GRID">شبكة صور (GRID)</option>
                    <option value="FEATURED">مميز (FEATURED)</option>
                    <option value="CAROUSEL">سلايدر (CAROUSEL)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' 
                      ? 'SINGLE: صورة واحدة مع 4 منتجات في الأسفل | GRID: شبكة من 4 منتجات | FEATURED: عرض مميز'
                      : 'SINGLE: Single image with 4 products below | GRID: Grid of 4 products | FEATURED: Featured display'}
                  </p>
                </div>
              </div>

              {/* Highlighted Word Settings */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">إعدادات الكلمة المميزة</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكلمة المميزة (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={formData.highlightedWord}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlightedWord: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                      placeholder="مثال: Quality"
                    />
                    <p className="text-xs text-gray-500 mt-1">أدخل الكلمة التي تريد تمييزها في النص</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكلمة المميزة (عربي)
                    </label>
                    <input
                      type="text"
                      value={formData.highlightedWordAr}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlightedWordAr: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                      placeholder="مثال: جودة"
                    />
                    <p className="text-xs text-gray-500 mt-1">أدخل الكلمة التي تريد تمييزها في النص</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      لون الكلمة المميزة
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.highlightedWordColor || '#e91e63'}
                        onChange={(e) => setFormData(prev => ({ ...prev, highlightedWordColor: e.target.value }))}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.highlightedWordColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, highlightedWordColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                        placeholder="#e91e63"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">أدخل كود اللون (hex) أو اختر من المنتقي</p>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.highlightedWordUnderline}
                        onChange={(e) => setFormData(prev => ({ ...prev, highlightedWordUnderline: e.target.checked }))}
                        className="w-5 h-5 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                      />
                      <span className="text-sm font-medium text-gray-700">إظهار خط تحت الكلمة المميزة</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ملاحظة:</strong> يجب أن تكون الكلمة المميزة موجودة داخل النص (العنوان أو الوصف) لكي تظهر مميزة.
                  </p>
                </div>
              </div>

              {/* Discount Badge Position Settings */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">إعدادات بادج الخصم</h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showDiscountBadge}
                      onChange={(e) => setFormData(prev => ({ ...prev, showDiscountBadge: e.target.checked }))}
                      className="w-5 h-5 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                    />
                    <span className="text-sm font-medium text-gray-700">إظهار بادج الخصم</span>
                  </label>
                </div>

                {formData.showDiscountBadge && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      موضع بادج الخصم على الصورة
                    </label>
                    <select
                      value={formData.discountBadgePosition}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountBadgePosition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    >
                      <option value="top-right">يمين فوق</option>
                      <option value="top-left">يسار فوق</option>
                      <option value="bottom-right">يمين تحت</option>
                      <option value="bottom-left">يسار تحت</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ملاحظة: بادج الخصم سيتم حسابها تلقائياً حسب السعر الأصلي والسعر الحالي
                    </p>
                  </div>
                )}
              </div>

              {/* Features Section for SINGLE type (Premium Quality Products) */}
              {formData.displayType === 'SINGLE' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">الميزات (Features)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    أضف 3 ميزات (مثل: Premium Materials, Handcrafted Quality, Lifetime Warranty)
                  </p>
                  
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">ميزة {index + 1}</span>
                        <button
                          type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                features: (prev.features || []).filter((_, i) => i !== index)
                              }));
                            }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            العنوان (إنجليزي)
                          </label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...(formData.features || [])];
                              newFeatures[index] = { ...feature, title: e.target.value };
                              setFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                            placeholder="Premium Materials"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            العنوان (عربي)
                          </label>
                          <input
                            type="text"
                            value={feature.titleAr}
                            onChange={(e) => {
                              const newFeatures = [...(formData.features || [])];
                              newFeatures[index] = { ...feature, titleAr: e.target.value };
                              setFormData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                            placeholder="مواد ممتازة"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          أيقونة (اختياري - emoji أو نص)
                        </label>
                        <input
                          type="text"
                          value={feature.icon || ''}
                          onChange={(e) => {
                            const newFeatures = [...(formData.features || [])];
                            newFeatures[index] = { ...feature, icon: e.target.value };
                            setFormData(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                          placeholder="✨ أو أي نص"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        features: [...(prev.features || []), { title: '', titleAr: '', icon: '', sortOrder: (prev.features || []).length }]
                      }));
                    }}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    + إضافة ميزة
                  </button>
                </div>
              )}

              {/* Testimonial Section for SINGLE type */}
              {formData.displayType === 'SINGLE' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">شهادة العميل (Testimonial)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نص الشهادة (إنجليزي)
                      </label>
                      <textarea
                        value={formData.testimonialText}
                        onChange={(e) => setFormData(prev => ({ ...prev, testimonialText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                        rows={3}
                        placeholder="Exceptional quality and design"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نص الشهادة (عربي)
                      </label>
                      <textarea
                        value={formData.testimonialTextAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, testimonialTextAr: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                        rows={3}
                        placeholder="جودة وتصميم استثنائي"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم العميل (إنجليزي)
                      </label>
                      <input
                        type="text"
                        value={formData.testimonialAuthor}
                        onChange={(e) => setFormData(prev => ({ ...prev, testimonialAuthor: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                        placeholder="Satisfied Customer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم العميل (عربي)
                      </label>
                      <input
                        type="text"
                        value={formData.testimonialAuthorAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, testimonialAuthorAr: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                        placeholder="عميل راضٍ"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Images Section for GRID and SINGLE types */}
              {(formData.displayType === 'GRID' || formData.displayType === 'SINGLE') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formData.displayType === 'GRID' ? 'صور المنتجات (4 صور)' : 'صور المنتجات (4 صور للأسفل)'}
                  </h3>
                  
                  {/* Upload Multiple Images */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                      id="multiple-image-upload"
                    />
                    <label
                      htmlFor="multiple-image-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700"
                    >
                      <Upload className="w-5 h-5" />
                      {language === 'ar' ? 'رفع صور متعددة' : 'Upload Multiple Images'}
                    </label>
                    <button
                      type="button"
                      onClick={openProductSelector}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      <Search className="w-5 h-5" />
                      {language === 'ar' ? 'اختر من المنتجات' : 'Select from Products'}
                    </button>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="اسم المنتج (عربي)"
                            value={image.nameAr || ''}
                            onChange={(e) => updateImageData(index, 'nameAr', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="اسم المنتج (إنجليزي)"
                            value={image.name || ''}
                            onChange={(e) => updateImageData(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="السعر"
                            value={image.price || ''}
                            onChange={(e) => updateImageData(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    نشط
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#DAA520] text-white rounded-lg hover:bg-yellow-600"
                >
                  {editingAd ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Product Selector Modal */}
      {isProductSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'اختر من المنتجات' : 'Select from Products'}
              </h2>
              <button
                onClick={() => {
                  setIsProductSelectorOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchProducts(e.target.value);
                  }}
                  placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                />
              </div>
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-[#DAA520]" />
                <span className="ml-2 text-gray-600">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product._id || product.id}
                    onClick={() => selectProduct(product)}
                    className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-[#DAA520] hover:shadow-md transition-all"
                  >
                    <div className="relative w-full h-32 mb-2">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/uploads/good.png') {
                            target.src = '/uploads/good.png';
                          }
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {language === 'ar' ? (product.nameAr || product.name) : product.name}
                    </h3>
                    <p className="text-[#DAA520] font-bold text-sm mt-1">
                      EGP {product.price?.toLocaleString('en-US') || '0'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImage(null);
            setCropImageType(null);
            setCropImageIndex(null);
          }}
          aspectRatio={cropImageType === 'single' ? 16/9 : 1}
          cropShape="rect"
        />
      )}
    </div>
  );
}