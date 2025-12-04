'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Admin Layout - Extra layer of protection
 * This component ensures that admin pages never load their content
 * before authentication is verified, preventing discovery of sensitive routes.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Allow login page only
    if (pathname === '/admin/login') {
      setIsChecking(false);
      setIsAuthorized(true);
      setShowLoading(false);
      return;
    }

    // Show loading screen only after a small delay (300ms) to allow UI to render first
    const loadingTimeout = setTimeout(() => {
      setShowLoading(true);
    }, 300);

    // Check authentication before loading any admin content
    const checkAuth = async () => {
      try {
        // Admin layout checking auth - no sensitive data logged
        
        // Add a small delay to ensure cookie is set after redirect
        // This is especially important after login redirect
        // CRITICAL: Increase delay to 500ms to ensure cookie is fully saved by browser
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // CRITICAL: Use absolute URL with localhost:3000 to ensure same origin
        // This ensures cookies are sent correctly
        const apiUrl = typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.host}/api/admin/me`
          : '/api/admin/me';
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          credentials: 'include', // CRITICAL: This ensures httpOnly cookies are sent
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        // Admin layout auth check - no sensitive data logged
        
        if (response.ok) {
          const data = await response.json();
          // Admin auth check successful - no sensitive data logged
          setIsAuthorized(true);
        } else {
          const errorData = await response.json().catch(() => ({}));
          // Admin auth check failed - no sensitive data logged
          
          // If status is 401, definitely redirect to login
          // For other errors, retry once
          if (response.status === 401) {
            // Unauthorized (401) - redirecting to login - no sensitive data logged
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }
          
          // For other errors, retry once - no sensitive data logged
          setTimeout(async () => {
            try {
              const retryApiUrl = typeof window !== 'undefined' 
                ? `${window.location.protocol}//${window.location.host}/api/admin/me`
                : '/api/admin/me';
              
              const retryResponse = await fetch(retryApiUrl, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                },
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                // Admin layout retry successful - no sensitive data logged
                setIsAuthorized(true);
              } else {
                // Admin layout retry failed - redirecting to login - no sensitive data logged
                router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
              }
            } catch (retryError) {
              // Admin layout retry error - no sensitive data logged
              router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
            } finally {
              setIsChecking(false);
            }
          }, 1000);
          return;
        }
      } catch (error) {
        // Admin layout auth check error - no sensitive data logged
        // Don't redirect on network errors - might be temporary
        // Only redirect if it's a clear auth failure
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // Admin layout network error - retrying - no sensitive data logged
          // Retry once after a short delay
          setTimeout(async () => {
            try {
              const retryApiUrl = typeof window !== 'undefined' 
                ? `${window.location.protocol}//${window.location.host}/api/admin/me`
                : '/api/admin/me';
              
              const retryResponse = await fetch(retryApiUrl, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                },
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                // Admin layout network retry successful - no sensitive data logged
                setIsAuthorized(true);
              } else {
                // Admin layout network retry failed - redirecting to login - no sensitive data logged
                router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
              }
            } catch (retryError) {
              // Admin layout network retry error - no sensitive data logged
              router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
            } finally {
              setIsChecking(false);
            }
          }, 1000);
          return;
        }
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      } finally {
        setIsChecking(false);
        setShowLoading(false);
      }
    };

    checkAuth();

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [pathname, router]);

  // Show loading screen while checking
  // Loading screen appears with a smooth fade-in after a short delay
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        {/* Loading screen with smooth fade-in animation */}
        <div className={`text-center transition-opacity duration-500 ${showLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#DAA520]/20 border-t-[#DAA520] mx-auto"></div>
            <div className="absolute inset-0 bg-[#DAA520]/10 rounded-full blur-xl animate-pulse"></div>
          </div>
          <div className="text-gray-600 font-medium text-lg">
            جاري التحقق من الصلاحيات...
          </div>
          <div className="text-gray-400 text-sm mt-2">
            يرجى الانتظار
          </div>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

