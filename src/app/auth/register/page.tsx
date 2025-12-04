'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { validatePassword, validateEmail, hasForbiddenChars } from '@/lib/client-validation';

export default function RegisterPage() {
  const { language } = useLanguage();
  const { register, verifyCode, resendCode } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // SECURITY: Validate first name
    if (!formData.firstName.trim()) {
      setError(language === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required');
      return false;
    }
    if (formData.firstName.trim().length > 25) {
      setError(language === 'ar' ? 'الاسم الأول يجب ألا يتجاوز 25 حرفاً' : 'First name must not exceed 25 characters');
      return false;
    }
    if (hasForbiddenChars(formData.firstName)) {
      setError(language === 'ar' ? 'الاسم الأول يحتوي على أحرف غير مسموحة' : 'First name contains invalid characters');
      return false;
    }

    // SECURITY: Validate last name
    if (!formData.lastName.trim()) {
      setError(language === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name is required');
      return false;
    }
    if (formData.lastName.trim().length > 25) {
      setError(language === 'ar' ? 'الاسم الأخير يجب ألا يتجاوز 25 حرفاً' : 'Last name must not exceed 25 characters');
      return false;
    }
    if (hasForbiddenChars(formData.lastName)) {
      setError(language === 'ar' ? 'الاسم الأخير يحتوي على أحرف غير مسموحة' : 'Last name contains invalid characters');
      return false;
    }

    // SECURITY: Validate email
    if (!formData.email.trim()) {
      setError(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return false;
    }
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || (language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'));
      return false;
    }

    // SECURITY: Validate password
    if (!formData.password) {
      setError(language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required');
      return false;
    }
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || (language === 'ar' ? 'كلمة المرور غير صحيحة' : 'Invalid password format'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError(language === 'ar' ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        subscribeNewsletter: formData.subscribeNewsletter
      });

      if (result.success) {
        setRegisteredEmail(result.email || formData.email);
        setStep('verify');
        setSuccess(language === 'ar' ? 'تم إرسال كود التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email');
      } else {
        setError(result.error || (language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred while creating the account'));
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred while creating the account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = verificationCode.trim();
    
    if (!trimmedCode) {
      setError(language === 'ar' ? 'الرجاء إدخال كود التأكيد' : 'Please enter verification code');
      return;
    }
    
    // Verification code processing - no sensitive data logged
    
    setIsLoading(true);
    setError('');

    try {
      const success = await verifyCode(registeredEmail, trimmedCode);
      
      if (success) {
        setSuccess(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
        router.push('/');
      } else {
        setError(language === 'ar' ? 'كود التأكيد غير صحيح' : 'Invalid verification code');
      }
    } catch (err) {
      // Verification error - no sensitive data logged
      setError(language === 'ar' ? 'حدث خطأ أثناء التحقق من الكود' : 'An error occurred while verifying the code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resendCode(registeredEmail);
      
      if (result.success) {
        setSuccess(language === 'ar' ? 'تم إرسال كود جديد إلى بريدك الإلكتروني' : 'New code sent to your email');
        setResendCooldown(60); // 60 seconds cooldown
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.error || (language === 'ar' ? 'فشل إرسال الكود' : 'Failed to resend code'));
      }
    } catch (err) {
      // Resend code error - no sensitive data logged
      setError(language === 'ar' ? 'حدث خطأ أثناء إرسال الكود' : 'An error occurred while resending the code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          suppressHydrationWarning
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm" suppressHydrationWarning>
            {mounted ? (language === 'ar' ? 'العودة للرئيسية' : 'Back to Home') : 'العودة للرئيسية'}
          </span>
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
          <h2 className="text-3xl font-bold text-gray-900" suppressHydrationWarning>
            {mounted ? (
              step === 'register' 
                ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')
                : (language === 'ar' ? 'تأكيد الحساب' : 'Verify Account')
            ) : (
              step === 'register' ? 'إنشاء حساب جديد' : 'تأكيد الحساب'
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-600" suppressHydrationWarning>
            {mounted ? (
              step === 'register'
                ? (language === 'ar' 
                  ? 'انضم إلينا واستمتع بتجربة تسوق مميزة'
                  : 'Join us and enjoy an exceptional shopping experience')
                : (language === 'ar'
                  ? 'أدخل كود التأكيد المرسل إلى بريدك الإلكتروني'
                  : 'Enter the verification code sent to your email')
            ) : (
              step === 'register'
                ? 'انضم إلينا واستمتع بتجربة تسوق مميزة'
                : 'أدخل كود التأكيد المرسل إلى بريدك الإلكتروني'
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          {step === 'register' ? (
            <>
            <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'الاسم الأول' : 'First Name') : 'الاسم الأول'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={mounted ? (language === 'ar' ? 'الاسم الأول' : 'First name') : 'الاسم الأول'}
                    suppressHydrationWarning
                    maxLength={25}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'الاسم الأخير' : 'Last Name') : 'الاسم الأخير'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={mounted ? (language === 'ar' ? 'الاسم الأخير' : 'Last name') : 'الاسم الأخير'}
                    suppressHydrationWarning
                    maxLength={25}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'البريد الإلكتروني' : 'Email Address') : 'البريد الإلكتروني'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={mounted ? (language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email') : 'أدخل بريدك الإلكتروني'}
                  suppressHydrationWarning
                  maxLength={254}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'رقم الهاتف' : 'Phone Number') : 'رقم الهاتف'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={mounted ? (language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number') : 'أدخل رقم هاتفك'}
                  maxLength={15}
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'كلمة المرور' : 'Password') : 'كلمة المرور'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={mounted ? (language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password') : 'أدخل كلمة المرور'}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters') : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'}
              </p>
            </div>

            {/* Password Strength Bar */}
            <PasswordStrengthBar password={formData.password} />

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password') : 'تأكيد كلمة المرور'} *
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
                  placeholder={mounted ? (language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm your password') : 'أعد إدخال كلمة المرور'}
                  suppressHydrationWarning
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

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'أوافق على' : 'I agree to the') : 'أوافق على'}{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500" suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions') : 'الشروط والأحكام'}
                  </Link>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="subscribeNewsletter"
                  name="subscribeNewsletter"
                  type="checkbox"
                  checked={formData.subscribeNewsletter}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-gray-700" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'أريد تلقي العروض والخصومات عبر البريد الإلكتروني' : 'I want to receive offers and discounts via email') : 'أريد تلقي العروض والخصومات عبر البريد الإلكتروني'}
                </label>
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
                suppressHydrationWarning
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') : 'جاري إنشاء الحساب...'}
                    </span>
                  </>
                ) : (
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'إنشاء الحساب' : 'Create Account') : 'إنشاء الحساب'}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'أو' : 'Or') : 'أو'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <GoogleOAuthButton
              onSuccess={(user) => {
                setSuccess(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
                setTimeout(() => {
                  window.location.href = '/';
                }, 1500);
              }}
              onError={(error) => {
                setError(error);
              }}
            />
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600" suppressHydrationWarning>
              {mounted ? (language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?') : 'لديك حساب بالفعل؟'}{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                suppressHydrationWarning
              >
                {mounted ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign in') : 'تسجيل الدخول'}
              </Link>
            </p>
          </div>
          </>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              {/* Success Message - Show Code for Development */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {language === 'ar' ? `الكود المرسل: ${success}` : `Verification Code: ${success}`}
                  </span>
                </div>
              )}

              {/* Verification Code Field */}
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'كود التأكيد' : 'Verification Code'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={language === 'ar' ? 'أدخل الكود المكون من 6 أرقام' : 'Enter 6-digit code'}
                    maxLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {language === 'ar' ? 'أدخل الكود المرسل إلى بريدك الإلكتروني' : 'Enter the code sent to your email'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
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
                      {language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                    </>
                  ) : (
                    <>
                      {language === 'ar' ? 'تأكيد الحساب' : 'Verify Account'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Resend Code Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0
                    ? (language === 'ar' 
                        ? `إعادة الإرسال متاحة بعد ${resendCooldown} ثانية`
                        : `Resend available in ${resendCooldown}s`)
                    : (language === 'ar' 
                        ? 'إعادة إرسال الكود'
                        : 'Resend Code')
                  }
                </button>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setError('');
                    setSuccess('');
                    setVerificationCode('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {language === 'ar' ? '← العودة للتسجيل' : '← Back to registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
