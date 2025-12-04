'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { 
  Save, 
  ArrowLeft, 
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

interface ProductFormData {
  name: string;
  nameAr: string;
  slug: string;
  sku: string;
  description: string;
  descriptionAr: string;
  shortDescription: string;
  shortDescriptionAr: string;
  price: number;
  salePrice: number | null;
  discountPercent: number | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  stockQuantity: number;
  gender: string;
}

export default function AddProductPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const { csrfToken } = useCSRF();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    nameAr: '',
    slug: '',
    sku: '',
    description: '',
    descriptionAr: '',
    shortDescription: '',
    shortDescriptionAr: '',
    price: 0,
    salePrice: null,
    discountPercent: null,
    categoryId: '',
    isActive: true,
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    stockQuantity: 0, // Will be calculated from variants
    gender: 'UNISEX',
  });

  const [images, setImages] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<Array<{
    id: string;
    size: string;
    colorFields: Array<{ color: string; stock: number }>;
  }>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-calculate discount percent when price or salePrice changes
  useEffect(() => {
    if (formData.price > 0 && formData.salePrice !== null && formData.salePrice > 0 && formData.salePrice < formData.price) {
      const calculatedDiscount = Math.round(((formData.price - formData.salePrice) / formData.price) * 100);
      setFormData(prev => ({
        ...prev,
        discountPercent: calculatedDiscount
      }));
    } else if (formData.salePrice === null || formData.salePrice === 0) {
      setFormData(prev => ({
        ...prev,
        discountPercent: null
      }));
    }
  }, [formData.price, formData.salePrice]);

  // Auto-calculate total stock from variants
  useEffect(() => {
    const totalStock = variantRows.reduce((sum, row) => 
      sum + row.colorFields.reduce((rowSum, field) => rowSum + (field.stock || 0), 0), 0
    );
    setFormData(prev => ({
      ...prev,
      stockQuantity: totalStock
    }));
  }, [variantRows]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AddProduct] Categories response:', data);
        
        // 🔥 SECURITY: Handle structured response format: {success: true, data: {categories: [...]}}
        // Also handle legacy format: {categories: [...]}
        const categoriesList = data.success && data.data?.categories 
          ? data.data.categories 
          : data.categories || [];
        
        // 🔥 SECURITY: Ensure categories is always an array to prevent .map() errors
        const validCategories = Array.isArray(categoriesList) ? categoriesList : [];
        console.log('[AddProduct] Parsed categories:', validCategories);
        setCategories(validCategories);
        
        if (validCategories.length === 0) {
          console.warn('[AddProduct] No categories found. Please create categories first.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch categories:', response.status, response.statusText, errorData);
        // Ensure categories remains an array even on error
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Ensure categories remains an array even on error
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const addVariant = () => {
    setVariantRows(prev => [...prev, {
      id: Date.now().toString(),
      size: '',
      colorFields: [{ color: '', stock: 0 }]
    }]);
  };

  const addColorField = (rowIndex: number) => {
    setVariantRows(prev => prev.map((row, i) => 
      i === rowIndex 
        ? { ...row, colorFields: [...row.colorFields, { color: '', stock: 0 }] }
        : row
    ));
  };

  const removeColorField = (rowIndex: number, fieldIndex: number) => {
    setVariantRows(prev => prev.map((row, i) => 
      i === rowIndex 
        ? { ...row, colorFields: row.colorFields.filter((_, fi) => fi !== fieldIndex) }
        : row
    ));
  };

  const removeRow = (index: number) => {
    setVariantRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRowSize = (index: number, value: string) => {
    setVariantRows(prev => prev.map((row, i) => 
      i === index ? { ...row, size: value } : row
    ));
  };

  const updateColorField = (rowIndex: number, fieldIndex: number, field: 'color' | 'stock', value: string | number) => {
    setVariantRows(prev => prev.map((row, i) => 
      i === rowIndex 
        ? { ...row, colorFields: row.colorFields.map((fieldData, fi) => 
            fi === fieldIndex ? { ...fieldData, [field]: value } : fieldData
          )}
        : row
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.nameAr || !formData.sku || !formData.categoryId) {
      showToast(t('admin.fillRequiredFields'), 'error', 3000);
      return;
    }

    setIsSaving(true);
    try {
      // Calculate discount percent if salePrice is provided
      let finalSalePrice = formData.salePrice;
      let finalDiscountPercent = formData.discountPercent;
      
      if (finalSalePrice !== null && finalSalePrice > 0 && formData.price > 0) {
        // Auto-calculate discount percent if not provided
        if (finalDiscountPercent === null) {
          finalDiscountPercent = Math.round(((formData.price - finalSalePrice) / formData.price) * 100);
        }
      } else {
        // If no sale price, set both to null
        finalSalePrice = null;
        finalDiscountPercent = null;
      }
      
      // Convert variant rows to variants format
      const convertedVariants: Array<{
        type: 'SIZE' | 'COLOR';
        value: string;
        valueAr: string;
        stock: number;
      }> = [];
      
      // Collect unique sizes and colors
      const sizes = new Set<string>();
      const colors = new Set<string>();
      const variantCombinations: Array<{size?: string; color?: string; stock: number}> = [];
      
      variantRows.forEach(row => {
        if (row.size && row.size.trim()) {
          sizes.add(row.size);
          // For each color field in this row
          row.colorFields.forEach(field => {
            if (field.color && field.color.trim()) {
              colors.add(field.color);
              variantCombinations.push({
                size: row.size,
                color: field.color,
                stock: field.stock || 0
              });
            }
          });
        }
      });
      
      // Create SIZE variants - store stock on size only
      sizes.forEach(size => {
        // Find all combinations for this size and get maximum stock
        const sizeCombos = variantCombinations.filter(c => c.size === size);
        const maxStock = sizeCombos.reduce((max, c) => Math.max(max, c.stock || 0), 0);
        
        convertedVariants.push({
          type: 'SIZE',
          value: size,
          valueAr: size,
          stock: maxStock
        });
      });
      
      // Create COLOR variants - no stock, colors are children of sizes
      colors.forEach(color => {
        convertedVariants.push({
          type: 'COLOR',
          value: color,
          valueAr: color,
          stock: 0 // Colors don't have stock, they inherit from parent size
        });
      });
      
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

      const productData = {
        ...formData,
        salePrice: finalSalePrice || null,
        discountPercent: finalDiscountPercent || null,
        images: images.map((url, index) => ({
          url,
          sortOrder: index,
          alt: formData.name,
          altAr: formData.nameAr
        })),
        variants: convertedVariants,
        variantCombinations: variantCombinations.map((combo) => ({
          size: combo.size || null,
          color: combo.color || null,
          stock: combo.stock || 0
        })),
        csrfToken
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        showToast(t('admin.productCreated'), 'success', 3000);
        router.push('/admin/products');
      } else {
        const error = await response.json();
        console.error('[AddProduct] Error response:', error);
        // Handle structured error format: {success: false, error: "..."}
        const errorMessage = error.success === false 
          ? error.error 
          : error.error || t('admin.errorCreatingProduct');
        showToast(errorMessage, 'error', 4000);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showToast(t('admin.errorCreatingProduct'), 'error', 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt(t('admin.enterImageUrl'));
    if (url && url.trim()) {
      setImages(prev => [...prev, url.trim()]);
    }
  };

  const addImageFromFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // Upload each file to server
        for (const file of Array.from(files)) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              credentials: 'include',
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.url) {
                setImages(prev => [...prev, data.url]);
                console.log('[Add Product] Image uploaded successfully:', data.url);
              } else {
                console.error('[Add Product] No URL in upload response:', data);
                showToast('Failed to upload image: No URL returned', 'error', 3000);
              }
            } else {
              const error = await response.json();
              console.error('[Add Product] Upload failed:', error);
              showToast(error.error || 'Failed to upload image', 'error', 3000);
            }
          } catch (error) {
            console.error('[Add Product] Error uploading image:', error);
            showToast('Failed to upload image', 'error', 3000);
          }
        }
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('admin.back')}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('admin.addProduct')}
              </h1>
              <p className="text-gray-600">
                {t('admin.addProductDescription')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.basicInformation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productName')} (English) *
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="product-nameAr" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productName')} (العربية) *
                </label>
                <input
                  id="product-nameAr"
                  name="nameAr"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.nameAr}
                  onChange={(e) => handleInputChange('nameAr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label htmlFor="product-slug" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.slug')} *
                </label>
                <input
                  id="product-slug"
                  name="slug"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="product-sku" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.sku')} *
                </label>
                <input
                  id="product-sku"
                  name="sku"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.category')} *
                </label>
                <select
                  id="product-category"
                  name="categoryId"
                  autoComplete="off"
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  disabled={isLoading || categories.length === 0}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isLoading || categories.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {isLoading 
                      ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
                      : categories.length === 0
                      ? (language === 'ar' ? 'لا توجد أقسام متاحة - يرجى إنشاء قسم أولاً' : 'No categories available - Please create a category first')
                      : t('admin.selectCategory')
                    }
                  </option>
                  {/* 🔥 SECURITY: Ensure categories is an array before mapping */}
                  {Array.isArray(categories) && categories.length > 0 && categories.map(category => (
                    <option key={category.id || category._id} value={category.id || category._id}>
                      {language === 'ar' ? (category.nameAr || category.name) : (category.name || category.nameAr)}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && !isLoading && (
                  <p className="mt-2 text-sm text-amber-600">
                    {language === 'ar' 
                      ? '⚠️ لا توجد أقسام متاحة. يرجى الذهاب إلى صفحة الأقسام وإنشاء قسم أولاً.'
                      : '⚠️ No categories available. Please go to the categories page and create a category first.'
                    }
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="product-gender" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.gender')}
                </label>
                <select
                  id="product-gender"
                  name="gender"
                  autoComplete="off"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="UNISEX">{t('admin.unisex')}</option>
                  <option value="MALE">{t('admin.male')}</option>
                  <option value="FEMALE">{t('admin.female')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.descriptions')}
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="product-shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.shortDescription')} (English)
                  </label>
                  <textarea
                    id="product-shortDescription"
                    name="shortDescription"
                    autoComplete="off"
                    rows={3}
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="product-shortDescriptionAr" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.shortDescription')} (العربية)
                  </label>
                  <textarea
                    id="product-shortDescriptionAr"
                    name="shortDescriptionAr"
                    autoComplete="off"
                    rows={3}
                    value={formData.shortDescriptionAr}
                    onChange={(e) => handleInputChange('shortDescriptionAr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.description')} (English) *
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    autoComplete="off"
                    rows={6}
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="product-descriptionAr" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.description')} (العربية) *
                  </label>
                  <textarea
                    id="product-descriptionAr"
                    name="descriptionAr"
                    autoComplete="off"
                    rows={6}
                    required
                    value={formData.descriptionAr}
                    onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.pricingInventory')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.price')} (EGP) *
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  autoComplete="off"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="product-salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.salePrice')} (EGP) <span className="text-gray-400 text-xs">({language === 'ar' ? 'اختياري - إذا كان هناك خصم' : 'Optional - if on sale'})</span>
                </label>
                <input
                  id="product-salePrice"
                  name="salePrice"
                  type="number"
                  autoComplete="off"
                  min="0"
                  step="0.01"
                  value={formData.salePrice ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('salePrice', value === '' ? null : parseFloat(value) || null);
                  }}
                  placeholder={language === 'ar' ? 'اتركه فارغاً إذا لم يكن هناك خصم' : 'Leave empty if no discount'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="product-discountPercent" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.discountPercent')} (%) <span className="text-gray-400 text-xs">({language === 'ar' ? 'اختياري' : 'Optional'})</span>
                </label>
                <input
                  id="product-discountPercent"
                  name="discountPercent"
                  type="number"
                  autoComplete="off"
                  min="0"
                  max="100"
                  value={formData.discountPercent ?? ''}
                  readOnly
                  placeholder={language === 'ar' ? 'سيتم حسابه تلقائياً' : 'Calculated automatically'}
                  disabled={formData.salePrice === null || formData.salePrice === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-gray-50"
                />
                {formData.price > 0 && formData.salePrice !== null && formData.salePrice > 0 && formData.discountPercent !== null && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    {language === 'ar' 
                      ? `✅ تم حساب الخصم تلقائياً: ${formData.discountPercent}%`
                      : `✅ Discount calculated automatically: ${formData.discountPercent}%`
                    }
                  </p>
                )}
                {formData.salePrice === null || formData.salePrice === 0 ? (
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'ar' 
                      ? 'أدخل سعر الخصم أولاً لتظهر نسبة الخصم'
                      : 'Enter sale price first to see discount percent'
                    }
                  </p>
                ) : null}
              </div>
              
              <div>
                <label htmlFor="product-stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.stockQuantity')} <span className="text-gray-400 text-xs">({language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'})</span>
                </label>
                <input
                  id="product-stockQuantity"
                  name="stockQuantity"
                  type="number"
                  autoComplete="off"
                  value={formData.stockQuantity}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-green-600 mt-1 font-medium">
                  {language === 'ar' 
                    ? `✅ تم حساب المخزون تلقائياً من المتغيرات`
                    : `✅ Stock automatically calculated from variants`
                  }
                </p>
              </div>
              
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('admin.productImages')}
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addImageFromFile}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'رفع ملف' : 'Upload File'}
                </button>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة رابط' : 'Add URL'}
                </button>
              </div>
            </div>
            
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {url.startsWith('data:') ? 'File' : 'URL'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">{t('admin.noImagesAdded')}</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={addImageFromFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === 'ar' ? 'رفع ملف' : 'Upload File'}
                  </button>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {language === 'ar' ? 'إضافة رابط' : 'Add URL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Variants - Combined System */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'ar' ? 'إدارة المنتج: المقاسات والألوان والمخزون' : 'Product Management: Sizes, Colors & Stock'}
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة شريط جديد' : 'Add New Row'}
              </button>
            </div>

            {/* Professional Color Palette Helper */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {language === 'ar' ? '🎨 لوحة الألوان الجاهزة - اضغط للتحديد' : '🎨 Quick Color Palette - Click to Select'}
              </h4>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                {[
                  { name: 'أبيض / White', value: 'white', hex: '#FFFFFF' },
                  { name: 'أسود / Black', value: 'black', hex: '#000000' },
                  { name: 'أحمر / Red', value: 'red', hex: '#FF0000' },
                  { name: 'أزرق / Blue', value: 'blue', hex: '#0066FF' },
                  { name: 'أخضر / Green', value: 'green', hex: '#00AA00' },
                  { name: 'أصفر / Yellow', value: 'yellow', hex: '#FFDD00' },
                  { name: 'برتقالي / Orange', value: 'orange', hex: '#FF6600' },
                  { name: 'بنفسجي / Purple', value: 'purple', hex: '#9900FF' },
                  { name: 'وردي / Pink', value: 'pink', hex: '#FF33CC' },
                  { name: 'بني / Brown', value: 'brown', hex: '#8B4513' },
                  { name: 'رمادي / Gray', value: 'gray', hex: '#808080' },
                  { name: 'كحلي / Navy', value: 'navy', hex: '#000066' },
                  { name: 'بيج / Beige', value: 'beige', hex: '#DDCCAA' },
                  { name: 'كريمي / Cream', value: 'cream', hex: '#FFFAA0' },
                  { name: 'ذهبي / Gold', value: 'gold', hex: '#FFCC00' },
                  { name: 'فضي / Silver', value: 'silver', hex: '#C0C0C0' },
                  { name: 'كستنائي / Burgundy', value: 'burgundy', hex: '#800020' },
                  { name: 'مرجاني / Coral', value: 'coral', hex: '#FF6347' },
                  { name: 'طرطوزي / Turquoise', value: 'turquoise', hex: '#00CED1' },
                  { name: 'عاجي / Ivory', value: 'ivory', hex: '#FFFFAA' },
                  { name: 'خاكي / Khaki', value: 'khaki', hex: '#C3B091' },
                  { name: 'زيتوني / Olive', value: 'olive', hex: '#556B2F' },
                  { name: 'كموني / Tan', value: 'tan', hex: '#D2B48C' },
                  { name: 'لافندر / Lavender', value: 'lavender', hex: '#9966CC' },
                  { name: 'بيسون / Peach', value: 'peach', hex: '#FFCC99' },
                  { name: 'سالمون / Salmon', value: 'salmon', hex: '#FF6666' },
                  { name: 'كحل / Charcoal', value: 'charcoal', hex: '#36454F' },
                  { name: 'رماد / Ash', value: 'ash', hex: '#B2BEB5' },
                  { name: 'حجر / Stone', value: 'stone', hex: '#928E85' },
                  { name: 'نبيذ / Wine', value: 'wine', hex: '#922C3C' },
                  { name: 'كونياك / Cognac', value: 'cognac', hex: '#B87333' },
                  { name: 'موف / Taupe', value: 'taupe', hex: '#708090' },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      // Find first empty color field in last row or add to first row
                      if (variantRows.length > 0) {
                        const lastRow = variantRows[variantRows.length - 1];
                        const emptyFieldIdx = lastRow.colorFields.findIndex(f => !f.color || f.color.trim() === '');
                        if (emptyFieldIdx !== -1) {
                          updateColorField(variantRows.length - 1, emptyFieldIdx, 'color', color.value);
                        } else {
                          addColorField(variantRows.length - 1);
                          // The newly added field will be at the end
                          setTimeout(() => {
                            updateColorField(variantRows.length - 1, lastRow.colorFields.length, 'color', color.value);
                          }, 0);
                        }
                      }
                    }}
                    className="relative group"
                    title={color.name}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition-all shadow-md hover:shadow-lg transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {color.name.split(' / ')[language === 'ar' ? 0 : 1]}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                {language === 'ar' 
                  ? '💡 نصيحة: اضغط على أي لون لتحديده، سيتم إضافته تلقائياً إلى الشريط'
                  : '💡 Tip: Click any color to select it, it will be automatically added to the row'
                }
              </p>
            </div>
            
            {variantRows.length > 0 ? (
              <div className="space-y-4">
                {variantRows.map((row, rowIndex) => {
                  // Color mapping function
                  const getColorHex = (colorName: string): string => {
                    const colorMap: { [key: string]: string } = {
                      'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000', 'blue': '#0000FF',
                      'green': '#008000', 'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
                      'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',
                      'navy': '#000080', 'beige': '#F5F5DC', 'cream': '#FFFDD0', 'gold': '#FFD700',
                      'silver': '#C0C0C0', 'burgundy': '#800020', 'maroon': '#800000', 'coral': '#FF7F50',
                      'turquoise': '#40E0D0', 'ivory': '#FFFFF0', 'khaki': '#F0E68C', 'olive': '#808000',
                      'tan': '#D2B48C', 'lavender': '#E6E6FA', 'mint': '#F5FFFA', 'peach': '#FFE5B4',
                      'salmon': '#FA8072', 'wine': '#722F37', 'cognac': '#9F4636', 'taupe': '#483C32',
                      'charcoal': '#36454F', 'ash': '#B2BEB5', 'stone': '#928E85',
                    };
                    const normalizedColor = colorName?.toLowerCase().trim();
                    if (!normalizedColor) return '#808080';
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorName || '')) {
                      return colorName || '#808080';
                    }
                    return colorMap[normalizedColor] || '#808080';
                  };

                  return (
                    <div key={row.id} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'المقاس' : 'Size'}
                        value={row.size}
                        onChange={(e) => updateRowSize(rowIndex, e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => addColorField(rowIndex)}
                        disabled={!row.size}
                        className="p-1.5 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={language === 'ar' ? 'إضافة لون جديد لهذا المقاس' : 'Add color for this size'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      
                      {row.colorFields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={language === 'ar' ? 'اللون' : 'Color'}
                              value={field.color}
                              onChange={(e) => updateColorField(rowIndex, fieldIndex, 'color', e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {field.color && (
                              <div 
                                className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md flex-shrink-0"
                                style={{ backgroundColor: getColorHex(field.color) }}
                                title={field.color}
                              />
                            )}
                            <input
                              type="number"
                              placeholder={language === 'ar' ? 'المخزون' : 'Stock'}
                              value={field.stock}
                              onChange={(e) => updateColorField(rowIndex, fieldIndex, 'stock', parseInt(e.target.value) || 0)}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorField(rowIndex, fieldIndex)}
                              className="p-1.5 text-red-600 hover:text-red-800"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        className="p-2 text-red-600 hover:text-red-800 ml-auto"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {language === 'ar' ? 'لا توجد متغيرات مضافة. انقر على "إضافة شريط جديد" لإضافة المقاسات والألوان.' : 'No variants added. Click "Add New Row" to add sizes and colors.'}
              </p>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.productSettings')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  {t('admin.activeProduct')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                  {t('admin.featuredProduct')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNew"
                  checked={formData.isNew}
                  onChange={(e) => handleInputChange('isNew', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isNew" className="ml-2 block text-sm text-gray-900">
                  {language === 'ar' ? 'منتج جديد' : 'New Product'}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBestseller"
                  checked={formData.isBestseller}
                  onChange={(e) => handleInputChange('isBestseller', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isBestseller" className="ml-2 block text-sm text-gray-900">
                  {language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'}
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 mb-8 pr-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
            >
              {t('admin.cancelAction')}
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-lg text-base font-bold text-white bg-[#DAA520] hover:bg-[#B8860B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DAA520] disabled:opacity-50 whitespace-nowrap transform hover:scale-105 transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? t('admin.saving') : t('admin.saveProduct')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
