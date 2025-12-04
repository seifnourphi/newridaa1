'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { hasForbiddenChars } from '@/lib/client-validation';
import { Save, ArrowLeft } from 'lucide-react';

interface CouponFormData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number | '';
  minOrderAmount: number | '';
  maxUses: number | '';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function AddCouponPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const { csrfToken } = useCSRF();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const handleInputChange = (field: keyof CouponFormData, value: any) => {
    // SECURITY: Validate fields that can contain user input
    if (field === 'code' && typeof value === 'string') {
      const upperValue = value.toUpperCase();
      if (hasForbiddenChars(upperValue)) {
        showToast(language === 'ar' 
          ? 'كود الكوبون يحتوي على أحرف غير مسموحة' 
          : 'Coupon code contains invalid characters', 'error', 3000);
        return;
      }
      setFormData(prev => ({ ...prev, [field]: upperValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Validate all text fields before submission
    if (hasForbiddenChars(formData.code)) {
      showToast(language === 'ar' ? 'كود الكوبون يحتوي على أحرف غير مسموحة' : 'Coupon code contains invalid characters', 'error', 3000);
      return;
    }
    
    if (!formData.code || !formData.discountValue) {
      showToast(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error', 3000);
      return;
    }

    if (formData.discountType === 'PERCENTAGE' && (Number(formData.discountValue) < 0 || Number(formData.discountValue) > 100)) {
      showToast(language === 'ar' ? 'نسبة الخصم يجب أن تكون بين 0 و 100' : 'Discount percentage must be between 0 and 100', 'error', 3000);
      return;
    }

    if (formData.discountType === 'FIXED' && Number(formData.discountValue) <= 0) {
      showToast(language === 'ar' ? 'قيمة الخصم يجب أن تكون أكبر من 0' : 'Discount value must be greater than 0', 'error', 3000);
      return;
    }

    if (!csrfToken) {
      showToast(language === 'ar' ? 'يرجى تحديث الصفحة والمحاولة مرة أخرى' : 'Please refresh the page and try again', 'error', 3000);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
          maxUses: formData.maxUses ? Number(formData.maxUses) : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          csrfToken,
        }),
      });

      if (response.ok) {
        showToast(language === 'ar' ? 'تم إنشاء الكوبون بنجاح' : 'Coupon created successfully', 'success', 3000);
        router.push('/admin/coupons');
      } else {
        const error = await response.json();
        showToast(error.error || (language === 'ar' ? 'فشل إنشاء الكوبون' : 'Failed to create coupon'), 'error', 4000);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      showToast(language === 'ar' ? 'حدث خطأ أثناء إنشاء الكوبون' : 'Error creating coupon', 'error', 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'إضافة كوبون جديد' : 'Add New Coupon'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 max-w-3xl">
          <div className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'كود الكوبون' : 'Coupon Code'} *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder={language === 'ar' ? 'مثال: SAVE20' : 'Example: SAVE20'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' ? 'سيتم تحويل الكود تلقائياً إلى أحرف كبيرة' : 'Code will be automatically converted to uppercase'}
              </p>
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'نوع الخصم' : 'Discount Type'} *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                required
              >
                <option value="PERCENTAGE">{language === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="FIXED">{language === 'ar' ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' 
                  ? `قيمة الخصم ${formData.discountType === 'PERCENTAGE' ? '(نسبة مئوية)' : '(ج.م)'}` 
                  : `Discount Value ${formData.discountType === 'PERCENTAGE' ? '(Percentage)' : '(EGP)'}`} *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', e.target.value)}
                min={formData.discountType === 'PERCENTAGE' ? 0 : 0.01}
                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
                required
              />
              {formData.discountType === 'PERCENTAGE' && (
                <p className="mt-1 text-xs text-gray-500">
                  {language === 'ar' ? 'يجب أن تكون القيمة بين 0 و 100' : 'Value must be between 0 and 100'}
                </p>
              )}
            </div>

            {/* Minimum Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الحد الأدنى لمبلغ الطلب (ج.م)' : 'Minimum Order Amount (EGP)'}
              </label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                min="0"
                step="0.01"
                placeholder={language === 'ar' ? 'مثال: 1000 (اتركه فارغاً إذا لا يوجد حد أدنى)' : 'Example: 1000 (leave empty if no minimum)'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' ? 'الحد الأدنى لمبلغ الطلب لتفعيل هذا الكوبون (اتركه فارغاً إذا لا يوجد حد أدنى)' : 'Minimum order amount to activate this coupon (leave empty if no minimum)'}
              </p>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الحد الأقصى لعدد الاستخدامات' : 'Maximum Uses'}
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => handleInputChange('maxUses', e.target.value)}
                min="1"
                placeholder={language === 'ar' ? 'مثال: 100 (اتركه فارغاً لاستخدام غير محدود)' : 'Example: 100 (leave empty for unlimited)'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' ? 'عدد مرات الاستخدام المسموح بها (اتركه فارغاً لاستخدام غير محدود)' : 'Maximum number of times this coupon can be used (leave empty for unlimited)'}
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'تاريخ البدء (اختياري)' : 'Start Date (Optional)'}
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'End Date (Optional)'}
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-[#9333EA] border-gray-300 rounded focus:ring-[#9333EA]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الكوبون نشط' : 'Coupon is active'}
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#9333EA] text-white rounded-md font-medium hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSaving 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (language === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

