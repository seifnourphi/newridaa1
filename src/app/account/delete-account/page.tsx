'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCSRF } from '@/hooks/useCSRF';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function DeleteAccountPage() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    if (csrfLoading || !csrfToken) {
      setError(language === 'ar' ? 'جاري التحميل...' : 'Loading...');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/account/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          csrfToken,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 401) {
          setError(language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
        } else if (response.status === 400) {
          setError(data.error || (language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter your password'));
        } else {
          setError(data.error || (language === 'ar' ? 'حدث خطأ أثناء حذف الحساب' : 'Error occurred while deleting account'));
        }
        setIsDeleting(false);
        return;
      }

      // Account deletion successful
      setIsConfirmed(true);
      
      // Logout user after 3 seconds
      setTimeout(async () => {
        await logout();
        router.push('/');
      }, 3000);

    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(language === 'ar' ? 'حدث خطأ أثناء حذف الحساب' : 'Error occurred while deleting account');
      setIsDeleting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account Deleted Successfully'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'ar' 
              ? 'تم حذف حسابك نهائياً. سيتم تسجيل خروجك تلقائياً خلال لحظات...'
              : 'Your account has been permanently deleted. You will be logged out automatically in a few moments...'
            }
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DAA520] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/account/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-[#DAA520] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">
                {language === 'ar' ? 'العودة للإعدادات' : 'Back to Settings'}
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                {language === 'ar' ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه' : 'Warning: This action cannot be undone'}
              </h2>
              <div className="text-red-800 space-y-2">
                <p>
                  {language === 'ar' 
                    ? 'حذف حسابك سيؤدي إلى:'
                    : 'Deleting your account will result in:'
                  }
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    {language === 'ar' 
                      ? 'حذف جميع بياناتك الشخصية نهائياً'
                      : 'Permanent deletion of all your personal data'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'حذف جميع طلباتك وتاريخ الشراء'
                      : 'Deletion of all your orders and purchase history'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'حذف قائمة المفضلة والمراجعات'
                      : 'Deletion of your wishlist and reviews'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'عدم إمكانية استرداد الحساب لاحقاً'
                      : 'Inability to recover the account later'
                    }
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'معلومات الحساب المراد حذفه' : 'Account Information to be Deleted'}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {language === 'ar' ? 'الاسم:' : 'Name:'}
              </span>
              <span className="font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
              </span>
              <span className="font-medium text-gray-900">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">
                {language === 'ar' ? 'تاريخ الانضمام:' : 'Member Since:'}
              </span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Password Confirmation Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'ar' 
              ? 'لحذف حسابك نهائياً، يرجى إدخال كلمة المرور الحالية للتأكيد:'
              : 'To permanently delete your account, please enter your current password to confirm:'
            }
          </p>

          <form onSubmit={handleDeleteAccount} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isDeleting || !password.trim() || csrfLoading || !csrfToken}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting 
                  ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...')
                  : (language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account Permanently')
                }
              </button>
              <Link
                href="/account/settings"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Warning */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-yellow-800 text-sm">
              <p className="font-medium mb-1">
                {language === 'ar' ? 'ملاحظة مهمة:' : 'Important Note:'}
              </p>
              <p>
                {language === 'ar' 
                  ? 'إذا كنت تواجه مشاكل مع حسابك، ننصحك بالاتصال بخدمة العملاء قبل حذف الحساب. قد نتمكن من مساعدتك في حل المشكلة.'
                  : 'If you\'re experiencing issues with your account, we recommend contacting customer service before deleting the account. We may be able to help you resolve the issue.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
