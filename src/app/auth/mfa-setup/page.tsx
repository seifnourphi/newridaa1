'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Shield, ArrowLeft, AlertCircle, CheckCircle, Smartphone, Copy, QrCode } from 'lucide-react';

export default function MFASetupPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '', '']); // 7 digits for TOTP
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaSecretId, setMfaSecretId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch MFA setup data from backend
    generateMFASecret();
  }, []);

  const generateMFASecret = async () => {
    try {
      setIsLoadingSetup(true);
      setError('');

      // Get authentication token
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0])
        : null;
      
      if (!token) {
        setError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
        setIsLoadingSetup(false);
        return;
      }

      // Call the API to get MFA setup data
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'فشل في الحصول على بيانات إعداد MFA' : 'Failed to get MFA setup data'));
        setIsLoadingSetup(false);
        return;
      }

      // If MFA is already enabled, redirect
      if (data.mfaEnabled) {
        setError(language === 'ar' ? 'المصادقة الثنائية مفعلة بالفعل' : 'MFA is already enabled');
        setTimeout(() => {
          router.push('/account/security');
        }, 2000);
        setIsLoadingSetup(false);
        return;
      }

      // Set the secret key and QR code
      setSecretKey(data.manualEntryKey || data.secret);
      setQrCodeUrl(data.qrCode);
      setMfaSecretId(data.mfaSecretId);
    } catch (err) {
      // MFA setup error - no sensitive data logged
      setError(language === 'ar' ? 'حدث خطأ أثناء إعداد المصادقة الثنائية' : 'An error occurred while setting up MFA');
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return;
    
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);

    // Auto-focus next input (7 digits, so index < 6)
    if (value && index < 6) {
      const nextInput = document.getElementById(`mfa-code-${index + 1}`);
      nextInput?.focus();
    }

    if (error) setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    setSuccess(language === 'ar' ? 'تم نسخ المفتاح!' : 'Secret key copied!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const proceedToVerification = () => {
    setStep('verify');
    setMfaCode(['', '', '', '', '', '', '']); // 7 digits
  };

  const handleVerifyMFA = async () => {
    const code = mfaCode.join('');
    if (code.length !== 7) {
      setError(language === 'ar' ? 'يرجى إدخال الكود المكون من 7 أرقام' : 'Please enter the 7-digit code');
      return;
    }

    if (!mfaSecretId) {
      setError(language === 'ar' ? 'خطأ في بيانات الإعداد' : 'Setup data error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get authentication token
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0])
        : null;
      
      if (!token) {
        setError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
        setIsLoading(false);
        return;
      }

      // Call the API to verify MFA code
      const response = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          mfaSecretId: mfaSecretId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'كود التحقق غير صحيح' : 'Invalid verification code'));
        // Clear code on error
        setMfaCode(['', '', '', '', '', '', '']);
        return;
      }
      
      setSuccess(language === 'ar' ? 'تم تفعيل المصادقة الثنائية بنجاح!' : 'Two-factor authentication enabled successfully!');
      
      // Redirect to security page after 2 seconds
      setTimeout(() => {
        router.push('/account/security');
      }, 2000);
    } catch (err) {
      // MFA verification error - no sensitive data logged
      setError(language === 'ar' ? 'حدث خطأ أثناء التحقق' : 'An error occurred during verification');
      // Clear code on error
      setMfaCode(['', '', '', '', '', '', '']);
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'ar' 
              ? 'قم بإعداد المصادقة الثنائية لحماية حسابك'
              : 'Set up two-factor authentication to secure your account'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
          {step === 'setup' ? (
            <>
              {/* Setup Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'الخطوة 1: إعداد التطبيق' : 'Step 1: Set up the app'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {language === 'ar' 
                          ? 'قم بتحميل تطبيق Google Authenticator على هاتفك'
                          : 'Download Google Authenticator app on your phone'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {language === 'ar' 
                          ? 'امسح رمز QR أو أدخل المفتاح السري يدوياً'
                          : 'Scan the QR code or enter the secret key manually'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {isLoadingSetup ? (
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-48 h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              ) : null}

              {/* Secret Key */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'المفتاح السري' : 'Secret Key'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={secretKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={copySecretKey}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title={language === 'ar' ? 'نسخ' : 'Copy'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={proceedToVerification}
                disabled={isLoadingSetup || !qrCodeUrl}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingSetup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : (
                  language === 'ar' ? 'متابعة' : 'Continue'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Verification Step */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'الخطوة 2: التحقق من الكود' : 'Step 2: Verify the code'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'ar' 
                    ? 'أدخل الكود المكون من 7 أرقام من تطبيق Google Authenticator'
                    : 'Enter the 7-digit code from your Google Authenticator app'
                  }
                </p>
              </div>

              {/* MFA Code Input */}
              {/* SECURITY: Force LTR direction for numeric input even in RTL languages */}
              {/* Numbers should always be entered left-to-right for consistency */}
              <div className="mb-6">
                <div className="flex justify-center gap-3" dir="ltr">
                  {mfaCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`mfa-code-${index}`}
                      name={`mfa-code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      spellCheck="false"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      dir="ltr"
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ direction: 'ltr', textAlign: 'center' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {language === 'ar' ? 'أدخل الكود المكون من 7 أرقام' : 'Enter the 7-digit code'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerifyMFA}
                disabled={isLoading || mfaCode.some(digit => !digit) || mfaCode.join('').length !== 7}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  language === 'ar' ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'
                )}
              </button>
            </>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">
                  {language === 'ar' ? 'تطبيقات مقترحة:' : 'Recommended apps:'}
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Google Authenticator</li>
                  <li>• Microsoft Authenticator</li>
                  <li>• Authy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
