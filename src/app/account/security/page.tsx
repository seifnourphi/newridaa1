'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCSRF } from '@/hooks/useCSRF';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { validatePassword, hasForbiddenChars } from '@/lib/client-validation';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit3,
  AlertTriangle,
  X
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
  lastLogin: string;
  loginHistory: Array<{
    date: string;
    location: string;
    device: string;
    ip: string;
  }>;
}

export default function SecurityPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const [mounted, setMounted] = useState(false);

  const fetchMfaStatus = async () => {
    setIsLoadingMfa(true);
    try {
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token' || name === '__Host-token') {
            token = decodeURIComponent(value);
            break;
          }
        }
      }
      const makeRequest = async (authToken: string | null) => {
        return fetch('/api/auth/mfa/status', {
          method: 'GET',
          headers: {
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      };
      let response = await makeRequest(token);
      if (response.status === 401 && token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        response = await makeRequest(null);
      }
      if (response.ok) {
        const data = await response.json();
        setMfaEnabled(data.mfaEnabled || false);
      } else {
        // If not authenticated, default to false but don't show error
        setMfaEnabled(false);
      }
    } catch (error) {
      // Don't show error toast on initial load - just default to false
      setMfaEnabled(false);
    } finally {
      setIsLoadingMfa(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Fetch MFA status on mount, regardless of user availability
    // The backend will handle authentication
    fetchMfaStatus();
  }, []);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: '2024-01-01',
    lastLogin: '2024-01-10T10:30:00Z',
    loginHistory: [
      {
        date: '2024-01-10T10:30:00Z',
        location: 'Cairo, Egypt',
        device: 'Chrome on Windows',
        ip: '192.168.1.100'
      },
      {
        date: '2024-01-09T15:45:00Z',
        location: 'Cairo, Egypt',
        device: 'Safari on iPhone',
        ip: '192.168.1.101'
      }
    ]
  });

  // Form states
  const [editingField, setEditingField] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
    onCancel: () => { },
  });

  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true); // Start as true to prevent showing wrong button
  const [mfaSetupData, setMfaSetupData] = useState<{
    qrCode: string;
    secret: string;
    mfaSecretId: string;
  } | null>(null);
  const [mfaVerificationCode, setMfaVerificationCode] = useState(['', '', '', '', '', '']); // 6 digits for TOTP
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  const handleEditField = (field: string) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleStartSecurityCheck = async () => {
    setConfirmDialog({
      isOpen: true,
      title: language === 'ar' ? 'تأكيد العملية' : 'Confirm Action',
      message: language === 'ar'
        ? 'سيتم فتح نافذة تغيير كلمة المرور. بعد تغيير كلمة المرور بنجاح، سيتم تسجيل الخروج من جميع الأجهزة تلقائياً.'
        : 'A password change window will open. After successfully changing your password, you will be logged out from all devices automatically.',
      type: 'alert',
      confirmText: language === 'ar' ? 'متابعة' : 'Continue',
      cancelText: language === 'ar' ? 'إلغاء' : 'Cancel',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        // Open change password modal first
        // The password change will handle logout-all automatically after success
        setEditingField('password');

        // Show info message
        showToast(
          language === 'ar'
            ? 'يرجى تغيير كلمة المرور الآن. بعد التغيير، سيتم تسجيل الخروج من جميع الأجهزة.'
            : 'Please change your password now. After changing, you will be logged out from all devices.',
          'info',
          5000
        );
      },
      onCancel: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Only proceed if user is logged in
    if (!user) {
      throw new Error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
    }

    if (csrfLoading || !csrfToken) {
      throw new Error(
        language === 'ar'
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
          : 'Your session has expired. Please sign in again.'
      );
    }

    const response = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        csrfToken,
      }),
    }).catch(() => null); // Silently catch network errors

    if (!response) {
      throw new Error(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
    }

    const data = await response.json();

    if (!response.ok) {
      // Silently handle 401 errors - user may not be logged in
      if (response.status === 401) {
        throw new Error(
          language === 'ar'
            ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
            : 'Your session has expired. Please sign in again.'
        );
      }
      throw new Error(data.error || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
    }

    return data;
  };

  // SECURITY: Validate password strength using secure validation
  const validatePasswordStrength = (password: string): { valid: boolean; error?: string } => {
    const validation = validatePassword(password);
    if (!validation.valid) {
      return {
        valid: false,
        error: language === 'ar'
          ? validation.error || 'كلمة المرور غير صحيحة'
          : validation.error || 'Invalid password format'
      };
    }
    return { valid: true };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(passwordForm.newPassword);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || '');
      return;
    }

    // Check if new password is the same as current password
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError(language === 'ar'
        ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية'
        : 'New password must be different from the current password'
      );
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setEditingField(null);

      // Show success toast
      showToast(
        language === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح! سيتم تسجيل الخروج الآن.'
          : 'Password changed successfully! You will be logged out now.',
        'success',
        3000
      );

      // Logout and redirect to login
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('mfa-temp-token');
        }
        window.location.href = '/auth/login';
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.message || '';

      // Map common error messages to Arabic/English
      if (errorMessage.includes('different from the current password') ||
        errorMessage.includes('must be different')) {
        setPasswordError(language === 'ar'
          ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية'
          : 'New password must be different from the current password'
        );
      } else if (errorMessage.includes('incorrect') || errorMessage.includes('Current password')) {
        setPasswordError(language === 'ar'
          ? 'كلمة المرور الحالية غير صحيحة'
          : 'Current password is incorrect'
        );
      } else {
        setPasswordError(errorMessage || (language === 'ar'
          ? 'حدث خطأ أثناء تغيير كلمة المرور'
          : 'An error occurred while changing password'
        ));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };




  const handleMfaSetup = async () => {
    setIsLoadingMfa(true);
    try {
      let token: string | null = null;

      // Try localStorage first
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }

      // If not found, try cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token' || name === '__Host-token') {
            token = decodeURIComponent(value);
            break;
          }
        }
      }

      if (!token) {
        showToast(
          language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
          'error'
        );
        setIsLoadingMfa(false);
        return;
      }

      // Helper to make request
      const makeSetupRequest = async (authToken: string | null) => {
        return fetch('/api/auth/mfa/setup', {
          method: 'GET',
          headers: {
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      };

      let response = await makeSetupRequest(token);

      // If 401 and we used a token, retry without header (use cookie)
      if (response.status === 401 && token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        response = await makeSetupRequest(null);
      }

      const data = await response.json();

      if (response.ok) {
        // Check if response indicates authentication is required
        if (data.requiresAuth) {
          showToast(
            language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
            'error'
          );
          setIsLoadingMfa(false);
          return;
        }

        // Check if MFA is already enabled
        if (data.mfaEnabled) {
          setMfaEnabled(true);
          showToast(
            language === 'ar' ? 'المصادقة الثنائية مفعلة بالفعل' : 'MFA is already enabled',
            'info'
          );
          setIsLoadingMfa(false);
          return;
        }

        // Check if we have QR code and secret for setup
        if (data.qrCode && data.manualEntryKey) {
          setMfaSetupData({
            qrCode: data.qrCode,
            secret: data.manualEntryKey,
            mfaSecretId: data.mfaSecretId,
          });
          setShowMfaSetup(true);
          setIsLoadingMfa(false);
        } else {
          // Show error message
          const errorMessage = data.error ||
            (language === 'ar' ? 'فشل في إعداد المصادقة الثنائية' : 'Failed to setup MFA');
          showToast(errorMessage, 'error');
          setIsLoadingMfa(false);
        }
      } else if (response.status === 401) {
        // Handle 401 errors - user may not be logged in or token expired
        showToast(
          language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first',
          'error'
        );
        setIsLoadingMfa(false);
      } else {
        try {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          showToast(
            error.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
            'error'
          );
        } catch (e) {
          showToast(
            language === 'ar' ? 'حدث خطأ' : 'An error occurred',
            'error'
          );
        }
        setIsLoadingMfa(false);
      }
    } catch (error) {
      // MFA setup error - handle network errors
      showToast(
        language === 'ar' ? 'حدث خطأ في إعداد المصادقة الثنائية' : 'Error setting up MFA',
        'error'
      );
      setIsLoadingMfa(false);
    }
  };

  const handleMfaVerify = async () => {
    const code = mfaVerificationCode.join('');

    // Only show error if user manually clicked verify button with incomplete code
    // Don't show error during auto-verify (when typing)
    if (code.length !== 6) {
      // Silently return if code is incomplete (user is still typing)
      // Only show error if explicitly called (button click)
      return;
    }

    setIsLoadingMfa(true);
    try {
      let token: string | null = null;

      // Try localStorage first
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }

      // If not found, try cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token' || name === '__Host-token') {
            token = decodeURIComponent(value);
            break;
          }
        }
      }

      if (!token || !mfaSetupData) {
        showToast(
          language === 'ar' ? 'بيانات الإعداد غير موجودة' : 'Setup data not found',
          'error'
        );
        setIsLoadingMfa(false);
        return;
      }

      // Validate code format before sending
      if (!/^\d{6}$/.test(code)) {
        showToast(
          language === 'ar' ? 'الكود يجب أن يكون 6 أرقام' : 'Code must be 6 digits',
          'error'
        );
        setIsLoadingMfa(false);
        return;
      }

      // Ensure code is a string and trim it
      const codeString = String(code).trim();

      const requestBody = {
        code: codeString,
        mfaSecretId: mfaSetupData.mfaSecretId,
      };

      // Helper to make request for verification
      const makeVerifyRequest = async (authToken: string | null) => {
        return fetch('/api/auth/mfa/verify-setup', {
          method: 'POST',
          headers: {
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      };

      let response = await makeVerifyRequest(token);

      // If 401 and we used a token, retry without header (use cookie)
      if (response.status === 401 && token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        response = await makeVerifyRequest(null);
      }

      if (response.ok) {
        const result = await response.json();
        setMfaEnabled(true);
        setShowMfaSetup(false);
        setMfaSetupData(null);
        setMfaVerificationCode(['', '', '', '', '', '']);
        showToast(
          language === 'ar' ? 'تم تفعيل المصادقة الثنائية بنجاح!' : 'MFA enabled successfully!',
          'success'
        );
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        showToast(
          error.error || (language === 'ar' ? 'كود التحقق غير صحيح' : 'Invalid verification code'),
          'error'
        );
        setMfaVerificationCode(['', '', '', '', '', '']);
      }
    } catch (error) {
      // MFA verification error - no sensitive data logged
      showToast(
        language === 'ar' ? 'حدث خطأ في التحقق' : 'Verification error',
        'error'
      );
    } finally {
      setIsLoadingMfa(false);
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    if (!enabled) {
      setConfirmDialog({
        isOpen: true,
        title: language === 'ar' ? 'تعطيل المصادقة الثنائية' : 'Disable MFA',
        message: language === 'ar'
          ? 'هل أنت متأكد من تعطيل المصادقة الثنائية؟ هذا سيقلل من أمان حسابك.'
          : 'Are you sure you want to disable MFA? This will reduce your account security.',
        type: 'alert',
        confirmText: language === 'ar' ? 'تعطيل' : 'Disable',
        cancelText: language === 'ar' ? 'إلغاء' : 'Cancel',
        onConfirm: async () => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          await performMfaToggle(enabled);
        },
        onCancel: () => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        },
      });
      return;
    }
    await performMfaToggle(enabled);
  };

  const performMfaToggle = async (enabled: boolean) => {
    setIsLoadingMfa(true);
    try {
      let token: string | null = null;

      // Try localStorage first
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }

      // If not found, try cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token' || name === '__Host-token') {
            token = decodeURIComponent(value);
            break;
          }
        }
      }
      // CSRF token from hook
      const csrf = csrfToken;
      // Ensure CSRF token is ready before making request
      if (csrfLoading || !csrf) {
        showToast(
          language === 'ar' ? 'جاري تحميل الرمز الأمني، يرجى الانتظار' : 'CSRF token loading, please wait',
          'error'
        );
        setIsLoadingMfa(false);
        return;
      }
      const makeRequest = async (authToken: string | null, csrfTok: string | null) => {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        if (csrfTok) {
          headers['X-CSRF-Token'] = csrfTok;
        }
        return fetch('/api/auth/mfa/toggle', {
          method: 'POST',
          headers,
          body: JSON.stringify({ enabled }),
          credentials: 'include',
        });
      };
      let response = await makeRequest(token, csrf);
      if (response.status === 401 && token) {
        // Clear stale token and retry without auth header
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        response = await makeRequest(null, csrf);
      }
      if (response.ok) {
        setMfaEnabled(enabled);
        if (!enabled) {
          setShowMfaSetup(false);
          setMfaSetupData(null);
        }
        await fetchMfaStatus();
        showToast(
          enabled
            ? (language === 'ar' ? 'تم تفعيل المصادقة الثنائية' : 'MFA enabled')
            : (language === 'ar' ? 'تم تعطيل المصادقة الثنائية' : 'MFA disabled'),
          'success'
        );
      } else {
        const err = await response.json();
        showToast(err.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'), 'error');
      }
    } catch (e) {
      showToast(language === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
    } finally {
      setIsLoadingMfa(false);
    }
  };

  const handleMfaCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...mfaVerificationCode];
    newCode[index] = value;

    // Update state immediately
    setMfaVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 6) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all 6 digits are entered
    // Use setTimeout to ensure state is updated before verification
    if (newCode.every(digit => digit !== '' && digit !== null && digit !== undefined) && newCode.length === 6) {
      // Wait a bit longer to ensure state update is complete
      setTimeout(() => {
        // Double-check that code is complete before verifying
        const currentCode = newCode.join('');
        if (currentCode.length === 6 && /^\d{6}$/.test(currentCode)) {
          handleMfaVerify();
        }
      }, 500);
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaVerificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-${index - 1}`);
      prevInput?.focus();
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return {
      score: strength,
      text: strength < 2 ? (language === 'ar' ? 'ضعيف' : 'Weak') :
        strength < 4 ? (language === 'ar' ? 'متوسط' : 'Medium') :
          (language === 'ar' ? 'قوي' : 'Strong'),
      color: strength < 2 ? 'bg-red-500' :
        strength < 4 ? 'bg-yellow-500' :
          'bg-green-500'
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className={`min-h-screen bg-white ${mounted ? (language === 'ar' ? 'rtl' : 'ltr') : 'rtl'}`} dir={mounted ? (language === 'ar' ? 'rtl' : 'ltr') : 'rtl'} suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>
              {mounted ? (language === 'ar' ? 'الأمان' : 'Security') : 'الأمان'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Password Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-6 h-6 text-[#DAA520]" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900" suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'كلمة المرور' : 'Password') : 'كلمة المرور'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    **********
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEditField('password')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                suppressHydrationWarning
              >
                <Edit3 className="w-4 h-4" />
                <span suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'تعديل' : 'Edit') : 'تعديل'}
                </span>
              </button>
            </div>
          </div>

          {/* MFA Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-[#DAA520]" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900" suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'المصادقة الثنائية (MFA)' : 'Two-Factor Authentication (MFA)') : 'المصادقة الثنائية (MFA)'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                    {mounted ? (language === 'ar'
                      ? 'أضف طبقة أمان إضافية. يتطلب كود من 6 أرقام من Google Authenticator أو Gmail.'
                      : 'Add an extra layer of security. Requires a 6-digit code from Google Authenticator or Gmail.'
                    ) : 'أضف طبقة أمان إضافية. يتطلب كود من 6 أرقام من Google Authenticator أو Gmail.'}
                  </p>
                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${mfaEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`} suppressHydrationWarning>
                    {mfaEnabled ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span suppressHydrationWarning>
                          {mounted ? (language === 'ar' ? 'مفعل' : 'Enabled') : 'مفعل'}
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span suppressHydrationWarning>
                          {mounted ? (language === 'ar' ? 'معطل' : 'Disabled') : 'معطل'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MFA Setup Modal */}
            {showMfaSetup && mfaSetupData && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-[#DAA520]">
                <h4 className="text-lg font-semibold text-gray-900 mb-4" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'إعداد المصادقة الثنائية' : 'Setup Two-Factor Authentication') : 'إعداد المصادقة الثنائية'}
                </h4>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-2" suppressHydrationWarning>
                      {mounted ? (language === 'ar'
                        ? '1. افتح تطبيق Google Authenticator على هاتفك'
                        : '1. Open Google Authenticator app on your phone'
                      ) : '1. افتح تطبيق Google Authenticator على هاتفك'}
                    </p>
                    <p className="text-sm text-gray-700 mb-4" suppressHydrationWarning>
                      {mounted ? (language === 'ar'
                        ? '2. امسح رمز QR أدناه أو أدخل المفتاح يدوياً'
                        : '2. Scan the QR code below or enter the key manually'
                      ) : '2. امسح رمز QR أدناه أو أدخل المفتاح يدوياً'}
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <img
                        src={mfaSetupData.qrCode}
                        alt="MFA QR Code"
                        className="border-2 border-gray-300 rounded-lg p-2 bg-white"
                      />
                    </div>

                    {/* Manual Entry Key */}
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <p className="text-xs text-gray-600 mb-2" suppressHydrationWarning>
                        {mounted ? (language === 'ar' ? 'المفتاح اليدوي:' : 'Manual Entry Key:') : 'المفتاح اليدوي:'}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                          {mfaSetupData.secret}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(mfaSetupData.secret);
                            showToast(
                              language === 'ar' ? 'تم النسخ!' : 'Copied!',
                              'success',
                              2000
                            );
                          }}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                          suppressHydrationWarning
                        >
                          <span suppressHydrationWarning>
                            {mounted ? (language === 'ar' ? 'نسخ' : 'Copy') : 'نسخ'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3" suppressHydrationWarning>
                      {mounted ? (language === 'ar'
                        ? '3. أدخل الكود المكون من 6 أرقام من التطبيق:'
                        : '3. Enter the 6-digit code from the app:'
                      ) : '3. أدخل الكود المكون من 6 أرقام من التطبيق:'}
                    </p>

                    {/* 6-digit code input */}
                    {/* SECURITY: Force LTR direction for numeric input even in RTL languages */}
                    {/* Numbers should always be entered left-to-right for consistency */}
                    <div className="flex justify-center gap-2 mb-4" dir="ltr">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`mfa-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={mfaVerificationCode[index]}
                          onChange={(e) => handleMfaCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleMfaKeyDown(index, e)}
                          dir="ltr"
                          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#DAA520] focus:ring-2 focus:ring-[#DAA520]/20 transition-all"
                          style={{ direction: 'ltr', textAlign: 'center' }}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const code = mfaVerificationCode.join('');
                          if (code.length !== 6) {
                            showToast(
                              language === 'ar' ? 'يرجى إدخال الكود المكون من 6 أرقام' : 'Please enter the 6-digit code',
                              'error'
                            );
                            return;
                          }
                          handleMfaVerify();
                        }}
                        disabled={isLoadingMfa || mfaVerificationCode.some(d => !d)}
                        className="flex-1 px-4 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        suppressHydrationWarning
                      >
                        <span suppressHydrationWarning>
                          {isLoadingMfa
                            ? (mounted ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : 'جاري التحقق...')
                            : (mounted ? (language === 'ar' ? 'تفعيل المصادقة الثنائية' : 'Enable MFA') : 'تفعيل المصادقة الثنائية')
                          }
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMfaSetup(false);
                          setMfaSetupData(null);
                          setMfaVerificationCode(['', '', '', '', '', '']);
                        }}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        suppressHydrationWarning
                      >
                        <span suppressHydrationWarning>
                          {mounted ? (language === 'ar' ? 'إلغاء' : 'Cancel') : 'إلغاء'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MFA Toggle Buttons */}
            {!showMfaSetup && (
              <div className="flex gap-2">
                {isLoadingMfa ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    suppressHydrationWarning
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : 'جاري التحميل...'}
                    </span>
                  </button>
                ) : mfaEnabled ? (
                  <button
                    onClick={() => handleMfaToggle(false)}
                    disabled={isLoadingMfa}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    suppressHydrationWarning
                  >
                      <X className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'تعطيل' : 'Disable') : 'تعطيل'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleMfaSetup}
                    disabled={isLoadingMfa}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    suppressHydrationWarning
                  >
                      <Shield className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'تفعيل المصادقة الثنائية' : 'Enable MFA') : 'تفعيل المصادقة الثنائية'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Compromised Account Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900" suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'حساب مخترق؟' : 'Compromised account?') : 'حساب مخترق؟'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                    {mounted ? (language === 'ar'
                      ? 'اتخذ خطوات مثل تغيير كلمة المرور وتسجيل الخروج من كل مكان.'
                      : 'Take steps such as changing your password and signing out everywhere.'
                    ) : 'اتخذ خطوات مثل تغيير كلمة المرور وتسجيل الخروج من كل مكان.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartSecurityCheck}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : 'جاري المعالجة...'}
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {mounted ? (language === 'ar' ? 'بدء' : 'Start') : 'بدء'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {editingField === 'password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900" suppressHydrationWarning>
                {mounted ? (language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password') : 'تغيير كلمة المرور'}
              </h2>
              <button
                onClick={() => setEditingField(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password') : 'كلمة المرور الحالية'}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password') : 'كلمة المرور الجديدة'}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    required
                    minLength={8}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* SECURITY: Password strength indicator */}
                {passwordForm.newPassword && (
                  <div className="mt-3">
                    <PasswordStrengthBar password={passwordForm.newPassword} />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {mounted ? (language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password') : 'تأكيد كلمة المرور'}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50"
                  suppressHydrationWarning
                >
                  {isChangingPassword ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span suppressHydrationWarning>
                    {isChangingPassword
                      ? (mounted ? (language === 'ar' ? 'جاري التغيير...' : 'Changing...') : 'جاري التغيير...')
                      : (mounted ? (language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password') : 'تغيير كلمة المرور')
                    }
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  suppressHydrationWarning
                >
                  <span suppressHydrationWarning>
                    {mounted ? (language === 'ar' ? 'إلغاء' : 'Cancel') : 'إلغاء'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText || (confirmDialog.type === 'alert' ? (language === 'ar' ? 'متابعة' : 'Continue') : (language === 'ar' ? 'تأكيد' : 'Confirm'))}
          cancelText={confirmDialog.cancelText || (language === 'ar' ? 'إلغاء' : 'Cancel')}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel || (() => setConfirmDialog({ ...confirmDialog, isOpen: false }))}
        />
      )}
    </div>
  );
}
