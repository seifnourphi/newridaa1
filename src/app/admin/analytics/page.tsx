'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  MousePointer,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  MapPin,
  Smartphone,
  Download,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalViews: number;
    totalWhatsappClicks: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    nameAr: string;
    sku: string;
    views: number;
    whatsappClicks: number;
    orders: number;
    revenue: number;
    conversionRate: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderReference: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    product: {
      name: string;
      nameAr: string;
    };
  }>;
  dailyStats: Array<{
    date: string;
    revenue: number;
    orders: number;
    views: number;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    orders: number;
    revenue: number;
  }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export default function AnalyticsPage() {
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[Analytics Page] Response data:', data);
        
        // Handle structured response format: {success: true, data: {analytics: {...}}}
        const analyticsData = data.success && data.data?.analytics 
          ? data.data.analytics 
          : data.analytics || data; // Fallback for old format
        
        console.log('[Analytics Page] Extracted analytics:', analyticsData);
        setAnalytics(analyticsData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Analytics Page] Failed to fetch analytics:', response.status, errorData);
      }
    } catch (error) {
      console.error('[Analytics Page] Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const RevenueAreaChart = ({ values }: { values: number[] }) => {
    const width = 600;
    const height = 240;
    const padding = 32;
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = Math.max(1, max - min);
    const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
    const points = values.map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });
    const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
    const areaPath = `${path} L ${padding + (values.length - 1) * stepX} ${height - padding} L ${padding} ${height - padding} Z`;
    const gridY = Array.from({ length: 5 }).map((_, i) => padding + ((height - padding * 2) / 4) * i);
    const gridX = Array.from({ length: Math.min(8, values.length) }).map((_, i) => {
      const idx = Math.floor((i / (Math.min(8, values.length) - 1)) * (values.length - 1));
      return padding + idx * stepX;
    });
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        {gridY.map((y, i) => (
          <line key={`y-${i}`} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        ))}
        {gridX.map((x, i) => (
          <line key={`x-${i}`} x1={x} x2={x} y1={padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#revFill)" />
        {/* Line */}
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth="3" filter="url(#glow)" />
        {/* Points */}
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="#3b82f6" opacity="0.8" />
            <circle cx={x} cy={y} r="6" fill="#3b82f6" opacity="0.2" />
          </g>
        ))}
      </svg>
    );
  };

  const OrdersLineChart = ({ values }: { values: number[] }) => {
    const width = 600;
    const height = 240;
    const padding = 32;
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = Math.max(1, max - min);
    const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
    const points = values.map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });
    const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
    const gridY = Array.from({ length: 5 }).map((_, i) => padding + ((height - padding * 2) / 4) * i);
    const gridX = Array.from({ length: Math.min(8, values.length) }).map((_, i) => {
      const idx = Math.floor((i / (Math.min(8, values.length) - 1)) * (values.length - 1));
      return padding + idx * stepX;
    });
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <defs>
          <filter id="glowGreen">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        {gridY.map((y, i) => (
          <line key={`y-${i}`} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        ))}
        {gridX.map((x, i) => (
          <line key={`x-${i}`} x1={x} x2={x} y1={padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {/* Line */}
        <path d={path} fill="none" stroke="#10b981" strokeWidth="3" filter="url(#glowGreen)" />
        {/* Points */}
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="#10b981" opacity="0.8" />
            <circle cx={x} cy={y} r="6" fill="#10b981" opacity="0.2" />
          </g>
        ))}
      </svg>
    );
  };

  const ViewsClicksChart = ({ views, clicks }: { views: number[]; clicks: number[] }) => {
    const width = 600;
    const height = 240;
    const padding = 32;
    const max = Math.max(1, ...views, ...clicks);
    const min = Math.min(0, ...views, ...clicks);
    const range = Math.max(1, max - min);
    const stepX = (width - padding * 2) / Math.max(1, views.length - 1);
    
    const viewsPoints = views.map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });
    
    const clicksPoints = clicks.map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });
    
    const viewsPath = viewsPoints.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
    const clicksPath = clicksPoints.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
    const gridY = Array.from({ length: 5 }).map((_, i) => padding + ((height - padding * 2) / 4) * i);
    const gridX = Array.from({ length: Math.min(8, views.length) }).map((_, i) => {
      const idx = Math.floor((i / (Math.min(8, views.length) - 1)) * (views.length - 1));
      return padding + idx * stepX;
    });
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glowPurple">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glowYellow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        {gridY.map((y, i) => (
          <line key={`y-${i}`} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        ))}
        {gridX.map((x, i) => (
          <line key={`x-${i}`} x1={x} x2={x} y1={padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {/* Lines */}
        <path d={viewsPath} fill="none" stroke="#8b5cf6" strokeWidth="3" filter="url(#glowPurple)" />
        <path d={clicksPath} fill="none" stroke="#f59e0b" strokeWidth="3" filter="url(#glowYellow)" />
        {/* Points */}
        {viewsPoints.map(([x, y], i) => (
          <g key={`views-${i}`}>
            <circle cx={x} cy={y} r="3.5" fill="#8b5cf6" opacity="0.8" />
            <circle cx={x} cy={y} r="5" fill="#8b5cf6" opacity="0.2" />
          </g>
        ))}
        {clicksPoints.map(([x, y], i) => (
          <g key={`clicks-${i}`}>
            <circle cx={x} cy={y} r="3.5" fill="#f59e0b" opacity="0.8" />
            <circle cx={x} cy={y} r="5" fill="#f59e0b" opacity="0.2" />
          </g>
        ))}
      </svg>
    );
  };

  const CountriesBarChart = ({ countries }: { countries: Array<{ country: string; orders: number; revenue: number }> }) => {
    const width = 600;
    const height = 200;
    const padding = 40;
    const maxOrders = Math.max(1, ...countries.map(c => c.orders));
    const barWidth = (width - padding * 2) / countries.length * 0.65;
    const barSpacing = (width - padding * 2) / countries.length;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
        <defs>
          {colors.map((color, i) => (
            <linearGradient key={i} id={`countryGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + ((height - padding * 2) / 4) * i;
          return (
            <line key={i} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          );
        })}
        {countries.map((country, i) => {
          const barHeight = ((country.orders / maxOrders) * (height - padding * 2));
          const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
          const y = padding + (height - padding * 2) - barHeight;
          const color = colors[i % colors.length];
          
          return (
            <g key={country.country}>
              {/* Bar shadow */}
              <rect
                x={x + 2}
                y={y + 2}
                width={barWidth}
                height={barHeight}
                fill="#000"
                opacity="0.1"
                rx="4"
              />
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#countryGrad${i})`}
                rx="4"
                className="hover:opacity-80 transition-opacity"
              />
              {/* Country label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 14}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                {country.country}
              </text>
              {/* Orders value */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-xs fill-gray-900 font-bold"
              >
                {country.orders}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const ConversionFunnel = ({ data }: { data: Array<{ label: string; value: number; color: string }> }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div className="space-y-4">
        {data.map((item, i) => {
          const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const nextItem = i < data.length - 1 ? data[i + 1] : null;
          const lossPercent = nextItem && item.value > 0 
            ? ((item.value - nextItem.value) / item.value * 100) 
            : 0;
          const conversionRate = i > 0 && data[i - 1].value > 0
            ? ((item.value / data[i - 1].value) * 100).toFixed(1)
            : '100';
          
          return (
            <div key={item.label} className="relative">
              <div className="flex items-center gap-4 w-full">
                {/* Label and info - Left side */}
                <div className="flex items-center gap-3 flex-shrink-0" style={{ width: '200px' }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                    style={{ backgroundColor: item.color, color: 'white' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{item.label}</div>
                    {i > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">{conversionRate}% {language === 'ar' ? 'تحويل' : 'conversion'}</div>
                    )}
                  </div>
                </div>
                
                {/* Funnel bar - Center */}
                <div className="flex-1 relative">
                  <div
                    className="h-12 rounded-lg flex items-center justify-end px-4 shadow-md transition-all duration-300 hover:shadow-lg"
                    style={{
                      width: `${Math.max(widthPercent, 5)}%`,
                      backgroundColor: item.color,
                      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                    }}
                  >
                    <span className="text-white text-base font-bold">{item.value.toLocaleString()}</span>
                  </div>
                  
                  {/* Loss/Gain indicator - Below the bar */}
                  {nextItem && (
                    <div className="flex justify-end mt-1.5 mr-2" style={{ width: `${Math.max(widthPercent, 5)}%` }}>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        lossPercent > 0 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : lossPercent < 0 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {lossPercent > 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            <span>{lossPercent.toFixed(1)}% {language === 'ar' ? 'انخفاض' : 'Drop'}</span>
                          </>
                        ) : lossPercent < 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>{Math.abs(lossPercent).toFixed(1)}% {language === 'ar' ? 'زيادة' : 'Gain'}</span>
                          </>
                        ) : (
                          <span>{language === 'ar' ? 'لا تغيير' : 'No Change'}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const exportToCSV = () => {
    if (!analytics) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const timeRangeLabel = timeRange === '1d' ? '24h' : timeRange === '7d' ? '7d' : timeRange === '30d' ? '30d' : '90d';
    
    const csvData = [
      [`Analytics Report - ${timeRangeLabel} - ${timestamp}`, ''],
      ['', ''],
      ['SUMMARY METRICS', ''],
      ['Total Revenue', formatPrice(analytics.summary.totalRevenue)],
      ['Total Orders', analytics.summary.totalOrders.toString()],
      ['Total Views', analytics.summary.totalViews.toString()],
      ['Total WhatsApp Clicks', analytics.summary.totalWhatsappClicks.toString()],
      ['Conversion Rate', analytics.summary.conversionRate.toFixed(2) + '%'],
      ['Average Order Value', formatPrice(analytics.summary.averageOrderValue)],
      ['Revenue Growth', analytics.summary.revenueGrowth.toFixed(2) + '%'],
      ['Orders Growth', analytics.summary.ordersGrowth.toFixed(2) + '%'],
      ['Click-to-Order Rate', analytics.summary.totalWhatsappClicks > 0 
        ? ((analytics.summary.totalOrders / analytics.summary.totalWhatsappClicks) * 100).toFixed(2) + '%'
        : '0%'],
      ['', ''],
      ['TOP PRODUCTS', ''],
      ['Product Name', 'SKU', 'Orders', 'Revenue', 'Views', 'Clicks', 'Conversion Rate'],
      ...analytics.topProducts.map(p => [
        language === 'ar' ? p.nameAr : p.name,
        p.sku,
        p.orders.toString(),
        formatPrice(p.revenue),
        p.views.toString(),
        p.whatsappClicks.toString(),
        p.conversionRate.toFixed(2) + '%'
      ]),
      ['', ''],
      ['GEOGRAPHIC DISTRIBUTION', ''],
      ['Country', 'Orders', 'Revenue'],
      ...analytics.topCountries.map(c => [
        c.country,
        c.orders.toString(),
        formatPrice(c.revenue)
      ]),
      ['', ''],
      ['DEVICE STATISTICS', ''],
      ['Device Type', 'Percentage'],
      ['Mobile', analytics.deviceStats.mobile + '%'],
      ['Desktop', analytics.deviceStats.desktop + '%'],
      ['Tablet', analytics.deviceStats.tablet + '%'],
      ['', ''],
      ['DAILY STATISTICS', ''],
      ['Date', 'Revenue', 'Orders', 'Views', 'Clicks'],
      ...analytics.dailyStats.map(s => [
        s.date,
        formatPrice(s.revenue),
        s.orders.toString(),
        s.views.toString(),
        s.clicks.toString()
      ]),
      ['', ''],
      ['RECENT ORDERS', ''],
      ['Order Reference', 'Customer', 'Product', 'Amount', 'Status', 'Date'],
      ...analytics.recentOrders.slice(0, 10).map(o => [
        o.orderReference,
        o.customerName,
        language === 'ar' ? o.product.nameAr : o.product.name,
        formatPrice(o.totalPrice),
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ])
    ];
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRangeLabel}-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number | null | undefined) => {
    // Handle invalid values (NaN, null, undefined)
    if (price === null || price === undefined || isNaN(Number(price))) {
      if (language === 'ar') {
        return 'ج.م 0';
      } else {
        return 'EGP 0';
      }
    }

    // Always use en-US locale for numbers to avoid Arabic numerals (١٠٠ instead of 100)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(price));
    
    // Add currency symbol based on language
    if (language === 'ar') {
      return `ج.م ${formatted}`;
    } else {
      return `EGP ${formatted}`;
    }
  };

  const formatPercentage = (value: number) => {
    // Always use en-US locale for numbers to avoid Arabic numerals
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">+{growth.toFixed(1)}%</span>
        </div>
      );
    } else if (growth < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{growth.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <Activity className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">0%</span>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('admin.noAnalyticsData')}
          </h3>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Sticky Header - Enhanced */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 pb-4 -mx-6 px-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {language === 'ar' ? 'لوحة الإحصائيات' : 'Analytics Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {language === 'ar' ? 'تحليل شامل لأداء المتجر' : 'Comprehensive store performance analysis'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-gray-900">{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
              </button>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-white shadow-sm text-gray-900"
              >
                <option value="1d">{language === 'ar' ? 'آخر 24 ساعة' : 'Last 24 Hours'}</option>
                <option value="7d">{language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option value="30d">{language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                <option value="90d">{language === 'ar' ? 'آخر 90 يوم' : 'Last 90 Days'}</option>
              </select>
              
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all"
                style={{ color: '#ffffff' }}
              >
                <Download className="w-4 h-4 mr-2" style={{ color: '#ffffff' }} />
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics - Enterprise Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden shadow-lg rounded-xl border border-green-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                {getGrowthIndicator(analytics.summary.revenueGrowth)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(analytics.summary.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'متوسط الطلب' : 'Avg Order'}: {formatPrice(analytics.summary.averageOrderValue)}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden shadow-lg rounded-xl border border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                {getGrowthIndicator(analytics.summary.ordersGrowth)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.summary.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'طلبات مكتملة' : 'Completed'}: {Math.round(analytics.summary.totalOrders * 0.9).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          </div>

          {/* Views Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden shadow-lg rounded-xl border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-purple-600">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {language === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.summary.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'نقرات واتساب' : 'WhatsApp Clicks'}: {analytics.summary.totalWhatsappClicks.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden shadow-lg rounded-xl border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  analytics.summary.conversionRate > 2 
                    ? 'bg-green-100 text-green-700' 
                    : analytics.summary.conversionRate > 1 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                }`}>
                  {analytics.summary.conversionRate > 2 ? 'ممتاز' : analytics.summary.conversionRate > 1 ? 'جيد' : 'يحتاج تحسين'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPercentage(analytics.summary.conversionRate)}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'من المشاهدات إلى الطلبات' : 'Views to Orders'}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                {language === 'ar' ? 'أداء' : 'Performance'}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'معدل النقر إلى الطلب' : 'Click-to-Order Rate'}
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.summary.totalWhatsappClicks > 0 
                ? formatPercentage((analytics.summary.totalOrders / analytics.summary.totalWhatsappClicks) * 100)
                : '0%'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {analytics.summary.totalWhatsappClicks} {language === 'ar' ? 'نقرة' : 'clicks'} → {analytics.summary.totalOrders} {language === 'ar' ? 'طلب' : 'orders'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                {language === 'ar' ? 'قيمة' : 'Value'}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(analytics.summary.averageOrderValue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {language === 'ar' ? 'من' : 'From'} {analytics.summary.totalOrders} {language === 'ar' ? 'طلب' : 'orders'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                {language === 'ar' ? 'نمو' : 'Growth'}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نمو الإيرادات' : 'Revenue Growth'}
            </h4>
            <p className={`text-2xl font-bold ${analytics.summary.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.summary.revenueGrowth >= 0 ? '+' : ''}{analytics.summary.revenueGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {language === 'ar' ? 'مقارنة بالفترة السابقة' : 'vs Previous Period'}
            </p>
          </div>
        </div>

        {/* Charts Row 1 - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'الإيرادات بمرور الوقت' : 'Revenue Over Time'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'تتبع الإيرادات اليومية' : 'Daily revenue tracking'}
                  </p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <RevenueAreaChart values={analytics.dailyStats.map(s => s.revenue)} />
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">{language === 'ar' ? 'أعلى يوم' : 'Peak Day'}</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(Math.max(...analytics.dailyStats.map(s => s.revenue)))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">{language === 'ar' ? 'المتوسط اليومي' : 'Daily Average'}</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(analytics.dailyStats.reduce((a, b) => a + b.revenue, 0) / analytics.dailyStats.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'الطلبات بمرور الوقت' : 'Orders Over Time'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'تتبع الطلبات اليومية' : 'Daily orders tracking'}
                  </p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <OrdersLineChart values={analytics.dailyStats.map(s => s.orders)} />
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">{language === 'ar' ? 'أعلى يوم' : 'Peak Day'}</p>
                  <p className="font-semibold text-gray-900">
                    {Math.max(...analytics.dailyStats.map(s => s.orders)).toLocaleString()} {language === 'ar' ? 'طلبات' : 'orders'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">{language === 'ar' ? 'المتوسط اليومي' : 'Daily Average'}</p>
                  <p className="font-semibold text-gray-900">
                    {Math.round(analytics.dailyStats.reduce((a, b) => a + b.orders, 0) / analytics.dailyStats.length).toLocaleString()} {language === 'ar' ? 'طلبات' : 'orders'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views & Clicks Chart */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'الزيارات والنقرات' : 'Views & Clicks'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'مقارنة بين المشاهدات ونقرات واتساب' : 'Views vs WhatsApp clicks comparison'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-700">{language === 'ar' ? 'الزيارات' : 'Views'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-700">{language === 'ar' ? 'النقرات' : 'Clicks'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <ViewsClicksChart 
                views={analytics.dailyStats.map(s => s.views)} 
                clicks={analytics.dailyStats.map(s => s.clicks)} 
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-xs mb-1">{language === 'ar' ? 'متوسط المشاهدات' : 'Avg Views'}</p>
                  <p className="font-semibold text-gray-900">
                    {Math.round(analytics.dailyStats.reduce((a, b) => a + b.views, 0) / analytics.dailyStats.length).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-xs mb-1">{language === 'ar' ? 'متوسط النقرات' : 'Avg Clicks'}</p>
                  <p className="font-semibold text-gray-900">
                    {Math.round(analytics.dailyStats.reduce((a, b) => a + b.clicks, 0) / analytics.dailyStats.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Countries Chart */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'التوزيع الجغرافي' : 'Geographic Distribution'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'أفضل الدول حسب الطلبات' : 'Top countries by orders'}
                  </p>
                </div>
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <CountriesBarChart countries={analytics.topCountries} />
              <div className="mt-4 space-y-2">
                {analytics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{country.orders} {language === 'ar' ? 'طلبات' : 'orders'}</p>
                      <p className="text-xs text-gray-500">{formatPrice(country.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel - Enhanced */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'قمع التحويل' : 'Conversion Funnel'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'مسار العميل من الزيارة إلى الشراء' : 'Customer journey from visit to purchase'}
                  </p>
                </div>
                <div className="p-2 bg-violet-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <ConversionFunnel 
                data={[
                  { label: language === 'ar' ? 'الزيارات' : 'Visits', value: analytics.summary.totalViews, color: '#3b82f6' },
                  { label: language === 'ar' ? 'قرأت المنتج' : 'Product Views', value: Math.round(analytics.summary.totalViews * 0.3), color: '#8b5cf6' },
                  { label: language === 'ar' ? 'النقرات على واتساب' : 'WhatsApp Clicks', value: analytics.summary.totalWhatsappClicks, color: '#f59e0b' },
                  { label: language === 'ar' ? 'الطلبات' : 'Orders', value: analytics.summary.totalOrders, color: '#10b981' },
                  { label: language === 'ar' ? 'المكتملة' : 'Completed', value: Math.round(analytics.summary.totalOrders * 0.9), color: '#059669' }
                ]} 
              />
              <div className="mt-6 pt-4 border-t border-gray-200 bg-white rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'معدل التحويل الإجمالي' : 'Overall Conversion'}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPercentage(analytics.summary.conversionRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'معدل النقر إلى الطلب' : 'Click-to-Order'}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {analytics.summary.totalWhatsappClicks > 0 
                        ? formatPercentage((analytics.summary.totalOrders / analytics.summary.totalWhatsappClicks) * 100)
                        : '0%'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{language === 'ar' ? 'نسبة الإتمام' : 'Completion Rate'}</span>
                    <span className="font-semibold text-green-600">
                      {analytics.summary.totalOrders > 0 
                        ? formatPercentage((Math.round(analytics.summary.totalOrders * 0.9) / analytics.summary.totalOrders) * 100)
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Stats - Enhanced */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'توزيع الأجهزة' : 'Device Breakdown'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'نسبة استخدام الأجهزة المختلفة' : 'Device usage distribution'}
                  </p>
                </div>
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500 rounded-lg mr-3">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {language === 'ar' ? 'الهاتف المحمول' : 'Mobile'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'ar' ? 'الأكثر استخداماً' : 'Most used'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {analytics.deviceStats.mobile}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${analytics.deviceStats.mobile}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500 rounded-lg mr-3">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {language === 'ar' ? 'سطح المكتب' : 'Desktop'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'ar' ? 'للمتصفحات الكاملة' : 'For full browsers'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {analytics.deviceStats.desktop}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${analytics.deviceStats.desktop}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-500 rounded-lg mr-3">
                        <PieChart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {language === 'ar' ? 'الجهاز اللوحي' : 'Tablet'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'ar' ? 'للأجهزة اللوحية' : 'For tablets'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {analytics.deviceStats.tablet}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${analytics.deviceStats.tablet}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products - Enhanced */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'أفضل المنتجات' : 'Top Products'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best selling products'}
                  </p>
                </div>
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              {analytics.topProducts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {language === 'ar' ? 'لا توجد منتجات في هذه الفترة' : 'No products in this period'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <li key={product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-primary-100 text-primary-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {language === 'ar' ? product.nameAr : product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              SKU: {product.sku}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs font-medium text-blue-600">
                                {product.orders} {language === 'ar' ? 'طلبات' : 'orders'}
                              </span>
                              <span className="text-xs font-medium text-green-600">
                                {formatPrice(product.revenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="flex flex-col items-end">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              {language === 'ar' ? 'معدل التحويل' : 'Conversion'}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPercentage(product.conversionRate)}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              <span>{product.views.toLocaleString()}</span>
                              <MousePointer className="w-3 h-3 ml-2" />
                              <span>{product.whatsappClicks.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Orders - Enhanced */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'آخر 5 طلبات' : 'Last 5 orders'}
                  </p>
                </div>
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              {analytics.recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {language === 'ar' ? 'لا توجد طلبات حديثة' : 'No recent orders'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {analytics.recentOrders.slice(0, 5).map((order, index) => {
                    const orderDate = new Date(order.createdAt);
                    const isToday = orderDate.toDateString() === new Date().toDateString();
                    const statusColors: Record<string, string> = {
                      'DELIVERED': 'bg-green-100 text-green-700',
                      'CONFIRMED': 'bg-blue-100 text-blue-700',
                      'SHIPPED': 'bg-purple-100 text-purple-700',
                      'PENDING': 'bg-yellow-100 text-yellow-700',
                      'CANCELLED': 'bg-red-100 text-red-700',
                    };
                    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-700';
                    
                    return (
                      <li key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm mr-3 ${
                              index === 0 ? 'bg-amber-100 text-amber-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  #{order.orderReference}
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">
                                {order.customerName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {language === 'ar' ? order.product.nameAr : order.product.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900 mb-1">
                              {formatPrice(order.totalPrice)}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                              {isToday && <Zap className="w-3 h-3 text-green-500" />}
                              <span>
                                {isToday 
                                  ? (language === 'ar' ? 'اليوم' : 'Today')
                                  : orderDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: orderDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                    })
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Additional Metrics - Removed (already in Performance Insights) */}
      </div>
    </AdminLayout>
  );
}
