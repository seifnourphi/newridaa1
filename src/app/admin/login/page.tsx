'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/admin');
  
  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    // Get redirect URL from query parameters
    // CRITICAL SECURITY: Validate redirect URL to prevent Open Redirect attacks
    const redirect = searchParams.get('redirect');
    if (redirect) {
      // Only allow redirects to admin routes (internal redirects)
      // Reject external URLs, javascript:, data:, etc.
      if (redirect.startsWith('/admin') && 
          !redirect.includes('://') && 
          !redirect.includes('javascript:') &&
          !redirect.includes('data:') &&
          !redirect.includes('//')) {
        // Additional validation: ensure it's a valid path
        if (!redirect.includes('..') && !redirect.includes('\\')) {
          setRedirectUrl(redirect);
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate form data before submission
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // CRITICAL: Include cookies in request
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // CRITICAL SECURITY: Validate redirect URL before redirecting
        const safeRedirect = redirectUrl && redirectUrl.startsWith('/admin') && !redirectUrl.includes('://') 
          ? redirectUrl 
          : '/admin';
        // CRITICAL: Use window.location.href for full page reload to ensure cookie is sent
        // This is necessary because sameSite: 'lax' requires a top-level navigation
        // fetch() requests from the same page may not send the cookie due to sameSite restrictions
        // Redirect immediately without showing success message
        window.location.href = safeRedirect;
      } else {
        // Handle different error types
        if (response.status === 429) {
          // Rate limiting error
          const retryAfter = data.retryAfter || 900; // Default 15 minutes
          const isDev = data.environment === 'development';
          const errorMsg = isDev 
            ? `محاولات دخول كثيرة جداً (${data.maxAttempts} محاولة لكل 15 دقيقة). حاول مرة أخرى بعد ${Math.ceil(retryAfter / 60)} دقيقة.`
            : `محاولات دخول كثيرة جداً. حاول مرة أخرى بعد ${Math.ceil(retryAfter / 60)} دقيقة.`;
          setError(errorMsg);
        } else {
          const errorMessage = data.error || t('admin.invalidCredentials') || 'Invalid username or password';
          setError(errorMessage);
        }
      }
    } catch (error) {
      // Admin login error - no sensitive data logged
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage || t('common.error') || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
      // Form submission completed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            ع
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('admin.login')}
          </h1>
          <p className="text-gray-600">
            {t('header.subtitle')}
          </p>
        </div>


        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={(e) => {
          handleSubmit(e);
        }} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.username')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="admin-username"
                name="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="input pl-10"
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input pl-10 pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => {
              // Submit button clicked - no sensitive data logged
            }}
            className={`w-full btn-primary ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              t('admin.loginButton')
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {language === 'ar' ? 'Ridaa. جميع الحقوق محفوظة.' : 'Ridaa. All rights reserved.'}
          </p>
        </div>
      </div>
    </div>
  );
}
