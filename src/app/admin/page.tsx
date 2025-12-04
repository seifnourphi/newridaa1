'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Eye,
  MousePointer,
  Search,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Image
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalWhatsappClicks: number;
    totalSearches: number;
    conversionRate: string;
  };
  topProducts: Array<{
    id: string;
    name: string;
    nameAr: string;
    sku: string;
    views: number;
    whatsappClicks: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
    searches: number;
  }>;
}

type ProductSortOption = 'views' | 'clicks' | 'name';
type ActivitySortOption = 'newest' | 'oldest';

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [productSortBy, setProductSortBy] = useState<ProductSortOption>('views');
  const [activitySortBy, setActivitySortBy] = useState<ActivitySortOption>('newest');
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const [advertisementsStats, setAdvertisementsStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    setIsClient(true);
    fetchAnalytics();
    fetchAdvertisementsStats();
  }, [days]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // CRITICAL: Use absolute URL with same origin to ensure cookies are sent
      const apiUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}/api/analytics?days=${days}`
        : `/api/analytics?days=${days}`;
      
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
        // Handle structured response format: {success: true, data: {...}}
        const analyticsData = data.success && data.data 
          ? data.data 
          : data; // Fallback for old format
        setAnalytics(analyticsData);
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdvertisementsStats = async () => {
    try {
      const response = await fetch('/api/admin/advertisements', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        let advertisementsList = [];
        
        // Handle different response formats
        if (data.success && data.data?.advertisements) {
          advertisementsList = data.data.advertisements;
        } else if (data.data && Array.isArray(data.data)) {
          advertisementsList = data.data;
        } else if (data.advertisements && Array.isArray(data.advertisements)) {
          advertisementsList = data.advertisements;
        } else if (Array.isArray(data)) {
          advertisementsList = data;
        }
        
        const active = advertisementsList.filter((ad: any) => ad.isActive).length;
        const inactive = advertisementsList.filter((ad: any) => !ad.isActive).length;
        
        setAdvertisementsStats({
          total: advertisementsList.length,
          active,
          inactive
        });
      }
    } catch (error) {
      // Silently handle errors
      console.error('Error fetching advertisements stats:', error);
    }
  };

  const handleExport = () => {
    if (!analytics) return;
    
    // Create CSV content
    const csvRows = [];
    
    // Summary
    csvRows.push('Summary');
    csvRows.push(`Total Views,${analytics.summary.totalViews}`);
    csvRows.push(`Total WhatsApp Clicks,${analytics.summary.totalWhatsappClicks}`);
    csvRows.push(`Total Searches,${analytics.summary.totalSearches}`);
    csvRows.push(`Conversion Rate,${analytics.summary.conversionRate}%`);
    csvRows.push('');
    
    // Top Products
    csvRows.push('Top Products');
    csvRows.push('Name,SKU,Views,WhatsApp Clicks');
    analytics.topProducts.forEach(product => {
      csvRows.push(`${product.name},${product.sku},${product.views},${product.whatsappClicks}`);
    });
    csvRows.push('');
    
    // Daily Stats
    csvRows.push('Daily Stats');
    csvRows.push('Date,Views,Clicks,Searches');
    analytics.dailyStats.forEach(stat => {
      csvRows.push(`${stat.date},${stat.views},${stat.clicks},${stat.searches}`);
    });
    
    // Create and download file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${days}-days-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build mini series for sparklines
  const buildSeries = (key: 'views'|'clicks'|'searches') => {
    if (!analytics || !analytics.dailyStats) return [];
    const series = analytics.dailyStats || [];
    return series.map(d => d[key] || 0);
  };

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const w = 100, h = 30;
    if (!data || data.length === 0) return <svg width={w} height={h} />;
    const max = Math.max(...data, 1);
    const step = w / Math.max(data.length - 1, 1);
    const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 6) - 3}`).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  const statsCards = useMemo(() => {
    const viewsSeries = analytics ? buildSeries('views') : [];
    const clicksSeries = analytics ? buildSeries('clicks') : [];
    const searchesSeries = analytics ? buildSeries('searches') : [];

    return [
      {
        title: 'إجمالي المشاهدات',
        value: analytics?.summary?.totalViews || 0,
        icon: Eye,
        color: 'bg-blue-500',
        change: '+12%',
        spark: viewsSeries,
        sparkColor: '#3b82f6'
      },
      {
        title: 'نقرات واتساب',
        value: analytics?.summary?.totalWhatsappClicks || 0,
        icon: MessageSquare,
        color: 'bg-green-500',
        change: '+8%',
        spark: clicksSeries,
        sparkColor: '#22c55e'
      },
      {
        title: 'عمليات البحث',
        value: analytics?.summary?.totalSearches || 0,
        icon: Search,
        color: 'bg-purple-500',
        change: '+15%',
        spark: searchesSeries,
        sparkColor: '#a855f7'
      },
      {
        title: 'معدل التحويل',
        value: `${analytics?.summary?.conversionRate || 0}%`,
        icon: TrendingUp,
        color: 'bg-orange-500',
        change: '+3%',
      },
      {
        title: 'إجمالي المستخدمين',
        value: '4',
        icon: Users,
        color: 'bg-indigo-500',
        change: '+2',
        link: '/admin/users',
      },
      {
        title: language === 'ar' ? 'إعلانات السلايد' : 'Slide Advertisements',
        value: advertisementsStats.total,
        icon: Image,
        color: 'bg-pink-500',
        change: `${advertisementsStats.active} ${language === 'ar' ? 'نشط' : 'active'}`,
        link: '/admin/advertisements',
      },
    ];
  }, [analytics, advertisementsStats, language]);

  if (!isClient) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600">
              مرحباً بك في لوحة تحكم رِداء - Ridaa
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
            <nav className="mt-1 text-sm text-gray-500">
              <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                <li>
                  <a href="/admin" className="hover:text-gray-700">{language==='ar' ? 'الرئيسية' : 'Home'}</a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-700 font-medium">{t('admin.dashboard')}</li>
              </ol>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="analytics-days"
              name="analytics-days"
              value={days}
              onChange={(e)=> setDays(e.target.value as any)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="7">{language==='ar' ? '7 أيام' : '7 Days'}</option>
              <option value="30">{language==='ar' ? '30 يوماً' : '30 Days'}</option>
              <option value="90">{language==='ar' ? '90 يوماً' : '90 Days'}</option>
            </select>
            <button 
              onClick={fetchAnalytics} 
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
              {language==='ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button 
              onClick={handleExport}
              disabled={!analytics || isLoading}
              className="inline-flex items-center px-3 py-2 rounded-md bg-[#DAA520] text-white hover:bg-[#c2931b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 me-2" />
              {language==='ar' ? 'تصدير' : 'Export'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsCards.map((stat, index) => {
            const CardContent = (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <div className="text-2xl font-bold text-gray-900">
                      {isLoading ? (
                        <div className="w-16 h-8 bg-gray-200 animate-pulse rounded" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {stat.change} من الشهر الماضي
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {'spark' in stat && (stat as any).spark && (
                  <div className="mt-3">
                    <Sparkline data={(stat as any).spark} color={(stat as any).sparkColor} />
                  </div>
                )}
              </div>
            );

            return stat.link ? (
              <a key={index} href={stat.link}>
                {CardContent}
              </a>
            ) : (
              <div key={index}>
                {CardContent}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'المنتجات الأكثر مشاهدة' : 'Top Products'}
              </h2>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  id="product-sort"
                  name="product-sort"
                  value={productSortBy}
                  onChange={(e) => setProductSortBy(e.target.value as ProductSortOption)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="views">{language === 'ar' ? 'حسب المشاهدات' : 'By Views'}</option>
                  <option value="clicks">{language === 'ar' ? 'حسب النقرات' : 'By Clicks'}</option>
                  <option value="name">{language === 'ar' ? 'حسب الاسم' : 'By Name'}</option>
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 animate-pulse rounded" />
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-200 animate-pulse rounded mb-1" />
                      <div className="w-20 h-3 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="w-12 h-4 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  if (!analytics?.topProducts) return null;
                  
                  let sortedProducts = [...analytics.topProducts];
                  
                  switch (productSortBy) {
                    case 'views':
                      sortedProducts.sort((a, b) => b.views - a.views);
                      break;
                    case 'clicks':
                      sortedProducts.sort((a, b) => b.whatsappClicks - a.whatsappClicks);
                      break;
                    case 'name':
                      sortedProducts.sort((a, b) => {
                        const nameA = (language === 'ar' ? a.nameAr : a.name).toLowerCase();
                        const nameB = (language === 'ar' ? b.nameAr : b.name).toLowerCase();
                        return nameA.localeCompare(nameB, language === 'ar' ? 'ar' : 'en');
                      });
                      break;
                  }
                  
                  return sortedProducts.slice(0, 10).map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {language === 'ar' ? product.nameAr : product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.sku}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {product.views} {language === 'ar' ? 'مشاهدة' : 'views'}
                        </p>
                        <p className="text-xs text-green-600">
                          {product.whatsappClicks} {language === 'ar' ? 'نقرة' : 'clicks'}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h2>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  id="activity-sort"
                  name="activity-sort"
                  value={activitySortBy}
                  onChange={(e) => setActivitySortBy(e.target.value as ActivitySortOption)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">{language === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</option>
                  <option value="oldest">{language === 'ar' ? 'الأقدم أولاً' : 'Oldest First'}</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const activities = [
                  {
                    id: 1,
                    type: 'view',
                    title: language === 'ar' ? 'مشاهدة منتج جديد' : 'New Product View',
                    time: language === 'ar' ? 'منذ 5 دقائق' : '5 minutes ago',
                    timeValue: 5,
                    icon: Eye,
                    bgColor: 'bg-blue-50',
                    iconBg: 'bg-blue-500',
                  },
                  {
                    id: 2,
                    type: 'order',
                    title: language === 'ar' ? 'طلب جديد عبر واتساب' : 'New WhatsApp Order',
                    time: language === 'ar' ? 'منذ 15 دقيقة' : '15 minutes ago',
                    timeValue: 15,
                    icon: MessageSquare,
                    bgColor: 'bg-green-50',
                    iconBg: 'bg-green-500',
                  },
                  {
                    id: 3,
                    type: 'search',
                    title: language === 'ar' ? 'بحث عن "جلابية"' : 'Search for "Djellaba"',
                    time: language === 'ar' ? 'منذ 30 دقيقة' : '30 minutes ago',
                    timeValue: 30,
                    icon: Search,
                    bgColor: 'bg-purple-50',
                    iconBg: 'bg-purple-500',
                  },
                  {
                    id: 4,
                    type: 'add',
                    title: language === 'ar' ? 'إضافة منتج جديد' : 'New Product Added',
                    time: language === 'ar' ? 'منذ ساعة' : '1 hour ago',
                    timeValue: 60,
                    icon: Package,
                    bgColor: 'bg-orange-50',
                    iconBg: 'bg-orange-500',
                  },
                ];

                const sortedActivities = activitySortBy === 'newest'
                  ? [...activities].sort((a, b) => a.timeValue - b.timeValue)
                  : [...activities].sort((a, b) => b.timeValue - a.timeValue);

                return sortedActivities.map((activity) => (
                  <div key={activity.id} className={`flex items-center gap-3 p-3 ${activity.bgColor} rounded-lg transition-all hover:shadow-sm`}>
                    <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                      <activity.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/products/add')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-right"
            >
              <ShoppingBag className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">{language === 'ar' ? 'إضافة منتج' : 'Add Product'}</h3>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'أضف منتج جديد للمتجر' : 'Add a new product to the store'}</p>
            </button>

            <button 
              onClick={() => router.push('/admin/orders')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-right"
            >
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">{language === 'ar' ? 'عرض الطلبات' : 'View Orders'}</h3>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'راجع الطلبات الجديدة' : 'Review new orders'}</p>
            </button>

            <button 
              onClick={() => router.push('/admin/analytics')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-right"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">{language === 'ar' ? 'الإحصائيات' : 'Analytics'}</h3>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'عرض تقارير مفصلة' : 'View detailed reports'}</p>
            </button>

            <button 
              onClick={() => router.push('/admin/advertisements')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-right"
            >
              <MessageSquare className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">{language === 'ar' ? 'إدارة الشرائح' : 'Manage Slides'}</h3>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'تحديث شرائح الصفحة الرئيسية' : 'Update homepage slides'}</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
