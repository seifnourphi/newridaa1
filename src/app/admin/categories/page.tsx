'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FolderOpen, 
  Package,
  Eye,
  EyeOff,
  MoreHorizontal,
  Grid3X3,
  List
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
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { csrfToken } = useCSRF();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {categories: [...]}}
        const categoriesList = data.success && data.data?.categories 
          ? data.data.categories 
          : data.categories || [];
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        setCategories([]); // Ensure categories is always an array
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Ensure categories is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryName = language === 'ar' ? category?.nameAr : category?.name;
    
    if (!confirm(`هل أنت متأكد من حذف قسم "${categoryName}"؟`)) return;
    
    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error'
      );
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}?csrfToken=${encodeURIComponent(csrfToken)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId));
        showToast(`تم حذف قسم "${categoryName}" بنجاح`, 'success', 3000);
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Cannot delete category with products') {
          // Show options for handling products
          const action = confirm(
            `قسم "${categoryName}" يحتوي على ${errorData.productCount} منتج.\n\n` +
            'اضغط "موافق" لحذف القسم مع جميع منتجاته\n' +
            'أو اضغط "إلغاء" لإلغاء العملية'
          );
          
          if (action) {
            // Force delete with products
            const forceResponse = await fetch(`/api/admin/categories/${categoryId}?force=true&csrfToken=${encodeURIComponent(csrfToken!)}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken!
              },
              credentials: 'include',
            });
            
            if (forceResponse.ok) {
              setCategories(categories.filter(c => c.id !== categoryId));
              showToast(`تم حذف قسم "${categoryName}" وجميع منتجاته بنجاح`, 'success', 3000);
            } else {
              const forceErrorData = await forceResponse.json();
              console.error('Force delete error:', forceErrorData);
              showToast(`خطأ في حذف القسم مع المنتجات: ${forceErrorData.error || 'خطأ غير معروف'}`, 'error', 4000);
            }
          }
        } else {
          showToast(`خطأ في حذف القسم: ${errorData.error || 'خطأ غير معروف'}`, 'error', 4000);
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('حدث خطأ أثناء حذف القسم', 'error', 4000);
    }
  };

  const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error'
      );
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          isActive: !isActive,
          csrfToken 
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        setCategories(categories.map(c => 
          c.id === categoryId ? { ...c, isActive: !isActive } : c
        ));
      }
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/edit/${id}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.nameAr.includes(searchTerm)
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? category.nameAr : category.name}
              </h3>
              <p className="text-sm text-gray-500">
                {category.productCount} {t('admin.products')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleStatus(category.id, category.isActive)}
              className={`p-2 rounded-md ${
                category.isActive
                  ? 'text-green-600 bg-green-100 hover:bg-green-200'
                  : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => handleEdit(category.id)}
              className="p-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {category.description && (
          <p className="text-sm text-gray-600 mb-4">
            {language === 'ar' ? category.descriptionAr : category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>#{category.sortOrder}</span>
          <span className={`px-2 py-1 rounded-full ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {category.isActive ? t('admin.active') : t('admin.inactive')}
          </span>
        </div>
      </div>
    </div>
  );

  const CategoryRow = ({ category }: { category: Category }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {language === 'ar' ? category.nameAr : category.name}
            </div>
            <div className="text-sm text-gray-500">
              {category.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {category.productCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {category.sortOrder}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          category.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {category.isActive ? t('admin.active') : t('admin.inactive')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleStatus(category.id, category.isActive)}
            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
              category.isActive
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-green-700 bg-green-100 hover:bg-green-200'
            }`}
          >
            {category.isActive ? t('admin.deactivate') : t('admin.activate')}
          </button>
          
          <button
            onClick={() => handleEdit(category.id)}
            className="text-primary-600 hover:text-primary-900"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.categories')}</h1>
            <nav className="mt-1 text-sm text-gray-500">
              <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                <li>
                  <a href="/admin" className="hover:text-gray-700">{language==='ar' ? 'الرئيسية' : 'Home'}</a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-700 font-medium">{t('admin.categories')}</li>
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center space-x-3 mt-0">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => router.push('/admin/categories/add')}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#DAA520] hover:bg-[#c2931b]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.addCategory')}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder={t('admin.searchCategories')}
              />
            </div>
          </div>
        </div>

        {/* Categories Content */}
        <div className="bg-white shadow rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('admin.noCategories')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('admin.noCategoriesDescription')}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/categories/add')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.addCategory')}
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.sortOrder')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">{t('admin.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
