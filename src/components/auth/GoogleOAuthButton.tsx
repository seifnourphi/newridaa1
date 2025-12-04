'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GoogleOAuthButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export function GoogleOAuthButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = ''
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get Google Client ID from environment variable only
  // Never hardcode API keys or credentials in client-side code
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Validate that client ID is set
  if (!clientId) {
    // Google Client ID is not configured - no sensitive data logged
  }

  // Load Google OAuth script
  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve(true);
        return;
      }

      // Suppress Google SDK console warnings before loading script
      const originalError = window.console.error;
      const originalWarn = window.console.warn;
      const originalLog = window.console.log;
      
      // Enhanced suppression for all Google/FedCM related messages
      const shouldSuppress = (message: string): boolean => {
        const lowerMessage = message.toLowerCase();
        return lowerMessage.includes('gsi_logger') || 
               lowerMessage.includes('fedcm') || 
               lowerMessage.includes('fed-cm') ||
               lowerMessage.includes('fedcm-migration') ||
               lowerMessage.includes('identitycredentialerror') ||
               lowerMessage.includes('identity credential') ||
               lowerMessage.includes('id assertion endpoint') ||
               lowerMessage.includes('cors headers') ||
               lowerMessage.includes('server did not send') ||
               lowerMessage.includes('network error') ||
               lowerMessage.includes('err_failed') ||
               lowerMessage.includes('google accounts') ||
               (lowerMessage.includes('google') && lowerMessage.includes('oauth'));
      };
      
      window.console.error = (...args: any[]) => {
        const message = args.join(' ');
        if (shouldSuppress(message)) {
          return; // Suppress these messages
        }
        originalError.apply(console, args);
      };
      
      window.console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (shouldSuppress(message)) {
          return; // Suppress these messages
        }
        originalWarn.apply(console, args);
      };

      window.console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (shouldSuppress(message)) {
          return; // Suppress these messages
        }
        originalLog.apply(console, args);
      };

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Keep console suppressed for longer to catch all Google SDK messages
        setTimeout(() => {
          window.console.error = originalError;
          window.console.warn = originalWarn;
          window.console.log = originalLog;
        }, 3000); // Increased delay to catch more messages
        resolve(true);
      };
      script.onerror = () => {
        window.console.error = originalError;
        window.console.warn = originalWarn;
        window.console.log = originalLog;
        reject(new Error('Failed to load Google OAuth script'));
      };
      document.head.appendChild(script);
    });
  };

  // Generate CSRF token
  const generateCSRFToken = () => {
    const rnd = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : (typeof window !== 'undefined' && window.crypto?.getRandomValues
          ? Array.from(window.crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    document.cookie = `csrf-token=${rnd}; path=/; max-age=3600; samesite=lax`;
    return rnd;
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    if (isLoading || disabled) return;

    // Check if client ID is configured
    if (!clientId) {
      onError?.('Google authentication is not configured. Please contact support.');
      return;
    }

    try {
      setIsLoading(true);

      // Load Google script (console suppression is handled in loadGoogleScript)
      await loadGoogleScript();

      // Generate CSRF token
      const csrfToken = generateCSRFToken();

      // Initialize Google OAuth
      // Note: Client ID is from environment variable, not hardcoded
      // Suppress console during initialization
      const originalError = window.console.error;
      const originalWarn = window.console.warn;
      
      const suppressGoogleErrors = () => {
        window.console.error = (...args: any[]) => {
          const message = args.join(' ').toLowerCase();
          if (message.includes('fedcm') || 
              message.includes('gsi_logger') || 
              message.includes('cors') ||
              message.includes('id assertion') ||
              message.includes('network error')) {
            return;
          }
          originalError.apply(console, args);
        };
        
        window.console.warn = (...args: any[]) => {
          const message = args.join(' ').toLowerCase();
          if (message.includes('fedcm') || 
              message.includes('gsi_logger') ||
              message.includes('fedcm-migration')) {
            return;
          }
          originalWarn.apply(console, args);
        };
      };
      
      suppressGoogleErrors();
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            // Restore console
            window.console.error = originalError;
            window.console.warn = originalWarn;
            
            try {
              const { credential } = response;
              
              // Send to backend for verification
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  idToken: credential,
                  csrfToken
                }),
              });

              const data = await res.json();

              if (res.ok && data.success) {
                onSuccess?.(data.user);
              } else {
                onError?.(data.error || 'Google authentication failed');
              }
            } catch (error) {
              // Google OAuth error - no sensitive data logged
              onError?.('Google authentication failed');
            } finally {
              setIsLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          // Explicitly disable FedCM to avoid CORS issues
          use_fedcm: false,
        });
      } catch (error) {
        // Restore console on error
        window.console.error = originalError;
        window.console.warn = originalWarn;
        throw error;
      }
      
      // Don't restore console yet - keep it suppressed during prompt
      // Trigger Google OAuth popup
      try {
        window.google.accounts.id.prompt((notification: any) => {
          // Restore console when notification is received
          window.console.error = originalError;
          window.console.warn = originalWarn;
          
          // Handle notification properly
          if (notification) {
            if (notification.isNotDisplayed && notification.isNotDisplayed()) {
              setIsLoading(false);
              // If One Tap is not displayed, try alternative method
              onError?.(language === 'ar' ? 'لم يتم عرض نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.' : 'Sign-in prompt not displayed. Please try again.');
            } else if (notification.isSkippedMoment && notification.isSkippedMoment()) {
              setIsLoading(false);
            } else if (notification.isDismissedMoment && notification.isDismissedMoment()) {
              setIsLoading(false);
            }
          }
        });
        
        // Restore console after prompt (in case notification is not called or delayed)
        setTimeout(() => {
          window.console.error = originalError;
          window.console.warn = originalWarn;
        }, 5000); // Increased delay to catch all Google SDK messages
      } catch (error) {
        // Restore console on error
        window.console.error = originalError;
        window.console.warn = originalWarn;
        // If prompt fails, try alternative method
        setIsLoading(false);
        onError?.(language === 'ar' ? 'فشل عرض نافذة تسجيل الدخول' : 'Failed to show Google sign-in prompt');
      }

    } catch (error) {
      // Google OAuth setup error - no sensitive data logged
      onError?.('Failed to initialize Google authentication');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleAuth}
      disabled={isLoading || disabled}
      className={`
        w-full flex items-center justify-center px-4 py-3 
        border border-gray-300 rounded-lg shadow-sm
        bg-white hover:bg-gray-50 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>
            {mounted ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : 'جاري التحقق...'}
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>
            {mounted ? (language === 'ar' ? 'متابعة مع Google' : 'Continue with Google') : 'متابعة مع Google'}
          </span>
        </div>
      )}
    </button>
  );
}