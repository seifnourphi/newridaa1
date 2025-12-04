'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { useToast } from '@/components/providers/ToastProvider';
import { 
  Save, 
  ArrowLeft
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function EditCategoryPage() {
  const { t, language } = useLanguage();
  const { csrfToken } = useCSRF();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {category: ...}}
        const categoryData = data.success && data.data?.category 
          ? data.data.category 
          : data.category; // Fallback for old format
        
        if (categoryData) {
          setCategory(categoryData);
        } else {
          console.error('Category not found in response:', data);
          showToast(language === 'ar' ? 'القسم غير موجود' : 'Category not found', 'error', 3000);
          router.push('/admin/categories');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : (language === 'ar' ? 'فشل في جلب القسم' : 'Failed to fetch category');
        showToast(errorMessage, 'error', 3000);
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      showToast(language === 'ar' ? 'حدث خطأ في جلب القسم' : 'Error fetching category', 'error', 3000);
      router.push('/admin/categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!category) return;

    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error'
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          ...category,
          csrfToken
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const responseData = await response.json();
        // Handle structured response format
        const updatedCategory = responseData.success && responseData.data?.category 
          ? responseData.data.category 
          : responseData.category;
        
        if (updatedCategory) {
          setCategory(updatedCategory);
        }
        
        const successMessage = language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully';
        setMessage(successMessage);
        showToast(successMessage, 'success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Handle structured error format: {success: false, error: "..."}
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || (language === 'ar' ? 'خطأ في حفظ التغييرات' : 'Error saving changes');
        setMessage(errorMessage);
        showToast(errorMessage, 'error');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = language === 'ar' ? 'خطأ في حفظ التغييرات' : 'Error saving changes';
      setMessage(errorMessage);
      showToast(errorMessage, 'error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'القسم غير موجود' : 'Category not found'}
            </h1>
            <button
              onClick={() => router.push('/admin/categories')}
              className="text-blue-600 hover:text-blue-800"
            >
              {language === 'ar' ? 'العودة إلى الأقسام' : 'Back to Categories'}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/categories')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'ar' ? 'العودة' : 'Back'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'تحرير القسم' : 'Edit Category'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'ar' ? 'تعديل معلومات القسم' : 'Edit category information'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
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

        <div className="grid grid-cols-1 gap-6">
          {/* Main Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'معلومات القسم' : 'Category Information'}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={category.nameAr}
                        onChange={(e) => setCategory({ ...category, nameAr: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'اسم القسم بالعربية' : 'Category name in Arabic'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => setCategory({ ...category, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'اسم القسم بالإنجليزية' : 'Category name in English'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'الرابط (Slug)' : 'Slug'}
                    </label>
                    <input
                      type="text"
                      value={category.slug}
                      onChange={(e) => setCategory({ ...category, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="category-slug"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                      </label>
                      <textarea
                        value={category.descriptionAr || ''}
                        onChange={(e) => setCategory({ ...category, descriptionAr: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'وصف القسم بالعربية' : 'Category description in Arabic'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                      </label>
                      <textarea
                        value={category.description || ''}
                        onChange={(e) => setCategory({ ...category, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'وصف القسم بالإنجليزية' : 'Category description in English'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'ar' ? 'ترتيب العرض' : 'Sort Order'}
                      </label>
                      <input
                        type="number"
                        value={category.sortOrder}
                        onChange={(e) => setCategory({ ...category, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={category.isActive}
                          onChange={(e) => setCategory({ ...category, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
