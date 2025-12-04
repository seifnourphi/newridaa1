'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { 
  Save, 
  ArrowLeft
} from 'lucide-react';

interface CategoryFormData {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AddCategoryPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const { csrfToken } = useCSRF();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    isActive: true,
    sortOrder: 0,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.nameAr || !formData.slug) {
      showToast(t('admin.fillRequiredFields'), 'error', 3000);
      return;
    }

    if (!csrfToken) {
      showToast(
        t('admin.csrfTokenMissing') || 
        (language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.'),
        'error',
        3000
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          csrfToken,
        }),
      });

      if (response.ok) {
        showToast(t('admin.categoryCreated'), 'success', 3000);
        router.push('/admin/categories');
      } else {
        const error = await response.json();
        showToast(error.error || t('admin.errorCreatingCategory'), 'error', 4000);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(t('admin.errorCreatingCategory'), 'error', 4000);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
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
                {t('admin.addCategory')}
              </h1>
              <p className="text-gray-600">
                {t('admin.addCategoryDescription')}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.categoryName')} (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.categoryName')} (العربية) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => handleInputChange('nameAr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.slug')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.sortOrder')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.descriptions')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.description')} (English)
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.description')} (العربية)
                </label>
                <textarea
                  rows={4}
                  value={formData.descriptionAr}
                  onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.categorySettings')}
            </h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                {t('admin.activeCategory')}
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('admin.cancelAction')}
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#DAA520] hover:bg-[#B8860B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DAA520] disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t('admin.saving') : t('admin.saveCategory')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
