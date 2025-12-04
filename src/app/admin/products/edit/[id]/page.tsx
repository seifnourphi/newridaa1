'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { getCSRFToken } from '@/lib/csrf-client';
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

export default function EditProductPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = (params?.id as string) || '';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  
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
    stockQuantity: 0,
    gender: 'UNISEX',
  });

  const [images, setImages] = useState<string[]>([]);
  const [variantCombinations, setVariantCombinations] = useState<Array<{
    size?: string;
    color?: string;
    stock: number;
  }>>([]);

  useEffect(() => {
    if (!productId) {
      console.error('Product ID is missing');
      showToast('Invalid product ID', 'error', 3000);
      router.push('/admin/products');
      return;
    }
    fetchCategories();
    fetchProduct();
  }, [productId]);

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
    const totalStock = variantCombinations.reduce((sum, combo) => sum + (combo.stock || 0), 0);
    setFormData(prev => ({
      ...prev,
      stockQuantity: totalStock
    }));
  }, [variantCombinations]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // 🔥 SECURITY: Handle structured response format: {success: true, data: {categories: [...]}}
        // Also handle legacy format: {categories: [...]}
        const categoriesList = data.success && data.data?.categories 
          ? data.data.categories 
          : data.categories || [];
        // 🔥 SECURITY: Ensure categories is always an array to prevent .map() errors
        const validCategories = Array.isArray(categoriesList) ? categoriesList : [];
        console.log('[EditProduct] Loaded categories:', validCategories.length);
        setCategories(validCategories);
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        // Ensure categories remains an array even on error
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Ensure categories remains an array even on error
      setCategories([]);
    }
  };

  const fetchProduct = async () => {
    if (!productId) {
      console.error('Cannot fetch product: productId is missing');
      showToast('Invalid product ID', 'error', 3000);
      router.push('/admin/products');
      return;
    }
    
    try {
      setIsLoadingProduct(true);
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Failed to fetch product:', response.status, response.statusText);
        showToast('Failed to fetch product', 'error', 3000);
        router.push('/admin/products');
        return;
      }
      
      const data = await response.json().catch((err) => {
        console.error('Error parsing JSON response:', err);
        return null;
      });
      
      if (!data) {
        console.error('Invalid response data');
        showToast('Invalid response from server', 'error', 3000);
        router.push('/admin/products');
        return;
      }
      
      console.log('[EditProduct] Raw API response:', data);
      
      // Handle different response formats:
      // 1. {success: true, data: product} - Backend format
      // 2. {success: true, data: {product: ...}} - Alternative format
      // 3. {product: ...} - Direct format
      let product = null;
      try {
        if (data?.success && data?.data) {
          // Check if data.data is the product directly or contains a product property
          // Safely access data.data.product with optional chaining
          if (data.data?.product) {
            product = data.data.product;
          } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            product = data.data;
          }
        } else if (data?.product) {
          product = data.product;
        } else if (data && typeof data === 'object' && !data.success && !Array.isArray(data)) {
          // Last resort: data itself might be the product (if it's an object and not a response wrapper)
          product = data;
        }
      } catch (error) {
        console.error('Error parsing product data:', error);
        product = null;
      }
      
      console.log('[EditProduct] Parsed product:', product);
      
      // 🔥 SECURITY: Validate product exists before accessing properties
      if (!product || typeof product !== 'object' || product === null || Array.isArray(product)) {
        console.error('Product not found in response:', data);
        showToast('Product not found', 'error', 3000);
        router.push('/admin/products');
        return;
      }
      
      // All product property access should be safe now
        
        // Handle category - it might be an object with _id or id, or a string ID
        let categoryId = '';
        try {
          if (product?.category) {
            if (typeof product.category === 'object' && product.category !== null) {
              // Handle MongoDB ObjectId or regular id
              const catId = product.category._id || product.category.id;
              if (catId) {
                categoryId = typeof catId === 'string' ? catId : String(catId);
              }
            } else if (product.category) {
              categoryId = String(product.category);
            }
          } else if (product?.categoryId) {
            if (typeof product.categoryId === 'object' && product.categoryId !== null) {
              const catId = product.categoryId._id || product.categoryId.id;
              if (catId) {
                categoryId = typeof catId === 'string' ? catId : String(catId);
              }
            } else if (product.categoryId) {
              categoryId = String(product.categoryId);
            }
          }
        } catch (error) {
          console.error('Error parsing category ID:', error);
          categoryId = '';
        }
        
        setFormData({
          name: product?.name || '',
          nameAr: product?.nameAr || '',
          slug: product?.slug || '',
          sku: product?.sku || '',
          description: product?.description || '',
          descriptionAr: product?.descriptionAr || '',
          shortDescription: product?.shortDescription || '',
          shortDescriptionAr: product?.shortDescriptionAr || '',
          price: product?.price || 0,
          salePrice: product?.salePrice && product.salePrice > 0 ? product.salePrice : null,
          discountPercent: product?.discountPercent && product.discountPercent > 0 ? product.discountPercent : null,
          categoryId: categoryId,
          isActive: product?.isActive !== undefined ? product.isActive : true,
          isFeatured: product?.isFeatured !== undefined ? product.isFeatured : false,
          isNew: product?.isNew !== undefined ? product.isNew : false,
          isBestseller: product?.isBestseller !== undefined ? product.isBestseller : false,
          stockQuantity: product?.stockQuantity || 0,
          gender: product?.gender || 'UNISEX',
        });

        // Handle images - they might be strings or objects with url property
        const imageUrls = product.images?.map((img: any) => {
          if (typeof img === 'string') {
            return img;
          } else if (img && img.url) {
            return img.url;
          } else if (img && img.path) {
            return img.path;
          }
          return '';
        }).filter((url: string) => url) || [];
        setImages(imageUrls);
        
        // Load variant combinations from database (new system)
        if (product?.variantCombinations && Array.isArray(product.variantCombinations) && product.variantCombinations.length > 0) {
          // Use the actual combinations stored in database
          const combinations = product.variantCombinations.map((combo: any) => ({
            size: combo.size || undefined,
            color: combo.color || undefined,
            stock: combo.stock || 0
          }));
          setVariantCombinations(combinations);
        } else {
          // Fallback: Convert old variants format to new variantCombinations format (for legacy products)
          const combinations: Array<{size?: string; color?: string; stock: number}> = [];
          const sizes = (product?.variants && Array.isArray(product.variants)) 
            ? product.variants.filter((v: any) => v?.type === 'SIZE') 
            : [];
          const colors = (product?.variants && Array.isArray(product.variants)) 
            ? product.variants.filter((v: any) => v?.type === 'COLOR') 
            : [];
          
          // Create combinations from old variants
          if (sizes.length > 0 && colors.length > 0) {
            sizes.forEach((sizeVariant: any) => {
              colors.forEach((colorVariant: any) => {
                const exists = combinations.find(c => 
                  c.size === sizeVariant.value && c.color === colorVariant.value
                );
                if (!exists) {
                  combinations.push({
                    size: sizeVariant.value,
                    color: colorVariant.value,
                    stock: sizeVariant.stock || 0
                  });
                }
              });
            });
          } else if (sizes.length > 0) {
            sizes.forEach((sizeVariant: any) => {
              combinations.push({
                size: sizeVariant.value,
                stock: sizeVariant.stock || 0
              });
            });
          } else if (colors.length > 0) {
            colors.forEach((colorVariant: any) => {
              combinations.push({
                color: colorVariant.value,
                stock: 0
              });
            });
          }
          
          setVariantCombinations(combinations);
        }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      const errorMessage = error?.message || 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error?.stack,
        name: error?.name
      });
      showToast(`Error loading product: ${errorMessage}`, 'error', 4000);
      router.push('/admin/products');
    } finally {
      setIsLoadingProduct(false);
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
    console.log('[EditProduct] Input change:', field, value);
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
    setVariantCombinations(prev => [...prev, {
      size: '',
      color: '',
      stock: 0
    }]);
  };

  const addColorForSameSize = (currentIndex: number) => {
    const currentCombo = variantCombinations[currentIndex];
    if (currentCombo.size) {
      setVariantCombinations(prev => {
        const newCombos = [...prev];
        newCombos.splice(currentIndex + 1, 0, {
          size: currentCombo.size,
          color: '',
          stock: 0
        });
        return newCombos;
      });
    }
  };

  const addSizeForSameColor = (currentIndex: number) => {
    const currentCombo = variantCombinations[currentIndex];
    if (currentCombo.color) {
      setVariantCombinations(prev => {
        const newCombos = [...prev];
        newCombos.splice(currentIndex + 1, 0, {
          size: '',
          color: currentCombo.color,
          stock: 0
        });
        return newCombos;
      });
    }
  };

  const removeVariant = (index: number) => {
    setVariantCombinations(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariantCombinations(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
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
      
      // Convert variant combinations to variants format
      const convertedVariants: Array<{
        type: 'SIZE' | 'COLOR';
        value: string;
        valueAr: string;
        stock: number;
      }> = [];
      
      // Collect unique sizes and colors from combinations
      const sizes = new Set<string>();
      const colors = new Set<string>();
      
      variantCombinations.forEach(combo => {
        if (combo.size && combo.size.trim()) sizes.add(combo.size);
        if (combo.color && combo.color.trim()) colors.add(combo.color);
      });
      
      // Create SIZE variants - store stock on size only
      sizes.forEach(size => {
        // Find all combinations for this size and get maximum stock
        const sizeCombos = variantCombinations.filter(c => c.size === size);
        const maxStock = sizeCombos.reduce((max, c) => Math.max(max, c.stock), 0);
        
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
      
      // Get CSRF token
      const csrfToken = await getCSRFToken();

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
        variantCombinations: variantCombinations.map((combo, index) => ({
          size: combo.size || null,
          color: combo.color || null,
          stock: combo.stock || 0
        })),
        csrfToken, // Add CSRF token to request body
      };

      // Sending PUT request - no sensitive data logged

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      console.log('[EditProduct] Response status:', response.status);

      if (response.ok) {
        showToast(t('admin.productUpdated'), 'success', 3000);
        router.push('/admin/products');
      } else {
        const error = await response.json();
        showToast(error.error || t('admin.errorUpdatingProduct'), 'error', 4000);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToast(t('admin.errorUpdatingProduct'), 'error', 4000);
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

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
                {t('admin.editProduct')}
              </h1>
              <p className="text-gray-600">
                {t('admin.editProductDescription')}
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
                <label htmlFor="edit-product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productName')} (English) *
                </label>
                <input
                  id="edit-product-name"
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
                <label htmlFor="edit-product-nameAr" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productName')} (العربية) *
                </label>
                <input
                  id="edit-product-nameAr"
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
                <label htmlFor="edit-product-slug" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.slug')} *
                </label>
                <input
                  id="edit-product-slug"
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
                <label htmlFor="edit-product-sku" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.sku')} *
                </label>
                <input
                  id="edit-product-sku"
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
                <label htmlFor="edit-product-category" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.category')} *
                </label>
                <select
                  id="edit-product-category"
                  name="categoryId"
                  autoComplete="off"
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('admin.selectCategory')}</option>
                  {/* 🔥 SECURITY: Ensure categories is an array before mapping */}
                  {Array.isArray(categories) && categories.map(category => {
                    const categoryId = category?.id || category?._id || '';
                    return (
                      <option key={categoryId} value={categoryId}>
                        {language === 'ar' ? (category?.nameAr || category?.name || '') : (category?.name || '')}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-product-gender" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.gender')}
                </label>
                <select
                  id="edit-product-gender"
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

          {/* Pricing & Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.pricingInventory')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="edit-product-price" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.price')} (EGP) *
                </label>
                <input
                  id="edit-product-price"
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
                <label htmlFor="edit-product-salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.salePrice')} (EGP) <span className="text-gray-400 text-xs">({language === 'ar' ? 'اختياري - إذا كان هناك خصم' : 'Optional - if on sale'})</span>
                </label>
                <input
                  id="edit-product-salePrice"
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
                <label htmlFor="edit-product-discountPercent" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.discountPercent')} (%) <span className="text-gray-400 text-xs">({language === 'ar' ? 'اختياري' : 'Optional'})</span>
                </label>
                <input
                  id="edit-product-discountPercent"
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
                <label htmlFor="edit-product-stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.stockQuantity')} <span className="text-gray-400 text-xs">({language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'})</span>
                </label>
                <input
                  id="edit-product-stockQuantity"
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
                      // Find first empty color or last combination with empty color
                      const emptyIdx = variantCombinations.findIndex(c => !c.color || c.color.trim() === '');
                      if (emptyIdx !== -1) {
                        updateVariant(emptyIdx, 'color', color.value);
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
            
            {variantCombinations.length > 0 ? (
              <div className="space-y-4">
                {variantCombinations.map((combo, index) => {
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
                    <div key={index} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'المقاس' : 'Size'}
                        value={combo.size || ''}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => addSizeForSameColor(index)}
                        disabled={!combo.color}
                        className="p-1.5 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={language === 'ar' ? 'إضافة مقاس جديد لنفس اللون' : 'Add another size for same color'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'اللون' : 'Color'}
                        value={combo.color || ''}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      
                      {/* Color Preview */}
                      {combo.color && (
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md"
                          style={{ backgroundColor: getColorHex(combo.color) }}
                          title={combo.color}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => addColorForSameSize(index)}
                        disabled={!combo.size}
                        className="p-1.5 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={language === 'ar' ? 'إضافة لون جديد لنفس المقاس' : 'Add another color for same size'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      
                      <input
                        type="number"
                        placeholder={language === 'ar' ? 'المخزون' : 'Stock'}
                        value={combo.stock}
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:text-red-800"
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

          {/* Product Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.productImages')}
            </h3>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-4">
                {/* URL Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.addImageUrl')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const url = (e.target as HTMLInputElement).value.trim();
                          if (url) {
                            setImages(prev => [...prev, url]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                        const url = input.value.trim();
                        if (url) {
                          setImages(prev => [...prev, url]);
                          input.value = '';
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.add')}
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.uploadImageFile')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files) {
                          // Upload each file to server
                          for (const file of Array.from(files)) {
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              const uploadResponse = await fetch('/api/upload', {
                                method: 'POST',
                                credentials: 'include',
                                body: formData,
                              });
                              
                              if (uploadResponse.ok) {
                                const uploadData = await uploadResponse.json();
                                if (uploadData.url) {
                                  setImages(prev => [...prev, uploadData.url]);
                                  console.log('[Edit Product] Image uploaded successfully:', uploadData.url);
                                } else {
                                  console.error('[Edit Product] No URL in upload response:', uploadData);
                                }
                              } else {
                                const error = await uploadResponse.json();
                                console.error('[Edit Product] Upload failed:', error);
                              }
                            } catch (error) {
                              console.error('[Edit Product] Error uploading image:', error);
                            }
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/good.png';
                          }}
                        />
                      </div>
                      
                      {/* Image Controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Image Order */}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  {t('admin.imageInstructions')}
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>روابط URL:</strong> يمكنك إضافة روابط من Unsplash، Google Images، أو أي موقع آخر</li>
                  <li>• <strong>رفع من الجهاز:</strong> يمكنك رفع الصور مباشرة من جهازك</li>
                  <li>• <strong>الصورة الأولى:</strong> ستكون الصورة الرئيسية للمنتج</li>
                  <li>• <strong>تأثير Fade:</strong> الصورة الثانية ستظهر عند hover في الصفحة الرئيسية</li>
                </ul>
                
                <div className="mt-3 p-3 bg-blue-100 rounded-md">
                  <p className="text-sm text-blue-900 font-medium">مواقع مقترحة للصور:</p>
                  <div className="mt-2 space-y-1 text-xs text-blue-700">
                    <p>• <strong>Unsplash:</strong> https://unsplash.com (صور مجانية عالية الجودة)</p>
                    <p>• <strong>Pexels:</strong> https://pexels.com (صور مجانية)</p>
                    <p>• <strong>Pixabay:</strong> https://pixabay.com (صور مجانية)</p>
                  </div>
                </div>
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
              {isSaving ? t('admin.saving') : t('admin.updateProduct')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

