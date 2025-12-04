'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { escapeHtml } from '@/lib/client-validation';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  X,
  Copy,
  Check
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    nameAr: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  createdAt: string;
  trackingNumber?: string;
  orderReference?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod?: string;
  shippingPaymentMethod?: string;
  shippingPrice?: number;
  couponCode?: string | null;
  couponDiscount?: number;
}

export default function OrdersPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [orderForInvoice, setOrderForInvoice] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/orders');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/account/orders', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const ordersArray = data.orders || data.data?.orders || [];
        
        // Remove duplicate orders based on ID or orderNumber
        const uniqueOrders = ordersArray.filter((order: Order, index: number, self: Order[]) => {
          const orderId = order.id || order.orderNumber;
          return index === self.findIndex((o: Order) => (o.id || o.orderNumber) === orderId);
        });
        
        setOrders(uniqueOrders);
      } else if (response.status === 401) {
        // Redirect to login if unauthorized
        console.error('Unauthorized - redirecting to login');
        router.push('/auth/login?redirect=/account/orders');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error fetching orders:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
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
    return language === 'ar' 
      ? `ج.م ${Number(price).toLocaleString('en-US')}`
      : `EGP ${Number(price).toLocaleString('en-US')}`;
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        text: language === 'ar' ? 'تم إنشاء الطلب' : 'Order Created',
        color: 'text-yellow-600 bg-yellow-100',
        icon: Clock
      },
      processing: {
        text: language === 'ar' ? 'جاري التجهيز' : 'In Preparation',
        color: 'text-blue-600 bg-blue-100',
        icon: Package
      },
      'shipping_paid': {
        text: language === 'ar' ? 'مدفوع الشحن' : 'Shipping Paid',
        color: 'text-indigo-600 bg-indigo-100',
        icon: CreditCard
      },
      confirmed: {
        text: language === 'ar' ? 'جاري التجهيز' : 'In Preparation',
        color: 'text-blue-600 bg-blue-100',
        icon: CheckCircle
      },
      'awaiting_delivery': {
        text: language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery',
        color: 'text-orange-600 bg-orange-100',
        icon: Truck
      },
      shipped: {
        text: language === 'ar' ? 'تم الشحن' : 'Shipped',
        color: 'text-purple-600 bg-purple-100',
        icon: Truck
      },
      out_for_delivery: {
        text: language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery',
        color: 'text-orange-600 bg-orange-100',
        icon: Truck
      },
      delivered: {
        text: language === 'ar' ? 'تم التوصيل' : 'Delivered',
        color: 'text-green-600 bg-green-100',
        icon: CheckCircle
      },
      cancelled: {
        text: language === 'ar' ? 'ملغي' : 'Cancelled',
        color: 'text-red-600 bg-red-100',
        icon: XCircle
      }
    };
    return statusMap[status.toLowerCase() as keyof typeof statusMap] || statusMap.pending;
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleTrackOrder = (order: Order) => {
    // Navigate to track order page with order number or tracking number
    const params = new URLSearchParams();
    if (order.trackingNumber) {
      params.set('tracking', order.trackingNumber);
    }
    if (order.orderReference || order.orderNumber) {
      params.set('order', order.orderReference || order.orderNumber);
    }
    router.push(`/account/track-order?${params.toString()}`);
  };

  const copyOrderNumber = async (orderNumber: string, orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopiedOrderId(orderId);
      setTimeout(() => {
        setCopiedOrderId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = orderNumber;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedOrderId(orderId);
        setTimeout(() => {
          setCopiedOrderId(null);
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    setOrderForInvoice(order);
    setShowLanguageModal(true);
  };

  const downloadInvoice = async (invoiceLanguage: 'ar' | 'en') => {
    if (!orderForInvoice) return;

    try {
      // Try to get token from localStorage or cookies
      let token = localStorage.getItem('token');
      if (!token) {
        // Try to get from cookies
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }

      setShowLanguageModal(false);

      // Fetch invoice PDF with authorization and language
      const response = await fetch(`/api/account/orders/${orderForInvoice.id}/invoice?lang=${invoiceLanguage}&format=pdf`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
          window.location.href = '/auth/login?redirect=/account/orders';
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(language === 'ar' 
          ? `فشل تحميل الفاتورة: ${errorData.error || 'خطأ غير معروف'}` 
          : `Failed to download invoice: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Get PDF content
      const pdfBlob = await response.blob();
      
      // Create blob URL and download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderForInvoice.orderNumber}-${invoiceLanguage}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء تحميل الفاتورة' : 'An error occurred while downloading invoice');
    }
  };

  // Show loading while checking authentication or fetching orders
  if (authLoading || isLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'طلباتي' : 'My Orders'}
            </h1>
            <div className="text-sm text-gray-500">
              {language === 'ar' ? `${orders.length} طلب` : `${orders.length} orders`}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'في الانتظار' : 'Pending'}
            </button>
            <button
              onClick={() => setSelectedStatus('processing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'processing'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'قيد المعالجة' : 'Processing'}
            </button>
            <button
              onClick={() => setSelectedStatus('shipped')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'shipped'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'تم الشحن' : 'Shipped'}
            </button>
            <button
              onClick={() => setSelectedStatus('shipping_paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'shipping_paid'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'مدفوع الشحن' : 'Shipping Paid'}
            </button>
            <button
              onClick={() => setSelectedStatus('awaiting_delivery')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'awaiting_delivery'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'في انتظار التوصيل' : 'Awaiting Delivery'}
            </button>
            <button
              onClick={() => setSelectedStatus('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'delivered'
                  ? 'bg-[#DAA520] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'تم التسليم' : 'Delivered'}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
            </h3>
            <p className="mt-2 text-gray-600">
              {language === 'ar' 
                ? 'لم تقم بأي طلبات بعد. ابدأ التسوق الآن!' 
                : 'You haven\'t placed any orders yet. Start shopping now!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, orderIndex) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              // Use a unique key combining order ID and orderNumber to avoid duplicates
              const uniqueOrderKey = order.id || order.orderNumber || `order-${orderIndex}`;

              return (
                <div key={uniqueOrderKey} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'ar' ? 'طلب رقم' : 'Order'} #{order.orderNumber}
                        </h3>
                        <button
                          onClick={() => copyOrderNumber(order.orderNumber, order.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group relative"
                          title={language === 'ar' ? 'نسخ رقم الطلب' : 'Copy order number'}
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.text}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#DAA520]">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {language === 'ar' ? `${order.items.length} منتج` : `${order.items.length} items`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {order.items.map((item, itemIndex) => {
                      // Use a unique key combining order ID, item ID, and index to avoid duplicates
                      // Always include index to ensure uniqueness even if item.id is duplicated across orders
                      const uniqueItemKey = `${uniqueOrderKey}-item-${itemIndex}-${item.id || item.name || 'item'}`;
                      
                      return (
                      <div key={uniqueItemKey} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={language === 'ar' ? item.nameAr : item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {language === 'ar' ? item.nameAr : item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </button>
                    {(order.trackingNumber || order.orderReference || order.orderNumber) && (
                      <button 
                        onClick={() => handleTrackOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#DAA520] text-[#DAA520] rounded-lg hover:bg-[#DAA520] hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {language === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                    {React.createElement(getStatusInfo(selectedOrder.status).icon, { className: 'w-4 h-4' })}
                    {getStatusInfo(selectedOrder.status).text}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {language === 'ar' ? 'إجمالي الطلب' : 'Order Total'}
                  </h3>
                  <p className="text-xl font-bold text-[#DAA520]">{formatPrice(selectedOrder.total)}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customerName && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'ar' ? 'الاسم' : 'Name'}
                      </h4>
                      <p className="text-gray-900">{escapeHtml(selectedOrder.customerName)}</p>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'الهاتف' : 'Phone'}
                        </h4>
                        <p className="text-gray-900">{escapeHtml(selectedOrder.customerPhone)}</p>
                      </div>
                    )}
                    {selectedOrder.customerAddress && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'العنوان' : 'Address'}
                        </h4>
                        <p className="text-gray-900 break-words overflow-wrap-anywhere">{escapeHtml(selectedOrder.customerAddress)}</p>
                      </div>
                    )}
                    {selectedOrder.paymentMethod && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                        </h4>
                        <p className="text-gray-900 font-semibold">
                          {(() => {
                            const method = (selectedOrder.paymentMethod || '').toLowerCase();
                            
                            // For COD, show with shipping payment method if available
                            if (method === 'cod' || method === 'cash_on_delivery') {
                              const shippingMethod = (selectedOrder.shippingPaymentMethod || '').toLowerCase();
                              if (shippingMethod === 'instapay') {
                                return language === 'ar' ? 'الدفع عند الاستلام (إنستا باي)' : 'Cash on Delivery (InstaPay)';
                              } else if (shippingMethod === 'vodafone') {
                                return language === 'ar' ? 'الدفع عند الاستلام (فودافون كاش)' : 'Cash on Delivery (Vodafone Cash)';
                              }
                              return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery';
                            } else if (method === 'instapay') {
                              return language === 'ar' ? 'إنستا باي' : 'InstaPay';
                            } else if (method === 'vodafone') {
                              return language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash';
                            }
                            return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery';
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'المنتجات' : 'Products'}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, itemIndex) => {
                    // Use a unique key combining order ID, item ID, and index to avoid duplicates
                    // Always include index to ensure uniqueness even if item.id is duplicated
                    const orderKey = selectedOrder.id || selectedOrder.orderNumber || 'order';
                    const uniqueItemKey = `${orderKey}-detail-item-${itemIndex}-${item.id || item.name || 'item'}`;
                    
                    return (
                    <div key={uniqueItemKey} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={language === 'ar' ? item.nameAr : item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {language === 'ar' ? item.nameAr : item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Info */}
              {selectedOrder.shippingPrice !== undefined && selectedOrder.shippingPrice >= 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {language === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}
                      </span>
                      <span className="text-lg font-bold text-[#DAA520]">
                        {formatPrice(selectedOrder.shippingPrice || 0)}
                      </span>
                    </div>
                    {selectedOrder.shippingPrice === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {language === 'ar' ? 'شحن مجاني' : 'Free Shipping'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Coupon Info */}
              {selectedOrder.couponCode && (selectedOrder.couponDiscount || 0) > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'كوبون الخصم' : 'Discount Coupon'}
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        {selectedOrder.couponCode}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        - {formatPrice(selectedOrder.couponDiscount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                <div className="space-y-2">
                  {/* Calculate subtotal and discount */}
                  {(() => {
                    const shipping = selectedOrder.shippingPrice || 0;
                    let discount = selectedOrder.couponDiscount || 0;
                    
                    // If coupon code exists but discount is 0 or missing, try to calculate it
                    if (selectedOrder.couponCode && discount === 0) {
                      // Calculate items total
                      const itemsTotal = selectedOrder.items?.reduce((sum: number, item: any) => {
                        return sum + ((item.price || 0) * (item.quantity || 0));
                      }, 0) || 0;
                      
                      // Calculate discount from: itemsTotal + shipping - total
                      const calculatedDiscount = itemsTotal + shipping - selectedOrder.total;
                      if (calculatedDiscount > 0) {
                        discount = calculatedDiscount;
                      }
                    }
                    
                    // Calculate subtotal: total - shipping + discount (to show original subtotal before discount)
                    const subtotal = selectedOrder.total - shipping + discount;
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                        {selectedOrder.couponCode && discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>
                              {language === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'} ({selectedOrder.couponCode})
                            </span>
                            <span className="font-semibold">
                              - {formatPrice(discount)}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {selectedOrder.shippingPrice !== undefined && selectedOrder.shippingPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'ar' ? 'الشحن' : 'Shipping'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(selectedOrder.shippingPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">
                      {language === 'ar' ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="text-xl font-bold text-[#DAA520]">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Info */}
              {selectedOrder.paymentMethod && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const method = (selectedOrder.paymentMethod || '').toLowerCase();
                      const shippingMethod = (selectedOrder.shippingPaymentMethod || '').toLowerCase();
                      
                      // If COD and shipping payment method is specified, show detailed breakdown
                      if ((method === 'cod' || method === 'cash_on_delivery') && shippingMethod) {
                        return (
                          <>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-green-800 mb-2">
                                    {language === 'ar' ? 'دفع المنتجات:' : 'Product Payment:'}
                                  </p>
                                  <p className="text-lg font-bold text-green-900">
                                    {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                                  </p>
                                  <p className="text-sm text-green-700 mt-1">
                                    {language === 'ar' 
                                      ? `سيتم دفع ${formatPrice(selectedOrder.total - (selectedOrder.shippingPrice || 0))} نقداً عند الاستلام`
                                      : `${formatPrice(selectedOrder.total - (selectedOrder.shippingPrice || 0))} will be paid in cash upon delivery`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-800 mb-2">
                                    {language === 'ar' ? 'دفع مصاريف الشحن:' : 'Shipping Payment:'}
                                  </p>
                                  <p className="text-lg font-bold text-blue-900">
                                    {shippingMethod === 'instapay' 
                                      ? (language === 'ar' ? 'إنستا باي' : 'InstaPay')
                                      : (language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash')}
                                  </p>
                                  <p className="text-sm text-blue-700 mt-1">
                                    {language === 'ar' 
                                      ? `تم/سيتم دفع مصاريف الشحن مسبقاً`
                                      : `Shipping fees were/will be paid in advance`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      } else if (method === 'cod' || method === 'cash_on_delivery') {
                        return (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-lg font-bold text-green-900">
                                  {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                  {language === 'ar' 
                                    ? 'سيتم دفع المبلغ كاملاً نقداً عند الاستلام'
                                    : 'Full amount will be paid in cash upon delivery'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (method === 'instapay') {
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-lg font-bold text-blue-900">
                                  {language === 'ar' ? 'إنستا باي' : 'InstaPay'}
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                  {language === 'ar' 
                                    ? 'تم الدفع الكامل عبر إنستا باي'
                                    : 'Full payment via InstaPay'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (method === 'vodafone') {
                        return (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-lg font-bold text-purple-900">
                                  {language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}
                                </p>
                                <p className="text-sm text-purple-700 mt-1">
                                  {language === 'ar' 
                                    ? 'تم الدفع الكامل عبر فودافون كاش'
                                    : 'Full payment via Vodafone Cash'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      // Default to Cash on Delivery if method is unknown
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-lg font-bold text-green-900">
                                {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLanguageModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'اختر لغة الفاتورة' : 'Choose Invoice Language'}
              </h2>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                {language === 'ar' 
                  ? 'اختر اللغة التي تريد تحميل الفاتورة بها:' 
                  : 'Choose the language you want to download the invoice in:'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => downloadInvoice('ar')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-[#DAA520] text-[#DAA520] rounded-lg hover:bg-[#DAA520] hover:text-white transition-all duration-200 font-semibold"
                >
                  <span>العربية</span>
                </button>
                
                <button
                  onClick={() => downloadInvoice('en')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-[#DAA520] text-[#DAA520] rounded-lg hover:bg-[#DAA520] hover:text-white transition-all duration-200 font-semibold"
                >
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
