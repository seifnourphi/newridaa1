'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Package,
  CreditCard,
  Star,
  Trash2,
  Check
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'security' | 'general';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationsPage() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'promotion' | 'security'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Order Shipped',
          titleAr: 'تم شحن الطلب',
          message: 'Your order #ABD-123456 has been shipped and is on its way to you.',
          messageAr: 'تم شحن طلبك رقم ABD-123456 وهو في طريقه إليك.',
          timestamp: '2024-01-10T10:30:00Z',
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'promotion',
          title: 'Special Offer',
          titleAr: 'عرض خاص',
          message: 'Get 20% off on all djellabas this weekend!',
          messageAr: 'احصل على خصم 20% على جميع الجلابيات هذا الأسبوع!',
          timestamp: '2024-01-09T15:45:00Z',
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'security',
          title: 'New Login Detected',
          titleAr: 'تم اكتشاف تسجيل دخول جديد',
          message: 'We detected a new login from Chrome on Windows.',
          messageAr: 'اكتشفنا تسجيل دخول جديد من Chrome على Windows.',
          timestamp: '2024-01-08T09:15:00Z',
          read: true,
          priority: 'high'
        },
        {
          id: '4',
          type: 'order',
          title: 'Order Delivered',
          titleAr: 'تم تسليم الطلب',
          message: 'Your order #ABD-123456 has been successfully delivered.',
          messageAr: 'تم تسليم طلبك رقم ABD-123456 بنجاح.',
          timestamp: '2024-01-07T14:20:00Z',
          read: true,
          priority: 'medium'
        },
        {
          id: '5',
          type: 'general',
          title: 'Welcome to Ridaa',
          titleAr: 'مرحباً بك في رِداء - Ridaa',
          message: 'Thank you for joining us! Explore our latest collection.',
          messageAr: 'شكراً لانضمامك إلينا! اكتشف مجموعتنا الجديدة.',
          timestamp: '2024-01-06T12:00:00Z',
          read: true,
          priority: 'low'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'promotion':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'security':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'ar' ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {language === 'ar' ? 'تعيين الكل كمقروء' : 'Mark All Read'}
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors">
                <Settings className="w-4 h-4" />
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'غير مقروء' : 'Unread'}
            </button>
            <button
              onClick={() => setFilter('order')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'order'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </button>
            <button
              onClick={() => setFilter('promotion')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'promotion'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'العروض' : 'Promotions'}
            </button>
            <button
              onClick={() => setFilter('security')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'security'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'الأمان' : 'Security'}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-24 w-24 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
            </h3>
            <p className="mt-2 text-gray-600">
              {language === 'ar' 
                ? 'لا توجد إشعارات جديدة في الوقت الحالي.' 
                : 'No new notifications at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {language === 'ar' ? notification.titleAr : notification.title}
                        </h3>
                        <p className={`mt-1 text-sm ${
                          !notification.read ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {language === 'ar' ? notification.messageAr : notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title={language === 'ar' ? 'تعيين كمقروء' : 'Mark as read'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email notifications'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {language === 'ar' ? 'الإشعارات المنبثقة' : 'Push Notifications'}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'إشعارات المتصفح' : 'Browser notifications'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {language === 'ar' ? 'الإشعارات الصوتية' : 'Sound Notifications'}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'أصوات التنبيه' : 'Alert sounds'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
