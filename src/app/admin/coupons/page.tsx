'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { escapeHtml } from '@/lib/client-validation';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Ticket,
  Eye,
  EyeOff,
  Tag
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CouponsPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const { csrfToken } = useCSRF();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/coupons', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Coupons Page] Response data:', data);
        
        // Handle structured response format: {success: true, data: {coupons: [...], pagination: {...}}}
        let couponsList: Coupon[] = [];
        if (data.success && data.data) {
          // New structured format
          couponsList = Array.isArray(data.data.coupons) ? data.data.coupons : [];
        } else if (data.coupons) {
          // Old format fallback
          couponsList = Array.isArray(data.coupons) ? data.coupons : [];
        }
        
        console.log('[Coupons Page] Extracted coupons:', couponsList.length);
        setCoupons(couponsList);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Coupons Page] Failed to fetch coupons:', response.status, errorData);
        showToast(
          language === 'ar' 
            ? 'فشل تحميل الكوبونات' 
            : 'Failed to fetch coupons', 
          'error', 
          3000
        );
        setCoupons([]); // Ensure coupons is always an array
      }
    } catch (error) {
      console.error('[Coupons Page] Error fetching coupons:', error);
      showToast(
        language === 'ar' 
          ? 'حدث خطأ أثناء تحميل الكوبونات' 
          : 'Error fetching coupons', 
        'error', 
        3000
      );
      setCoupons([]); // Ensure coupons is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (couponId: string, code: string) => {
    if (!confirm(language === 'ar' 
      ? `هل أنت متأكد من حذف الكوبون "${code}"؟` 
      : `Are you sure you want to delete coupon "${code}"?`)) {
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

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}?csrfToken=${csrfToken}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(
          language === 'ar' ? `تم حذف الكوبون "${code}" بنجاح` : `Coupon "${code}" deleted successfully`,
          'success',
          3000
        );
        fetchCoupons();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || 'Failed to delete coupon';
        showToast(errorMessage, 'error', 3000);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('Error deleting coupon', 'error', 3000);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(
          language === 'ar' 
            ? `تم ${coupon.isActive ? 'تعطيل' : 'تفعيل'} الكوبون بنجاح` 
            : `Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`,
          'success',
          3000
        );
        fetchCoupons();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || 'Failed to update coupon';
        showToast(errorMessage, 'error', 3000);
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
      showToast('Error updating coupon', 'error', 3000);
    }
  };

  const filteredCoupons = (Array.isArray(coupons) ? coupons : []).filter(coupon =>
    coupon && coupon.code && (
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.name && coupon.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const formatPrice = (price: number) => {
    return language === 'ar' 
      ? `${price.toLocaleString('en-US')} ج.م` 
      : `${price.toLocaleString('en-US')} EGP`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{language==='ar' ? 'إدارة الكوبونات' : 'Coupons'}</h1>
            <nav className="mt-1 text-sm text-gray-500">
              <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                <li>
                  <a href="/admin" className="hover:text-gray-700">{language==='ar' ? 'الرئيسية' : 'Home'}</a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-700 font-medium">{language==='ar' ? 'الكوبونات' : 'Coupons'}</li>
              </ol>
            </nav>
          </div>
          <button
            onClick={() => router.push('/admin/coupons/add')}
            className="flex items-center gap-2 bg-[#DAA520] text-white px-4 py-2 rounded-md hover:bg-[#c2931b]"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة كوبون جديد' : 'Add New Coupon'}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن الكوبونات...' : 'Search coupons...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
            />
          </div>
        </div>

        {/* Coupons Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9333EA] mx-auto"></div>
            <p className="mt-4 text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {language === 'ar' ? 'لا توجد كوبونات' : 'No coupons found'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الكود' : 'Code'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'نوع الخصم' : 'Discount Type'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'قيمة الخصم' : 'Discount Value'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الاستخدامات' : 'Usage'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#9333EA]" />
                          <span className="font-semibold text-gray-900">{escapeHtml(coupon.code)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{coupon.name ? escapeHtml(coupon.name) : '-'}</div>
                        {coupon.description && (
                          <span className="text-xs text-gray-500">{escapeHtml(coupon.description)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? (language === 'ar' ? 'نسبة مئوية' : 'Percentage') 
                            : (language === 'ar' ? 'مبلغ ثابت' : 'Fixed')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}%` 
                            : formatPrice(coupon.discountValue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.usedCount} / {coupon.maxUses !== null ? coupon.maxUses : '∞'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <Eye className="w-4 h-4" />
                              {language === 'ar' ? 'نشط' : 'Active'}
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              {language === 'ar' ? 'غير نشط' : 'Inactive'}
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

