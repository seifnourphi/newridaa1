'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Users,
  Image as ImageIcon,
  Star,
  Layers,
  Ticket,
  Bug,
  Mail,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const navigation = [
    {
      name: t('admin.dashboard'),
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: t('admin.products'),
      href: '/admin/products',
      icon: ShoppingBag,
    },
    {
      name: t('admin.categories'),
      href: '/admin/categories',
      icon: FolderOpen,
    },
    {
      name: t('admin.orders'),
      href: '/admin/orders',
      icon: MessageSquare,
    },
    {
      name: language === 'ar' ? 'الكوبونات' : 'Coupons',
      href: '/admin/coupons',
      icon: Ticket,
    },
    {
      name: 'إدارة المستخدمين',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'إدارة الإعلانات',
      href: '/admin/advertisements',
      icon: ImageIcon,
    },
    {
      name: language === 'ar' ? 'إدارة التعليقات' : 'Reviews Management',
      href: '/admin/reviews',
      icon: Star,
    },
    {
      name: language === 'ar' ? 'إرسال العروض' : 'Send Offers',
      href: '/admin/send-offers',
      icon: Mail,
    },
    {
      name: t('admin.sections'),
      href: '/admin/sections',
      icon: Layers,
    },
    {
      name: t('admin.analytics'),
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: t('admin.settings'),
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  useEffect(() => {
    setIsClient(true);
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsAuthChecking(true);
      
      // Add a small delay to ensure cookie is set after redirect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use absolute URL to ensure same origin
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
      
      if (response.ok) {
        const data = await response.json();
        // Admin data received - no sensitive data logged
        
        // Handle structured response format: {success: true, data: {admin: {...}}}
        if (data.success && data.data?.admin) {
          setAdmin(data.data.admin);
          setIsAuthChecking(false);
          return;
        }
        
        // Fallback for old response format: {admin: {...}}
        if (data.admin) {
          setAdmin(data.admin);
          setIsAuthChecking(false);
          return;
        }
        
        console.warn('[AdminLayout] No admin data in response');
        setIsAuthChecking(false);
        router.replace('/admin/login');
      } else {
        // Auth check failed - no sensitive data logged
        setIsAuthChecking(false);
        // Redirect to login if not authenticated
        router.replace('/admin/login');
      }
    } catch (error) {
      console.error('[AdminLayout] Auth check error:', error);
      setIsAuthChecking(false);
      // Redirect to login on error
      router.replace('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading screen while checking authentication
  // This prevents content from loading before authentication check
  if (isClient && isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#DAA520]/20 border-t-[#DAA520] mx-auto"></div>
            <div className="absolute inset-0 bg-[#DAA520]/10 rounded-full blur-xl animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">
            {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated - but only if we've finished checking
  // This prevents showing "Access Denied" during the initial check
  if (isClient && !isAuthChecking && !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {language === 'ar' ? 'غير مصرح لك بالوصول' : 'Access Denied'}
          </p>
          <p className="text-sm text-gray-400">
            {language === 'ar' ? 'جاري إعادة التوجيه...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Don't render content while checking
  if (isClient && isAuthChecking) {
    return null; // The layout.tsx will show loading screen
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              ع
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                {t('header.title')}
              </span>
              <span className="text-sm text-gray-300">
                لوحة التحكم
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          {isClient && admin && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {admin.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {admin.username}
                </p>
                <p className="text-xs text-gray-400">
                  مدير النظام
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
