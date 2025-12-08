'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { validateEmail } from '@/lib/client-validation';

export default function LoginPage() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading, login, verifyMfaLogin } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']); // 6 digits for TOTP
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [isInsecureConnection, setIsInsecureConnection] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // Prevent multiple verification attempts
  const verifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Cleanup timeout on unmount
    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current);
      }
    };
  }, []);

  // Prevent navigation when MFA is required
  useEffect(() => {
    if (mfaRequired) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = language === 'ar' 
          ? 'أنت في عملية تسجيل الدخول. هل أنت متأكد من المغادرة؟'
          : 'You are in the process of logging in. Are you sure you want to leave?';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [mfaRequired, language]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      // Get redirect URL from query params
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      
      // Validate redirect URL to prevent open redirect attacks
      if (redirect && redirect.startsWith('/') && !redirect.includes('://') && !redirect.includes('javascript:') && !redirect.includes('data:')) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // CRITICAL SECURITY: Check connection security on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      // Show warning if not secure and not localhost
      if (!isSecure && !isLocalhost) {
        setIsInsecureConnection(true);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CRITICAL SECURITY: Check if connection is secure (HTTPS)
    // Prevent cleartext password submission over HTTP
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      // Only allow HTTP on localhost (development), require HTTPS everywhere else
      if (!isSecure && !isLocalhost) {
        setError(language === 'ar' 
          ? 'يجب استخدام اتصال آمن (HTTPS) لتسجيل الدخول. الاتصال الحالي غير آمن.' 
          : 'Secure connection (HTTPS) required for login. Current connection is not secure.');
        return;
      }
    }
    
    // SECURITY: Validate inputs before submission
    if (!formData.email.trim() || !formData.password) {
      setError(language === 'ar' ? 'البريد الإلكتروني وكلمة المرور مطلوبان' : 'Email and password are required');
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || (language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // SECURITY: Send rememberMe flag to API
      const result = await login(formData.email, formData.password, formData.rememberMe);
      
      // Check if MFA is required
      if (typeof result === 'object' && 'mfaRequired' in result && result.mfaRequired) {
        setMfaRequired(true);
        setTempToken(result.tempToken || null);
        return;
      }
      
      // Check if login was successful
      if (typeof result === 'object' && 'success' in result && result.success) {
        setSuccess(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        setTimeout(() => {
          // Get redirect URL from query params
          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect');
          
          // Validate redirect URL to prevent open redirect attacks
          if (redirect && redirect.startsWith('/') && !redirect.includes('://') && !redirect.includes('javascript:') && !redirect.includes('data:')) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        const errorMsg = typeof result === 'object' && 'error' in result 
          ? (result.error || (language === 'ar' ? 'خطأ في البريد الإلكتروني أو كلمة المرور' : 'Invalid email or password'))
          : (language === 'ar' ? 'خطأ في البريد الإلكتروني أو كلمة المرور' : 'Invalid email or password');
        setError(errorMsg);
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaCodeChange = (index: number, value: string) => {
    // Prevent changes if already verifying
    if (isVerifying) return;

    // Only allow single digit
    if (value.length > 1) {
      // If user pastes multiple digits, take only the first one
      value = value.charAt(0);
    }
    if (!/^\d*$/.test(value)) return;

    const newCode = [...mfaCode];
    newCode[index] = value;
    
    // Update state immediately
    setMfaCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => {
        const nextInput = document.getElementById(`mfa-login-${index + 1}`);
        nextInput?.focus();
      }, 10);
    }

    // Clear errors when user starts typing
    if (error) setError('');

    // Clear any existing timeout
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
      verifyTimeoutRef.current = null;
    }

    // Auto-verify when all 6 digits are entered
    // Check if all 6 digits are filled
    const allDigitsFilled = newCode.length === 6 && 
                           newCode.every(digit => digit !== '' && digit !== null && digit !== undefined);
    
    if (allDigitsFilled && !isVerifying) {
      // Debounce: Wait 800ms after user stops typing before auto-verifying
      // This prevents multiple rapid requests
      verifyTimeoutRef.current = setTimeout(() => {
        const currentCode = newCode.join('');
        if (currentCode.length === 6 && /^\d{6}$/.test(currentCode) && !isVerifying) {
            handleMfaVerify(false, currentCode); // Auto-verify, don't show error, pass code directly
        }
      }, 800);
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-login-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleMfaVerify = async (showError = false, codeOverride?: string) => {
    // Prevent multiple simultaneous verification attempts
    if (isVerifying) {
      return;
    }

    const code = codeOverride || mfaCode.join('');
    
    // Validate code length
    if (code.length !== 6) {
      if (showError) {
        setError(language === 'ar' ? 'يرجى إدخال الكود المكون من 6 أرقام' : 'Please enter the 6-digit code');
      }
      return;
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      if (showError) {
        setError(language === 'ar' ? 'الكود يجب أن يكون 6 أرقام فقط' : 'Code must be 6 digits only');
      }
      return;
    }

    // Clear any pending timeout
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
      verifyTimeoutRef.current = null;
    }

    setIsVerifying(true);
    setIsLoading(true);
    setError('');

    try {
      const success = await verifyMfaLogin(code);
      
      if (success) {
        setSuccess(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        setTimeout(() => {
          // Get redirect URL from query params
          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get('redirect');
          
          // Validate redirect URL to prevent open redirect attacks
          if (redirect && redirect.startsWith('/') && !redirect.includes('://') && !redirect.includes('javascript:') && !redirect.includes('data:')) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setError(language === 'ar' ? 'كود التحقق غير صحيح' : 'Invalid verification code');
        setMfaCode(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ أثناء التحقق' : 'Verification error occurred');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto"></div>
          <p className="mt-4 text-gray-600" suppressHydrationWarning>
            {mounted ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
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
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'ar' 
              ? 'أهلاً بك مرة أخرى! سجل دخولك للوصول إلى حسابك'
              : 'Welcome back! Sign in to access your account'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Email & Password Card */}
        {!mfaRequired && (
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
            <form 
              className="space-y-6" 
              onSubmit={(e) => {
                e.preventDefault();         
                handleSubmit(e);             
              }}
              noValidate                      
            >
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
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
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    maxLength={254}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    maxLength={128}
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    {language === 'ar' ? 'تذكرني' : 'Remember me'}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </Link>
                </div>
              </div>

              {/* Security Warning - Insecure Connection */}
              {isInsecureConnection && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {language === 'ar' 
                      ? '⚠️ تحذير: الاتصال غير آمن. يجب استخدام HTTPS لتسجيل الدخول بشكل آمن.'
                      : '⚠️ Warning: Connection is not secure. HTTPS is required for secure login.'}
                  </span>
                </div>
              )}

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
                      {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                    </>
                  ) : (
                    language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MFA Code Card */}
        {mfaRequired && (
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ar' 
                  ? 'أدخل الكود المكون من 6 أرقام'
                  : 'Enter the 6-digit code'
                }
              </p>
            </div>
                
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* 6-digit code input */}
            <div className="flex justify-center gap-2 mb-6" dir="ltr">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`mfa-login-${index}`}
                  name={`mfa-login-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  spellCheck="false"
                  maxLength={1}
                  value={mfaCode[index]}
                  onChange={(e) => handleMfaCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleMfaKeyDown(index, e)}
                  dir="ltr"
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{ direction: 'ltr', textAlign: 'center' }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleMfaVerify(true);
                }}
                disabled={isLoading || mfaCode.some(d => !d)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                  : (language === 'ar' ? 'تحقق' : 'Verify')
                }
              </button>
              <button
                type="button"
                onClick={() => {
                  setMfaRequired(false);
                  setMfaCode(['', '', '', '', '', '']);
                  setTempToken(null);
                  setError('');
                }}
                className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Divider and Social Login - Only show when not in MFA mode */}
        {!mfaRequired && (
          <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {language === 'ar' ? 'أو' : 'Or'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6">
              <GoogleOAuthButton
                onSuccess={(user) => {
                  setSuccess(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
                  setTimeout(() => {
                    // Get redirect URL from query params
                    const searchParams = new URLSearchParams(window.location.search);
                    const redirect = searchParams.get('redirect');
                    
                    // Validate redirect URL to prevent open redirect attacks
                    if (redirect && redirect.startsWith('/') && !redirect.includes('://') && !redirect.includes('javascript:') && !redirect.includes('data:')) {
                      router.push(redirect);
                    } else {
                      router.push('/');
                    }
                  }, 1500);
                }}
                onError={(error) => {
                  setError(error);
                }}
              />
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {language === 'ar' ? 'إنشاء حساب جديد' : 'Create an account'}
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
