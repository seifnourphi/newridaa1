'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCSRF } from '@/hooks/useCSRF';
import { useToast } from '@/components/providers/ToastProvider';
import { Save, Settings, Eye, EyeOff, Search, X } from 'lucide-react';

interface SectionSettings {
  id: string;
  name: string;
  nameAr: string;
  isEnabled: boolean;
  sortOrder: number;
  maxProducts: number;
  showTitle: boolean;
  showViewAll: boolean;
  selectedProductIds?: string[]; // For latest section - selected products to display
}

export default function SectionsPage() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { csrfToken } = useCSRF();
  const [sections, setSections] = useState<SectionSettings[]>([
    {
      id: 'featured',
      name: 'Featured Products',
      nameAr: 'المنتجات المميزة',
      isEnabled: true,
      sortOrder: 1,
      maxProducts: 8,
      showTitle: true,
      showViewAll: true
    },
    {
      id: 'latest',
      name: 'Latest Products',
      nameAr: 'أحدث المنتجات',
      isEnabled: true,
      sortOrder: 2,
      maxProducts: 8,
      showTitle: true,
      showViewAll: true
    },
    {
      id: 'bestsellers',
      name: 'Best Sellers',
      nameAr: 'الأكثر مبيعاً',
      isEnabled: true,
      sortOrder: 3,
      maxProducts: 8,
      showTitle: true,
      showViewAll: true
    },
    {
      id: 'new',
      name: 'New Arrivals',
      nameAr: 'وصل حديثاً',
      isEnabled: true,
      sortOrder: 4,
      maxProducts: 8,
      showTitle: true,
      showViewAll: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [allProducts, setAllProducts] = useState<Array<{id: string; name: string; nameAr?: string; images?: any[]}>>([]);
  const [productSearchTerm, setProductSearchTerm] = useState<{[key: string]: string}>({});
  const [showProductSelector, setShowProductSelector] = useState<{[key: string]: boolean}>({});
  const [selectedProductsDetails, setSelectedProductsDetails] = useState<{[key: string]: Array<{id: string; name: string; nameAr?: string; images?: any[]}>}>({});

  useEffect(() => {
    loadSettings();
    fetchAllProducts();
  }, []);

  // Fetch details for selected products that are not in allProducts
  useEffect(() => {
    const fetchSelectedProductsDetails = async () => {
      const sectionsWithSelected = sections.filter(s => s.id === 'latest' && s.selectedProductIds && s.selectedProductIds.length > 0);
      
      for (const section of sectionsWithSelected) {
        if (!section.selectedProductIds) continue;
        
        // Normalize IDs to strings for comparison
        const normalizedSelectedIds = section.selectedProductIds.map(id => String(id).trim());
        
        const missingIds = normalizedSelectedIds.filter(id => 
          !allProducts.find(p => String(p.id).trim() === id)
        );
        
        if (missingIds.length === 0) {
          // All selected products are already in allProducts
          const existingProducts = normalizedSelectedIds
            .map(id => allProducts.find(p => String(p.id).trim() === id))
            .filter((p) => p != null) as Array<{id: string; name: string; nameAr?: string; images?: any[]}>;
          setSelectedProductsDetails(prev => ({
            ...prev,
            [section.id]: existingProducts
          }));
          continue;
        }
        
        // Fetch missing products
        const fetchedProducts: Array<{id: string; name: string; nameAr?: string; images?: any[]}> = [];
        
        for (const productId of missingIds) {
          try {
            const response = await fetch(`/api/admin/products/${productId}`, {
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              const product = data.success && data.data?.product ? data.data.product : data.product;
              if (product && product.id) {
                fetchedProducts.push({
                  id: product.id,
                  name: product.name || 'Unknown',
                  nameAr: product.nameAr || product.name || 'غير معروف',
                  images: product.images || []
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        }
        
        // Combine existing and fetched products - use normalized IDs
        const existingProducts = normalizedSelectedIds
          .map(id => allProducts.find(p => String(p.id).trim() === id))
          .filter((p) => p != null) as Array<{id: string; name: string; nameAr?: string; images?: any[]}>;
        
        // Merge and maintain order - normalize IDs for comparison
        const allSelectedProducts = normalizedSelectedIds
          .map(id => {
            const existing = existingProducts.find(p => String(p.id).trim() === id);
            if (existing) return existing;
            return fetchedProducts.find(p => String(p.id).trim() === id);
          })
          .filter((p) => p != null) as Array<{id: string; name: string; nameAr?: string; images?: any[]}>;
        
        setSelectedProductsDetails(prev => ({
          ...prev,
          [section.id]: allSelectedProducts
        }));
      }
    };
    
    if (allProducts.length > 0 && sections.length > 0) {
      fetchSelectedProductsDetails();
    }
  }, [allProducts, sections]);

  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      setAllProducts([]); // Clear products while loading
      const response = await fetch('/api/admin/products?limit=1000', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        showToast(
          language === 'ar' ? `فشل تحميل المنتجات: ${response.status}` : `Failed to load products: ${response.status}`,
          'error',
          3000
        );
        setAllProducts([]);
        return;
      }
      
      const data = await response.json();
      
      
      // Handle structured response format: {success: true, data: {products: [...], pagination: {...}}}
      let productsList: any[] = [];
      if (data.success && data.data) {
        // structuredResponse format: {success: true, data: {products: [...], pagination: {...}}}
        productsList = Array.isArray(data.data.products) ? data.data.products : [];
      } else if (Array.isArray(data.products)) {
        // Direct format: {products: [...]}
        productsList = data.products;
      } else if (Array.isArray(data)) {
        // Array format: [...]
        productsList = data;
      }
      
      const validProducts = productsList
        .map((p: any) => {
          if (!p || p === null || p === undefined) {
            return null;
          }
          
          // Check if id exists (must be string)
          if (!p.id || typeof p.id !== 'string') {
            return null;
          }
          
          return {
            id: p.id as string,
            name: p.name || 'Unknown',
            nameAr: p.nameAr || p.name || 'غير معروف',
            images: p.images || []
          };
        })
        .filter((p) => p != null) as Array<{id: string; name: string; nameAr?: string; images?: any[]}>;
      
      setAllProducts(validProducts);
      
      if (validProducts.length === 0) {
        showToast(
          language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available',
          'info',
          2000
        );
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      showToast(
        language === 'ar' ? `خطأ في تحميل المنتجات: ${error?.message || 'Unknown error'}` : `Error loading products: ${error?.message || 'Unknown error'}`,
        'error',
        3000
      );
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/admin/sections?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {sections: [...]}}
        const sectionsList = data.success && data.data?.sections 
          ? data.data.sections 
          : data.sections || sections;
        const validSections = Array.isArray(sectionsList) ? sectionsList : sections;
        
        // Normalize all sections - ensure maxProducts is a number
        const normalizedSections = validSections.map((section: any) => {
          let maxProducts = 8;
          if (typeof section.maxProducts === 'string') {
            maxProducts = parseInt(section.maxProducts, 10) || 8;
          } else if (typeof section.maxProducts === 'number') {
            maxProducts = section.maxProducts;
          } else {
            maxProducts = Number(section.maxProducts) || 8;
          }
          maxProducts = Math.max(1, Math.min(100, maxProducts));
          
          return {
            ...section,
            maxProducts: maxProducts,
            showTitle: section.showTitle !== undefined ? section.showTitle : true,
            showViewAll: section.showViewAll !== undefined ? section.showViewAll : true,
            sortOrder: Number(section.sortOrder) || 0,
            selectedProductIds: section.selectedProductIds && Array.isArray(section.selectedProductIds)
              ? section.selectedProductIds
                  .map((id: any) => {
                    if (typeof id === 'string' && id.trim().length > 0) {
                      return id.trim();
                    }
                    if (typeof id === 'number' && !isNaN(id)) {
                      // Convert number to string for consistency
                      return String(id);
                    }
                    return null;
                  })
                  .filter((id: any): id is string => id != null && typeof id === 'string' && id.length > 0)
              : undefined
          };
        }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setSections(normalizedSections);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const saveSettings = async () => {
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
    
    // Normalize all sections before sending
    const normalizedSections = sections.map(section => {
      let maxProducts = 8;
      
      // Handle different types
      if (typeof section.maxProducts === 'number' && !isNaN(section.maxProducts)) {
        maxProducts = section.maxProducts;
      } else if (typeof section.maxProducts === 'string') {
        const parsed = parseInt(section.maxProducts, 10);
        if (!isNaN(parsed)) {
          maxProducts = parsed;
        }
      } else if (section.maxProducts !== undefined && section.maxProducts !== null) {
        const converted = Number(section.maxProducts);
        if (!isNaN(converted)) {
          maxProducts = converted;
        }
      }
      
      // Clamp to valid range
      maxProducts = Math.max(1, Math.min(100, Math.floor(maxProducts)));
      
      return {
        ...section,
        maxProducts: maxProducts
      };
    });
    
    try {
      const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ sections: normalizedSections, csrfToken }),
      });

      if (response.ok) {
        const responseData = await response.json();
        showToast(
          language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
          'success',
          3000
        );
        setMessage('');
        
        // Notify other pages that settings were updated
        window.dispatchEvent(new CustomEvent('sectionsSettingsUpdated'));
        localStorage.setItem('sectionsSettingsUpdated', Date.now().toString());
        
        // Reload settings to ensure consistency
        loadSettings();
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Handle structured error format: {success: false, error: "..."}
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || (language === 'ar' ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
        showToast(errorMessage, 'error', 4000);
        setMessage('');
      }
    } catch (error) {
      console.error('Error saving sections:', error);
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings',
        'error',
        4000
      );
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = (id: string, field: keyof SectionSettings, value: any) => {
    // Normalize maxProducts to number if it's being updated
    let normalizedValue = value;
    if (field === 'maxProducts') {
      if (typeof value === 'string') {
        normalizedValue = parseInt(value, 10) || 8;
      } else if (typeof value === 'number') {
        normalizedValue = value;
      } else {
        normalizedValue = Number(value) || 8;
      }
      normalizedValue = Math.max(1, Math.min(100, normalizedValue));
    }
    
    // For selectedProductIds, ensure it's an array of strings
    if (field === 'selectedProductIds') {
      if (Array.isArray(value)) {
        normalizedValue = value
          .map((id: any) => {
            if (typeof id === 'string' && id.trim().length > 0) {
              return id.trim();
            }
            if (typeof id === 'number' && !isNaN(id)) {
              // Convert number to string for consistency
              return String(id);
            }
            return null;
          })
          .filter((id: any): id is string => id != null && typeof id === 'string' && id.length > 0);
      } else {
        normalizedValue = [];
      }
    }
    
    setSections(prev => {
      const updated = prev.map(section => 
        section.id === id ? { ...section, [field]: normalizedValue } : section
      );
      return updated;
    });
  };

  const toggleSection = (id: string) => {
    updateSection(id, 'isEnabled', !sections.find(s => s.id === id)?.isEnabled);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    // Update sort orders
    newSections.forEach((section, index) => {
      section.sortOrder = index + 1;
    });
    
    setSections(newSections);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'إدارة أقسام المنتجات' : 'Product Sections Management'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ar' ? 'إدارة عرض أقسام المنتجات في الصفحة الرئيسية' : 'Manage product sections display on homepage'}
            </p>
          </div>
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('Error') || message.includes('خطأ') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-6">
              {[...sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          section.isEnabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {section.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {section.isEnabled ? (language === 'ar' ? 'مفعل' : 'Enabled') : (language === 'ar' ? 'معطل' : 'Disabled')}
                      </button>
                      <span className="text-sm text-gray-500">
                        {language === 'ar' ? 'الترتيب' : 'Order'}: {section.sortOrder}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`section-${section.id}-nameAr`} className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                      </label>
                      <input
                        id={`section-${section.id}-nameAr`}
                        name={`section-${section.id}-nameAr`}
                        type="text"
                        autoComplete="off"
                        value={section.nameAr}
                        onChange={(e) => updateSection(section.id, 'nameAr', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor={`section-${section.id}-name`} className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                      </label>
                      <input
                        id={`section-${section.id}-name`}
                        name={`section-${section.id}-name`}
                        type="text"
                        autoComplete="off"
                        value={section.name}
                        onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {/* Only show maxProducts input for non-latest sections */}
                    {section.id !== 'latest' && (
                      <div>
                        <label htmlFor={`section-${section.id}-maxProducts`} className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'ar' ? 'عدد المنتجات المعروضة' : 'Number of Products to Display'}
                        </label>
                        <input
                          id={`section-${section.id}-maxProducts`}
                          name={`section-${section.id}-maxProducts`}
                          type="number"
                          autoComplete="off"
                          min="1"
                          max="100"
                          step="1"
                          value={section.maxProducts}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            
                            // Handle empty input
                            if (inputValue === '' || inputValue === null || inputValue === undefined) {
                              updateSection(section.id, 'maxProducts', 1);
                              return;
                            }
                            
                            const parsedValue = parseInt(inputValue, 10);
                            if (isNaN(parsedValue)) {
                              return;
                            }
                            
                            const clampedValue = Math.max(1, Math.min(100, parsedValue));
                            updateSection(section.id, 'maxProducts', clampedValue);
                          }}
                          onBlur={(e) => {
                            // Ensure value is set on blur if empty
                            if (!e.target.value || e.target.value === '') {
                              updateSection(section.id, 'maxProducts', 8);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'أدخل العدد' : 'Enter number'}
                        />
                        <p className="text-xs text-gray-500 mt-1 mb-2">
                          {language === 'ar' ? 'من 1 إلى 100 منتج' : 'Between 1 and 100 products'}
                        </p>
                        {/* Quick selection buttons */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-gray-600 font-medium mr-2">
                            {language === 'ar' ? 'اختيارات سريعة:' : 'Quick options:'}
                          </span>
                          {[3, 4, 8, 12, 16, 20, 24].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateSection(section.id, 'maxProducts', num)}
                              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                                section.maxProducts === num
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <label htmlFor={`section-${section.id}-showTitle`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          id={`section-${section.id}-showTitle`}
                          name={`section-${section.id}-showTitle`}
                          type="checkbox"
                          checked={section.showTitle !== undefined ? section.showTitle : true}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newValue = e.target.checked;
                            updateSection(section.id, 'showTitle', newValue);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                        />
                        <span 
                          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentValue = section.showTitle !== undefined ? section.showTitle : true;
                            updateSection(section.id, 'showTitle', !currentValue);
                          }}
                        >
                          {language === 'ar' ? 'إظهار العنوان' : 'Show Title'}
                        </span>
                      </label>
                      {/* Only show View All checkbox for non-latest sections */}
                      {section.id !== 'latest' && (
                        <label htmlFor={`section-${section.id}-showViewAll`} className="flex items-center gap-2 cursor-pointer">
                          <input
                            id={`section-${section.id}-showViewAll`}
                            name={`section-${section.id}-showViewAll`}
                            type="checkbox"
                            checked={section.showViewAll !== undefined ? section.showViewAll : true}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newValue = e.target.checked;
                              updateSection(section.id, 'showViewAll', newValue);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                          />
                          <span 
                            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentValue = section.showViewAll !== undefined ? section.showViewAll : true;
                              updateSection(section.id, 'showViewAll', !currentValue);
                            }}
                          >
                            {language === 'ar' ? 'إظهار "عرض الكل"' : 'Show "View All"'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Product Selector for Latest Section */}
                  {section.id === 'latest' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <label htmlFor={`section-${section.id}-productSearch`} className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'ar' ? 'اختيار المنتجات المعروضة (3-5 منتجات)' : 'Select Products to Display (3-5 products)'}
                          </label>
                          {allProducts.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {language === 'ar' ? `إجمالي المنتجات المتاحة: ${allProducts.length}` : `Total products available: ${allProducts.length}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            type="button"
                            onClick={() => {
                              updateSection(section.id, 'isEnabled', !section.isEnabled);
                              showToast(
                                section.isEnabled 
                                  ? (language === 'ar' ? 'تم إخفاء القسم' : 'Section hidden')
                                  : (language === 'ar' ? 'تم إظهار القسم' : 'Section shown'),
                                section.isEnabled ? 'info' : 'success',
                                2000
                              );
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              section.isEnabled
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                            title={section.isEnabled 
                              ? (language === 'ar' ? 'إخفاء القسم من الصفحة الرئيسية' : 'Hide section from homepage')
                              : (language === 'ar' ? 'إظهار القسم في الصفحة الرئيسية' : 'Show section on homepage')
                            }
                          >
                            {section.isEnabled ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                {language === 'ar' ? 'إخفاء القسم' : 'Hide Section'}
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                {language === 'ar' ? 'إظهار القسم' : 'Show Section'}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowProductSelector(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            {showProductSelector[section.id] 
                              ? (language === 'ar' ? 'إخفاء' : 'Hide')
                              : (language === 'ar' ? 'اختيار المنتجات' : 'Select Products')
                            }
                          </button>
                        </div>
                      </div>

                      {showProductSelector[section.id] && (
                        <div className="space-y-3">
                          {/* Search Products */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              id={`section-${section.id}-productSearch`}
                              name={`section-${section.id}-productSearch`}
                              type="text"
                              autoComplete="off"
                              value={productSearchTerm[section.id] || ''}
                              onChange={(e) => setProductSearchTerm(prev => ({ ...prev, [section.id]: e.target.value }))}
                              placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Selected Products */}
                          {section.selectedProductIds && section.selectedProductIds.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-600 font-medium">
                                {language === 'ar' ? 'المنتجات المحددة:' : 'Selected Products:'} ({section.selectedProductIds.length})
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                                {section.selectedProductIds
                                  .filter((id: any) => id != null && typeof id === 'string' && id.length > 0)
                                  .map((productId, index) => {
                                    // Normalize productId to string for comparison
                                    const normalizedProductId = String(productId).trim();
                                    
                                    // Try to get product from selectedProductsDetails first, then allProducts
                                    const productDetails = selectedProductsDetails[section.id];
                                    const product = productDetails?.find(p => String(p.id).trim() === normalizedProductId) || 
                                                   allProducts.find(p => String(p.id).trim() === normalizedProductId);
                                    
                                    if (!product) {
                                      // Product not found - show ID with loading state
                                      return (
                                        <div
                                          key={`${section.id}-product-${productId}-${index}`}
                                          className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                                        >
                                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            <span className="text-xs text-gray-400">?</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">
                                              {language === 'ar' ? `جاري التحميل...` : `Loading...`}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">ID: {productId}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newIds = (section.selectedProductIds || []).filter(id => id !== productId);
                                              updateSection(section.id, 'selectedProductIds', newIds);
                                            }}
                                            className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                                            title={language === 'ar' ? 'إزالة' : 'Remove'}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <div
                                        key={`${section.id}-product-${productId}-${index}`}
                                        className="flex items-center gap-3 bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                                      >
                                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                          {product.images && product.images.length > 0 ? (
                                            <img
                                              src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                                              alt={product.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                              {language === 'ar' ? 'لا صورة' : 'No Image'}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {language === 'ar' ? product.nameAr || product.name : product.name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">ID: {productId}</p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newIds = (section.selectedProductIds || []).filter(id => id !== productId);
                                            updateSection(section.id, 'selectedProductIds', newIds);
                                          }}
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                                          title={language === 'ar' ? 'إزالة' : 'Remove'}
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Products List */}
                          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                            {isLoading ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}
                              </div>
                            ) : allProducts.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
                              </div>
                            ) : (
                              allProducts
                                .filter(p => {
                                  const search = (productSearchTerm[section.id] || '').toLowerCase();
                                  // Normalize IDs for comparison
                                  const productIdStr = String(p.id).trim();
                                  const isSelected = section.selectedProductIds?.some(id => String(id).trim() === productIdStr);
                                  if (isSelected) return false; // Don't show already selected
                                  if (!search) return true;
                                  return (language === 'ar' ? (p.nameAr || p.name) : p.name).toLowerCase().includes(search);
                                })
                                .slice(0, 20)
                                .map((product, productIndex) => (
                                <div
                                  key={`product-${section.id}-${product.id || productIndex}-${productIndex}`}
                                  onClick={() => {
                                    const currentIds = section.selectedProductIds || [];
                                    // Normalize IDs for comparison
                                    const productIdStr = String(product.id).trim();
                                    const normalizedCurrentIds = currentIds.map(id => String(id).trim());
                                    
                                    if (normalizedCurrentIds.length >= 5) {
                                      showToast(
                                        language === 'ar' ? 'يمكنك اختيار 5 منتجات كحد أقصى' : 'You can select up to 5 products',
                                        'info',
                                        3000
                                      );
                                      return;
                                    }
                                    if (!normalizedCurrentIds.includes(productIdStr)) {
                                      updateSection(section.id, 'selectedProductIds', [...currentIds, productIdStr]);
                                    }
                                  }}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                      <img
                                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        {language === 'ar' ? 'لا صورة' : 'No Image'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {language === 'ar' ? product.nameAr || product.name : product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">ID: {product.id}</p>
                                  </div>
                                  {section.selectedProductIds?.some(id => String(id).trim() === String(product.id).trim()) && (
                                    <div className="text-blue-600">
                                      <span className="text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick selection buttons */}
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-600 font-medium">
                              {language === 'ar' ? 'اختيارات سريعة:' : 'Quick selection:'}
                            </span>
                            {[3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                disabled={allProducts.length === 0}
                                onClick={() => {
                                  if (allProducts.length === 0) {
                                    showToast(
                                      language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...',
                                      'info',
                                      2000
                                    );
                                    return;
                                  }
                                  const currentIds = section.selectedProductIds || [];
                                  if (currentIds.length === num) {
                                    // Clear if same number
                                    updateSection(section.id, 'selectedProductIds', []);
                                  } else {
                                    // Select first N products - ensure IDs are valid strings
                                    const selected = allProducts
                                      .slice(0, num)
                                      .map(p => p.id)
                                      .filter((id): id is string => typeof id === 'string' && id.length > 0);
                                    if (selected.length > 0) {
                                      updateSection(section.id, 'selectedProductIds', selected);
                                      showToast(
                                        language === 'ar' ? `تم اختيار ${selected.length} منتج` : `Selected ${selected.length} products`,
                                        'success',
                                        2000
                                      );
                                    }
                                  }
                                }}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                                  allProducts.length === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                    : (section.selectedProductIds?.length || 0) === num
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {num} {language === 'ar' ? 'منتجات' : 'products'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
