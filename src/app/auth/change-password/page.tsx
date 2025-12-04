'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { getCSRFToken } from '@/lib/csrf-client';

export default function ChangePasswordPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError(language === 'ar' ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية' : 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken();
      
      // Get authentication token
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0])
        : null;
      
      if (!token) {
        setError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
        setIsLoading(false);
        return;
      }

      // Call the API
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          csrfToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
        return;
      }
      
      setSuccess(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح! سيتم تسجيل خروجك تلقائياً.' : 'Password changed successfully! You will be logged out automatically.');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect to login after 2 seconds (password change logs out all sessions)
      setTimeout(() => {
        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      // Password change error - no sensitive data logged
      setError(language === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="absolute top-4 left-4">
        <Link
          href="/account/security"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{language === 'ar' ? 'العودة للأمان' : 'Back to Security'}</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-bold text-[#DAA520] tracking-wide" style={{fontFamily: 'serif'}}>
              R<span className="text-2xl">i</span>DAA
            </div>
            <div className="w-full h-0.5 mt-1" style={{
              background: 'linear-gradient(90deg, transparent 0%, transparent 20%, #DAA520 40%, #DAA520 60%, transparent 80%, transparent 100%)',
              boxShadow: '0 0 4px #DAA520, 0 0 8px rgba(218, 165, 32, 0.5)'
            }}></div>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'ar' 
              ? 'قم بتغيير كلمة المرور لحماية حسابك'
              : 'Change your password to secure your account'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Current Password Field */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Bar */}
            <PasswordStrengthBar password={formData.newPassword} />

            {/* Confirm New Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور الجديدة' : 'Confirm new password'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {language === 'ar' ? 'جاري تغيير كلمة المرور...' : 'Changing password...'}
                  </>
                ) : (
                  language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
