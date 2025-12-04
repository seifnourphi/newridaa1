'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { escapeHtml } from '@/lib/client-validation';
import { 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Package,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Download,
  X,
  MessageSquare,
  Phone,
  MapPin,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

interface Order {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  quantity: number;
  totalPrice: number;
  shippingPrice?: number;
  couponCode?: string | null;
  couponDiscount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  cancellationReason?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  selectedSize?: string;
  selectedColor?: string;
  product: {
    id: string;
    name: string;
    nameAr: string;
    sku: string;
    images: Array<{ url: string; alt?: string }>;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  parentId?: string;
  parentOrderReference?: string;
  parentOrderId?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  todayOrders: number;
  todayRevenue: number;
}

interface GroupedOrder {
  baseReference: string;
  items: Order[];
}

interface ZoomImageState {
  url: string;
  scale: number;
  x: number;
  y: number;
  isPanning: boolean;
  startX: number;
  startY: number;
}

// StatusTimeline Component
const StatusTimeline = ({ status }: { status: Order['status'] }) => {
  const { language } = useLanguage();
  
  const statusSteps = [
    { key: 'PENDING', label: language === 'ar' ? 'تم إنشاء الطلب' : 'Order Created', icon: Clock },
    { key: 'CONFIRMED', label: language === 'ar' ? 'جاري التجهيز' : 'In Preparation', icon: CheckCircle },
    { key: 'SHIPPED', label: language === 'ar' ? 'تم الشحن' : 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: language === 'ar' ? 'تم التوصيل' : 'Delivered', icon: CheckCircle },
  ];

  // Normalize status to match statusSteps keys
  const normalizedStatus = (status || 'PENDING').toUpperCase().trim() as Order['status'];
  const statusIndex = statusSteps.findIndex(s => s.key === normalizedStatus);
  const currentStep = statusIndex >= 0 ? statusIndex : 0;

  return (
    <div className="mt-2 flex items-center gap-2">
      {statusSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-1 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : ''}`} />
              <span className="text-xs">{step.label}</span>
            </div>
            {index < statusSteps.length - 1 && (
              <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function OrdersPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { csrfToken } = useCSRF();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d'>('7d');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [zoomImage, setZoomImage] = useState<ZoomImageState | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [orderForInvoice, setOrderForInvoice] = useState<Order | null>(null);

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(
        language === 'ar' ? `تم نسخ ${label || 'النص'} بنجاح` : `${label || 'Text'} copied successfully`,
        'success',
        2000
      );
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast(
        language === 'ar' ? 'فشل النسخ' : 'Failed to copy',
        'error',
        2000
      );
    }
  };

  const safeParseDate = (dateString: string | undefined | null | Date): Date | null => {
    if (!dateString) return null;
    try {
      if (dateString instanceof Date) {
        return isNaN(dateString.getTime()) ? null : dateString;
      }
      if (typeof dateString === 'string') {
        if (dateString.trim() === '') return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date string:', dateString);
          return null;
        }
        return date;
      }
      const date = new Date(dateString as any);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateString);
        return null;
      }
      return date;
    } catch (error) {
      console.warn('Error parsing date:', dateString, error);
      return null;
    }
  };

  const formatDate = (dateString: string | undefined | null | Date) => {
    const date = safeParseDate(dateString);
    if (!date) {
      return language === 'ar' ? 'غير محدد' : 'N/A';
    }
    try {
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return language === 'ar' ? 'تاريخ غير صحيح' : 'Invalid Date';
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

  const getBaseReference = (ref: string) => {
    if (!ref) return '';
    const parts = ref.split('-');
    if (parts.length >= 3) {
      return parts.slice(0, -2).join('-');
    }
    return ref.replace(/-[^-]+$/, '');
  };

  const computeGroupStatus = (group: GroupedOrder): Order['status'] => {
    if (!group.items || group.items.length === 0) {
      return 'PENDING';
    }
    
    const precedence: Array<Order['status']> = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    // Check each status in order of precedence (lowest first)
    // Return the first status found (which is the lowest/earliest status in the group)
    for (const p of precedence) {
      if (group.items.some(i => {
        const itemStatus = (i.status?.toUpperCase()?.trim() || 'PENDING') as any;
        return itemStatus === p || (itemStatus === 'PROCESSING' && p === 'PENDING');
      })) {
        // Group status computed - no sensitive data logged
        return p;
      }
    }
    
    const fallbackStatus = group.items[0]?.status?.toUpperCase()?.trim() || 'PENDING';
    const normalizedStatus = ((fallbackStatus as any) === 'PROCESSING') ? 'PENDING' : fallbackStatus;
    return normalizedStatus as Order['status'];
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: t('admin.pending') },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: t('admin.confirmed') },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck, text: t('admin.shipped') },
      OUT_FOR_DELIVERY: { color: 'bg-orange-100 text-orange-800', icon: Truck, text: t('admin.outForDelivery') },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: t('admin.delivered') },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, text: t('admin.cancelled') },
    };

    const normalizedStatus = (status?.toUpperCase() || 'PENDING').trim();
    const normalized = (normalizedStatus as any) === 'PROCESSING' ? 'PENDING' : normalizedStatus;
    const config = statusConfig[normalized as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getStatusActions = (order: Order, groupStatus?: Order['status']): React.ReactElement[] => {
    // Validate order has required fields
    if (!order || !order.id) {
      return [];
    }
    
    // Use order.status as primary source, fallback to groupStatus if order.status is missing
    const orderStatus = (order?.status as string)?.toUpperCase()?.trim() || '';
    const groupStatusStr = (groupStatus as string)?.toUpperCase()?.trim() || '';
    const rawStatus = orderStatus || groupStatusStr || 'PENDING';
    const statusStr = rawStatus.includes('PROCESSING') ? 'PENDING' : rawStatus;
    
    // Normalize status
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    let currentStatus = statusStr as Order['status'];
    
    // If status is invalid or empty, default to PENDING to allow actions
    if (!currentStatus || !validStatuses.includes(currentStatus)) {
      currentStatus = 'PENDING';
    }
    
    return getStatusActionsForStatus(order, currentStatus);
  };

  const getStatusActionsForStatus = (order: Order, currentStatus: Order['status']): React.ReactElement[] => {
    const actions: React.ReactElement[] = [];
    
    switch (currentStatus) {
      case 'PENDING':
        actions.push(
          <button
            key="confirm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'CONFIRMED');
            }}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {t('admin.confirm')}
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'CANCELLED');
            }}
            className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            {t('admin.cancel')}
          </button>
        );
        break;
      case 'CONFIRMED':
        actions.push(
          <button
            key="ship"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'SHIPPED');
            }}
            className="text-purple-600 hover:text-purple-900 text-sm font-medium px-2 py-1 rounded hover:bg-purple-50 transition-colors"
          >
            {t('admin.ship')}
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'CANCELLED');
            }}
            className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            {t('admin.cancel')}
          </button>
        );
        break;
      case 'SHIPPED':
        actions.push(
          <button
            key="outForDelivery"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'OUT_FOR_DELIVERY');
            }}
            className="text-orange-600 hover:text-orange-900 text-sm font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors"
          >
            {language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery'}
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'CANCELLED');
            }}
            className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            {t('admin.cancel')}
          </button>
        );
        break;
      case 'OUT_FOR_DELIVERY':
        actions.push(
          <button
            key="deliver"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askBeforeStatusChange(order, 'DELIVERED');
            }}
            className="text-green-600 hover:text-green-900 text-sm font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
          >
            {t('admin.markDelivered')}
          </button>
        );
        break;
      case 'DELIVERED':
        // For delivered orders, show view details action
        actions.push(
          <button
            key="view"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedOrder(order);
            }}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {t('admin.viewDetails')}
          </button>
        );
        break;
      case 'CANCELLED':
        // For cancelled orders, show view details action
        actions.push(
          <button
            key="view"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedOrder(order);
            }}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {t('admin.viewDetails')}
          </button>
        );
        break;
    }
    
    return actions;
  };

  const askBeforeStatusChange = (order: Order, newStatus: Order['status']) => {
    const statusLabels: Record<Order['status'], { ar: string; en: string }> = {
      PENDING: { ar: 'تم إنشاء الطلب', en: 'Order Created' },
      CONFIRMED: { ar: 'جاري التجهيز', en: 'In Preparation' },
      SHIPPED: { ar: 'تم الشحن', en: 'Shipped' },
      OUT_FOR_DELIVERY: { ar: 'خرج للتوصيل', en: 'Out for Delivery' },
      DELIVERED: { ar: 'تم التوصيل', en: 'Delivered' },
      CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
    };

    const label = statusLabels[newStatus];
    const message = language === 'ar' 
      ? `هل أنت متأكد من تغيير حالة الطلب إلى "${label.ar}"؟ سيتم تحديث جميع المنتجات في نفس الطلب.`
      : `Are you sure you want to change the order status to "${label.en}"? All items in the same order will be updated.`;

    setConfirmState({
      isOpen: true,
      title: language === 'ar' ? 'تأكيد تغيير الحالة' : 'Confirm Status Change',
      message,
      onConfirm: () => {
        handleStatusUpdate(order.id, newStatus);
        setConfirmState({ isOpen: false, title: '', message: '' });
      },
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, cancellationReason?: string) => {
    try {
      if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        console.error('Invalid order ID:', orderId);
        showToast(
          language === 'ar' ? 'معرف الطلب غير صحيح' : 'Invalid order ID',
          'error',
          4000
        );
        return;
      }

      if (!csrfToken) {
        showToast(
          language === 'ar' ? 'يرجى تحديث الصفحة والمحاولة مرة أخرى' : 'Please refresh the page and try again',
          'error',
          3000
        );
        return;
      }

      const body: any = { status: newStatus, csrfToken };
      if (cancellationReason) {
        body.cancellationReason = cancellationReason;
      }
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      
      const responseData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.ok) {
        // Get the updated order data from the response
        const updatedOrderFromResponse = responseData?.order;
        
        // Find the order that was updated to get its reference
        const updatedOrder = updatedOrderFromResponse || orders.find(o => o.id === orderId);
        const targetBaseRef = updatedOrder ? getBaseReference(updatedOrder.orderReference) : '';
        const targetParentRef = (updatedOrder as any)?.parentOrderReference;
        
        // Update local state immediately for better UX
        setOrders(prevOrders => 
          prevOrders.map(order => {
            // Update the specific order
            if (order.id === orderId) {
              return { ...order, status: newStatus as Order['status'] };
            }
            // Update all orders with the same base reference or parent reference
            const orderBaseRef = getBaseReference(order.orderReference);
            const orderParentRef = (order as any)?.parentOrderReference;
            
            if (targetBaseRef && (orderBaseRef === targetBaseRef || orderParentRef === targetParentRef)) {
              return { ...order, status: newStatus as Order['status'] };
            }
            return order;
          })
        );
        
        // Update selectedOrder if it's the same order or in the same group
        const shouldUpdateSelectedOrder = selectedOrder && (
          selectedOrder.id === orderId || 
          (targetBaseRef && (
            getBaseReference(selectedOrder.orderReference) === targetBaseRef || 
            (selectedOrder as any)?.parentOrderReference === targetParentRef
          ))
        );
        
        if (shouldUpdateSelectedOrder) {
          setSelectedOrder(prev => {
            if (!prev) return null;
            // Update the order status and also update all related orders in the state
            const updated = { ...prev, status: newStatus as Order['status'] };
            return updated;
          });
        }
        
        // Fetch fresh data from server to ensure consistency
        const updatedOrdersList = await fetchOrders();
        
        // After fetching, update selectedOrder with fresh data if it was selected
        // This ensures modalData recalculates with the updated status
        if (shouldUpdateSelectedOrder && selectedOrder && updatedOrdersList.length > 0) {
          // Find all related orders in the same group
          const selectedBaseRef = getBaseReference(selectedOrder.orderReference);
          const selectedParentRef = (selectedOrder as any)?.parentOrderReference;
          
          // Looking for related orders - no sensitive data logged
          
          const relatedOrdersInGroup = updatedOrdersList.filter(o => {
            const orderBaseRef = getBaseReference(o.orderReference);
            const orderParentRef = (o as any)?.parentOrderReference;
            const matches = orderBaseRef === selectedBaseRef || orderParentRef === selectedParentRef;
            return matches;
          });
          
          // Related orders found - no sensitive data logged
          
          // Update all related orders in state first
          setOrders(currentOrders => 
            currentOrders.map(order => {
              const updated = relatedOrdersInGroup.find(o => o.id === order.id);
              if (updated) {
                // Updating order in state - no sensitive data logged
                return updated;
              }
              return order;
            })
          );
          
          // Then update selectedOrder with the fresh data from server
          const updatedSelectedOrder = relatedOrdersInGroup.find(o => o.id === selectedOrder.id);
          if (updatedSelectedOrder) {
            // Updating selectedOrder status - no sensitive data logged
            setSelectedOrder(updatedSelectedOrder);
          } else {
            // Selected order not found in updated orders list - no sensitive data logged
          }
        }
        
        fetchStats();
        showToast(
          language === 'ar' ? 'تم تحديث حالة الطلب بنجاح (تم تحديث جميع المنتجات في الطلب)' : 'Order status updated successfully (all items in order updated)',
          'success',
          3000
        );
      } else {
        const errorData = responseData;
        console.error('Error updating order status:', response.status, errorData);
        showToast(
          language === 'ar' 
            ? `فشل تحديث حالة الطلب: ${errorData.error || 'خطأ غير معروف'}` 
            : `Failed to update order status: ${errorData.error || 'Unknown error'}`,
          'error',
          4000
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء تحديث حالة الطلب' : 'Error updating order status',
        'error',
        4000
      );
    }
  };

  const handleWhatsAppContact = (order: Order) => {
    const phone = order.customerPhone.replace(/[^\d]/g, '');
    const message = language === 'ar' 
      ? `مرحباً، نتواصل معك بخصوص طلبك ${order.orderReference}`
      : `Hello, we're contacting you about your order ${order.orderReference}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadInvoice = (order: Order) => {
    setOrderForInvoice(order);
    setShowLanguageModal(true);
  };

  const downloadInvoice = async (invoiceLanguage: 'ar' | 'en') => {
    if (!orderForInvoice) return;

    try {
      setShowLanguageModal(false);

      // Fetch invoice PDF - API will check for admin token from cookies automatically
      const response = await fetch(`/api/account/orders/${orderForInvoice.id}/invoice?lang=${invoiceLanguage}&format=pdf`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast(
            language === 'ar' ? 'غير مصرح لك بتحميل هذه الفاتورة' : 'You are not authorized to download this invoice',
            'error'
          );
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        showToast(
          language === 'ar' 
            ? `فشل تحميل الفاتورة: ${errorData.error || 'خطأ غير معروف'}` 
            : `Failed to download invoice: ${errorData.error || 'Unknown error'}`,
          'error'
        );
        return;
      }

      // Get response content
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/pdf')) {
        // Handle PDF response
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderForInvoice.orderReference}-${invoiceLanguage}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (contentType.includes('text/html')) {
        // Handle HTML response - convert to PDF using browser print
        const htmlContent = await response.text();
        
        // Create a new window with the HTML content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Wait for content to load, then trigger print
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              // Optionally close after print dialog
              // printWindow.close();
            }, 250);
          };
        } else {
          // Fallback: download as HTML
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${orderForInvoice.orderReference}-${invoiceLanguage}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // Fallback: try as blob
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderForInvoice.orderReference}-${invoiceLanguage}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showToast(
        language === 'ar' ? 'تم تحميل الفاتورة بنجاح' : 'Invoice downloaded successfully',
        'success'
      );
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء تحميل الفاتورة' : 'An error occurred while downloading invoice',
        'error'
      );
    } finally {
      setOrderForInvoice(null);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    const orderRef = order.orderReference || order.id;
    setConfirmState({
      isOpen: true,
      title: language === 'ar' ? 'تأكيد حذف الطلب' : 'Confirm Order Deletion',
      message: language === 'ar' 
        ? `هل أنت متأكد من حذف الطلب "${orderRef}"؟\n\nهذه العملية لا يمكن التراجع عنها.`
        : `Are you sure you want to delete order "${orderRef}"?\n\nThis action cannot be undone.`,
      onConfirm: async () => {
        try {
          if (!csrfToken) {
            showToast(
              language === 'ar' 
                ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
                : 'Your session has expired. Please sign in again.',
              'error'
            );
            return;
          }

          const response = await fetch(`/api/admin/orders/${order.id}?csrfToken=${encodeURIComponent(csrfToken)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
            credentials: 'include',
          });

          if (response.ok) {
            // Remove order from local state
            setOrders(orders.filter(o => o.id !== order.id));
            if (selectedOrder?.id === order.id) {
              setSelectedOrder(null);
            }
            showToast(
              language === 'ar' ? 'تم حذف الطلب بنجاح' : 'Order deleted successfully',
              'success'
            );
            fetchOrders();
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            showToast(
              language === 'ar' 
                ? `فشل حذف الطلب: ${errorData.error || 'خطأ غير معروف'}` 
                : `Failed to delete order: ${errorData.error || 'Unknown error'}`,
              'error'
            );
          }
        } catch (error) {
          console.error('Error deleting order:', error);
          showToast(
            language === 'ar' ? 'حدث خطأ أثناء حذف الطلب' : 'An error occurred while deleting order',
            'error'
          );
        }
        setConfirmState({ isOpen: false, title: '', message: '' });
      },
    });
  };

  const handleBulkDeleteFiltered = () => {
    const filteredCount = filteredOrders.length;
    if (filteredCount === 0) {
      showToast(
        language === 'ar' ? 'لا توجد طلبات للحذف' : 'No orders to delete',
        'info'
      );
      return;
    }

    // Get all order IDs from filtered orders
    const orderIds = filteredOrders.map(order => order.id).filter(Boolean);
    
    if (orderIds.length === 0) {
      showToast(
        language === 'ar' ? 'لا توجد طلبات صالحة للحذف' : 'No valid orders to delete',
        'info'
      );
      return;
    }

    setConfirmState({
      isOpen: true,
      title: language === 'ar' ? 'تأكيد حذف الطلبات' : 'Confirm Bulk Deletion',
      message: language === 'ar'
        ? `هل أنت متأكد من حذف ${filteredCount} طلب؟\n\n⚠️ تحذير: هذه العملية لا يمكن التراجع عنها.\n\nسيتم حذف جميع الطلبات المصفاة نهائياً من النظام.`
        : `Are you sure you want to delete ${filteredCount} order(s)?\n\n⚠️ Warning: This action cannot be undone.\n\nAll filtered orders will be permanently deleted from the system.`,
      onConfirm: async () => {
        try {
          if (!csrfToken) {
            showToast(
              language === 'ar' 
                ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
                : 'Your session has expired. Please sign in again.',
              'error'
            );
            setConfirmState({ isOpen: false, title: '', message: '' });
            return;
          }

          const response = await fetch('/api/admin/orders/bulk-delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
              orderIds,
              csrfToken
            }),
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            showToast(
              language === 'ar' 
                ? `تم حذف ${data.deletedCount || orderIds.length} طلب بنجاح` 
                : `Successfully deleted ${data.deletedCount || orderIds.length} order(s)`,
              'success'
            );
            fetchOrders();
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            showToast(
              language === 'ar' 
                ? `فشل حذف الطلبات: ${errorData.error || 'خطأ غير معروف'}` 
                : `Failed to delete orders: ${errorData.error || 'Unknown error'}`,
              'error'
            );
          }
        } catch (error) {
          console.error('Error bulk deleting orders:', error);
          showToast(
            language === 'ar' ? 'حدث خطأ أثناء حذف الطلبات' : 'An error occurred while deleting orders',
            'error'
          );
        }
        setConfirmState({ isOpen: false, title: '', message: '' });
      },
    });
  };

  const toggleGroupExpansion = (baseReference: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(baseReference)) {
      newExpanded.delete(baseReference);
    } else {
      newExpanded.add(baseReference);
    }
    setExpandedGroups(newExpanded);
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async (): Promise<Order[]> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/orders?limit=1000&page=1', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {...}}
        const responseData = data.success && data.data 
          ? data.data 
          : data; // Fallback for old format
        
        let ordersList: Order[] = [];

        const normalizeDate = (dateValue: any): string => {
          if (!dateValue) {
            return new Date().toISOString();
          }
          if (typeof dateValue === 'string') {
            const testDate = new Date(dateValue);
            if (!isNaN(testDate.getTime())) {
              return dateValue;
            }
            return new Date().toISOString();
          }
          if (dateValue instanceof Date) {
            if (isNaN(dateValue.getTime())) {
              return new Date().toISOString();
            }
            return dateValue.toISOString();
          }
          try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              return new Date().toISOString();
            }
            return date.toISOString();
          } catch (error) {
            return new Date().toISOString();
          }
        };

        if (responseData.groups) {
          ordersList = (responseData.groups as any[]).flatMap((g: any) => 
            (g.items || []).map((item: any) => {
              // Prioritize parent order status over item status
              // This ensures consistency when status is updated via API
              // The parent order status is the source of truth
              const parentStatus = (g.status || 'PENDING').toUpperCase().trim().replace('PROCESSING', 'PENDING');
              const itemStatus = (item.status || parentStatus).toUpperCase().trim().replace('PROCESSING', 'PENDING');
              
              // Use parent status if it's more advanced than item status, or if they differ
              // This handles cases where items haven't been updated yet
              const statusPrecedence: Record<string, number> = {
                'PENDING': 0,
                'CONFIRMED': 1,
                'SHIPPED': 2,
                'OUT_FOR_DELIVERY': 3,
                'DELIVERED': 4,
                'CANCELLED': 5,
              };
              
              const parentPrecedence = statusPrecedence[parentStatus] ?? 0;
              const itemPrecedence = statusPrecedence[itemStatus] ?? 0;
              
              // Use parent status if it's more advanced, or if parent status is set and item status is PENDING
              const finalStatus = (parentPrecedence > itemPrecedence || (parentStatus !== 'PENDING' && itemStatus === 'PENDING'))
                ? parentStatus
                : itemStatus;
              
              // Use item's own orderReference if available, otherwise use parent orderReference
              // Each item should have its own unique orderReference
              const itemOrderReference = item.orderReference || g.orderReference || item.id;
              
              return {
                ...item,
                orderReference: itemOrderReference, // Ensure each item has its own orderReference
                status: finalStatus as Order['status'], // Use parent status as source of truth
                parentOrderReference: g.orderReference,
                parentOrderId: g.id,
                createdAt: normalizeDate(item.createdAt || g.createdAt),
                updatedAt: normalizeDate(item.updatedAt || g.updatedAt),
              };
            })
          );
          // Orders fetched from groups - no sensitive data logged
        } else if (responseData.orders) {
          ordersList = (responseData.orders as any[]).map((item: any) => {
            const normalizedStatus = (item.status?.toUpperCase()?.trim() || 'PENDING').replace('PROCESSING', 'PENDING') as Order['status'];
            return {
              ...item,
              status: normalizedStatus,
              createdAt: normalizeDate(item.createdAt),
              updatedAt: normalizeDate(item.updatedAt),
            };
          });
          // Legacy orders fetched - no sensitive data logged
        }

        setOrders(ordersList);
        return ordersList;
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/orders/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {stats: {...}}}
        const statsData = data.success && data.data?.stats 
          ? data.data.stats 
          : data.stats || {};
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      (order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.product?.nameAr?.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter.toUpperCase();
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const orderDate = safeParseDate(order.createdAt);
      if (!orderDate) return false;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      if (dateFilter === 'today') return orderDate >= today;
      if (dateFilter === 'yesterday') return orderDate >= yesterday && orderDate < today;
      if (dateFilter === 'week') return orderDate >= thisWeek;
      return true;
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const groupedOrders: GroupedOrder[] = (() => {
    // Group orders: each orderReference is completely separate
    // Only group items that have the same parentOrderReference AND that parentOrderReference
    // exists as an orderReference in the list (same order with multiple products)
    const groupsMap = new Map<string, Order[]>();
    
    // First, collect all orderReferences to check for parent relationships
    const orderRefsSet = new Set(filteredOrders.map(o => o.orderReference).filter(Boolean));
    
    filteredOrders.forEach((order) => {
      const parentRef = (order as any)?.parentOrderReference;
      const orderRef = order.orderReference || order.id || '';
      
      let groupKey: string;
      
      // Only group by parentOrderReference if:
      // 1. parentOrderReference exists and is different from orderReference
      // 2. parentOrderReference actually exists as an orderReference in the list
      // This ensures we only group products of the same order, not different orders
      if (parentRef && parentRef !== orderRef && orderRefsSet.has(parentRef)) {
        // This is a product item in a multi-product order
        // Group by parentOrderReference to show all products together
        groupKey = parentRef;
      } else {
        // This is a standalone order
        // Use the orderReference as the key (each order is separate)
        groupKey = orderRef || `order-${order.id}`;
      }
      
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey)!.push(order);
    });
    
    // Convert map to array of GroupedOrder
    return Array.from(groupsMap.entries()).map(([groupKey, items]) => {
      // Use the first item's orderReference as baseReference for display
      const firstItem = items[0];
      const baseReference = firstItem?.orderReference || groupKey;
      
      return {
        baseReference,
        items
      };
    }).sort((a, b) => {
      const dateA = safeParseDate(a.items[0]?.createdAt);
      const dateB = safeParseDate(b.items[0]?.createdAt);
      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;
      return timeB - timeA;
    });
  })();

  const computeGroupTotals = (group: GroupedOrder) => {
    const subTotal = group.items.reduce((s, o) => s + o.totalPrice, 0);
    const shipping = group.items.reduce((s, o) => s + (o.shippingPrice || 0), 0);
    // Use couponDiscount from first item (applied at order level, not per item)
    // Don't sum couponDiscount from each item as it's the same value for all items in the same order
    const discount = group.items[0]?.couponDiscount || 0;
    const total = subTotal + shipping - discount;
    const qty = group.items.reduce((s, o) => s + (o.quantity || 0), 0);
    return { subTotal, shipping, discount, total, qty };
  };

  // Calculate modal data using useMemo
  // Add a key based on selectedOrder.id and orders length to force recalculation
  const modalData = useMemo(() => {
    if (!selectedOrder) return null;
    
    // Get all items in the same order group
    const base = getBaseReference(selectedOrder.orderReference);
    const relatedOrders = orders.filter(o => {
      if ((o as any).parentOrderReference) {
        return (o as any).parentOrderReference === (selectedOrder as any).parentOrderReference || 
               getBaseReference(o.orderReference) === base;
      }
      return getBaseReference(o.orderReference) === base;
    });
    
    // Get order-level details from first item (they should be the same for all items in the same order)
    const firstOrder = relatedOrders[0] || selectedOrder;
    // Try paymentProofUrl first, then fallback to paymentProof
    const paymentProofValue = (firstOrder as any)['paymentProofUrl'] || (firstOrder as any)['paymentProof'];
    // Convert to relative path for Next.js rewrite to handle
    // If it's a full URL, extract the path part
    // If it starts with /uploads, use it directly (Next.js rewrite will handle it)
    let orderPaymentProof: string | null = null;
    if (paymentProofValue) {
      if (paymentProofValue.startsWith('http://localhost:5000') || paymentProofValue.startsWith('https://localhost:5000')) {
        // Extract path from localhost:5000 URL
        orderPaymentProof = paymentProofValue.replace(/^https?:\/\/localhost:5000/, '');
      } else if (paymentProofValue.startsWith('http')) {
        // Extract path from any full URL
        orderPaymentProof = paymentProofValue.replace(/^https?:\/\/[^\/]+/, '');
      } else if (paymentProofValue.startsWith('/uploads')) {
        // Already a relative path starting with /uploads
        orderPaymentProof = paymentProofValue;
      } else if (paymentProofValue.startsWith('/')) {
        // Already a relative path
        orderPaymentProof = paymentProofValue;
      } else {
        // Add leading slash if missing
        orderPaymentProof = `/${paymentProofValue}`;
      }
    }
    const orderPaymentMethod = (firstOrder as any)['paymentMethod'];
    const orderShippingPaymentMethod = (firstOrder as any)['shippingPaymentMethod'] || (relatedOrders[0] as any)?.['shippingPaymentMethod'] || null;
    const orderCouponCode = firstOrder.couponCode;
    const orderCouponDiscount = firstOrder.couponDiscount || 0;
    const orderNotes = (firstOrder as any)['notes'];
    
    // Calculate status from related orders - use the status from the first order if all have same status
    // Otherwise use computeGroupStatus
    const allSameStatus = relatedOrders.length > 0 && relatedOrders.every(o => {
      const normalizedStatus = (o.status?.toUpperCase()?.trim() || 'PENDING') as string;
      const firstStatus = (relatedOrders[0].status?.toUpperCase()?.trim() || 'PENDING') as string;
      return normalizedStatus === firstStatus || (normalizedStatus === 'PROCESSING' && firstStatus === 'PENDING');
    });
    
    const orderStatus = allSameStatus && relatedOrders.length > 0
      ? (relatedOrders[0].status?.toUpperCase()?.trim() || 'PENDING').replace('PROCESSING', 'PENDING') as Order['status']
      : computeGroupStatus({ items: relatedOrders, baseReference: base });
    
    // ModalData calculation - no sensitive data logged
    
    // Calculate totals for the entire order
    const subTotal = relatedOrders.reduce((s, o) => s + o.totalPrice, 0);
    const shipping = relatedOrders.reduce((s, o) => s + (o.shippingPrice || 0), 0);
    // Use orderCouponDiscount from firstOrder (applied at order level, not per item)
    // Don't sum couponDiscount from each item as it's the same value for all items in the same order
    const discount = orderCouponDiscount || 0;
    const total = subTotal + shipping - discount;
    const totalQty = relatedOrders.reduce((s, o) => s + (o.quantity || 0), 0);
    
    return {
      base,
      relatedOrders,
      firstOrder,
      orderPaymentProof,
      orderPaymentMethod,
      orderShippingPaymentMethod,
      orderCouponCode,
      orderCouponDiscount,
      orderNotes,
      orderStatus,
      subTotal,
      shipping,
      discount,
      total,
      totalQty,
    };
  }, [selectedOrder, orders, selectedOrder?.id, selectedOrder?.status]);

  // Force modal to update when order status changes
  // This ensures the UI reflects the latest status
  useEffect(() => {
    if (selectedOrder && modalData) {
      // Check if the status in modalData matches the actual order status
      const currentStatus = selectedOrder.status;
      const modalStatus = modalData.orderStatus;
      
      if (currentStatus !== modalStatus && (currentStatus as string) !== 'PROCESSING') {
        // Status mismatch detected, forcing recalculation - no sensitive data logged
        // Force update by creating a new selectedOrder object
        setSelectedOrder({ ...selectedOrder });
      }
    }
  }, [selectedOrder?.status, modalData?.orderStatus]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {language === 'ar' ? 'إدارة ومتابعة طلبات العملاء' : 'Manage and track customer orders'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchOrders();
                  fetchStats();
                }}
                className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4 me-2" />
                {language === 'ar' ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {t('admin.pending')}
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {t('admin.confirmed')}
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {t('admin.shipped')}
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery'}
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.outForDelivery || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {t('admin.delivered')}
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              {t('admin.cancelled')}
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="orders-search"
                    name="orders-search"
                    type="text"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder={t('admin.searchOrders')}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {filteredOrders.length > 0 && (
                  <button
                    onClick={handleBulkDeleteFiltered}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'ar' ? `حذف المصفاة (${filteredOrders.length})` : `Delete Filtered (${filteredOrders.length})`}
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'المرشحات' : 'Filters'}
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="PENDING">{t('admin.pending')}</option>
                  <option value="CONFIRMED">{t('admin.confirmed')}</option>
                  <option value="SHIPPED">{t('admin.shipped')}</option>
                  <option value="OUT_FOR_DELIVERY">{language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery'}</option>
                  <option value="DELIVERED">{t('admin.delivered')}</option>
                  <option value="CANCELLED">{t('admin.cancelled')}</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">{t('admin.allDates')}</option>
                  <option value="today">{t('admin.today')}</option>
                  <option value="yesterday">{t('admin.yesterday')}</option>
                  <option value="week">{t('admin.thisWeek')}</option>
                </select>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            {groupedOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('admin.noOrders')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('admin.noOrdersDescription')}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.order')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.customer')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'المنتج' : 'Product'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.total')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedOrders.map((group) => {
                    const first = group.items[0];
                    if (!first || !first.id) {
                      // Invalid group or missing first item - no sensitive data logged
                      return null;
                    }
                    
                    // Ensure product object exists with safe defaults
                    const product = first.product || {
                      id: first.productId || '',
                      name: first.name || '',
                      nameAr: first.nameAr || '',
                      sku: '',
                      images: first.image ? [{ url: first.image }] : []
                    };
                    
                    const status = computeGroupStatus(group);
                    const totals = computeGroupTotals(group);
                    const isExpanded = expandedGroups.has(group.baseReference);
                    const hasMultipleItems = group.items.length > 1;

                    return (
                      <React.Fragment key={group.items[0]?.id || `${group.baseReference}-${group.items[0]?.orderReference || 'unknown'}`}>
                        {/* Main Group Row */}
                        <tr 
                          className={hasMultipleItems ? 'cursor-pointer hover:bg-gray-50' : ''}
                          onClick={hasMultipleItems ? () => toggleGroupExpansion(group.baseReference) : undefined}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {hasMultipleItems && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupExpansion(group.baseReference);
                                  }}
                                  className="text-gray-500 hover:text-gray-700 transition-colors"
                                  title={isExpanded 
                                    ? (language === 'ar' ? 'إخفاء المنتجات' : 'Hide products')
                                    : (language === 'ar' ? 'عرض المنتجات' : 'Show products')
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  #{group.items[0]?.orderReference || group.baseReference || group.items[0]?.id || 'N/A'}
                                </div>
                                {hasMultipleItems && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {language === 'ar' 
                                      ? `${group.items.length} منتج${isExpanded ? ' (موسع)' : ' (انقر للتوسيع)'}` 
                                      : `${group.items.length} items${isExpanded ? ' (expanded)' : ' (click to expand)'}`
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-0 max-w-xs">
                            <div className="flex items-center min-w-0">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {escapeHtml(first.customerName)}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(group.baseReference, language === 'ar' ? 'رقم الطلب' : 'Order No.');
                                    }}
                                    className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  >
                                    {language === 'ar' ? 'نسخ رقم الطلب' : 'Copy No.'}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{escapeHtml(first.customerPhone)}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(first.customerPhone, language === 'ar' ? 'الهاتف' : 'Phone');
                                    }}
                                    className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  >
                                    {language === 'ar' ? 'نسخ' : 'Copy'}
                                  </button>
                                </div>
                                {first.customerAddress && (
                                  <div className="flex items-start gap-2 text-sm text-gray-500 min-w-0">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">{escapeHtml(first.customerAddress)}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(first.customerAddress || '', language === 'ar' ? 'العنوان' : 'Address');
                                      }}
                                      className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex-shrink-0"
                                    >
                                      {language === 'ar' ? 'نسخ' : 'Copy'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {hasMultipleItems ? (
                              <div className="text-sm text-gray-500">
                                {language === 'ar' ? `${group.items.length} منتج` : `${group.items.length} items`}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      className="h-8 w-8 rounded object-cover"
                                      src={product.images[0].url}
                                      alt={product.images[0].alt || product.name}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {language === 'ar' ? (product.nameAr || product.name) : product.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {product.sku && `SKU: ${product.sku} | `}{language === 'ar' ? 'الكمية:' : 'Qty:'} {first.quantity}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(totals.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(first.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppContact(first);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title={t('admin.contactWhatsApp')}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(first);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title={t('admin.viewDetails')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {(() => {
                                const actions = getStatusActions(first, status);
                                if (actions.length === 0) {
                                  return (
                                    <span className="text-xs text-gray-400 italic">
                                      {language === 'ar' ? 'لا توجد إجراءات متاحة' : 'No actions available'}
                                    </span>
                                  );
                                }
                                return actions.map((action, index) => (
                                  <span key={index} className="inline-block">{action}</span>
                                ));
                              })() as React.ReactNode}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details Rows */}
                        {isExpanded && hasMultipleItems && group.items.map((item, itemIdx) => (
                          <tr key={`${group.baseReference}-${item.id}`} className="bg-gray-50 border-l-4 border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-700 pl-16">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {language === 'ar' ? 'منتج' : 'Item'} {itemIdx + 1}
                                </span>
                                {item.orderReference && item.orderReference !== group.items[0]?.orderReference && (
                                  <span className="text-xs text-gray-500">
                                    ({item.orderReference})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3" colSpan={1}>
                              {/* Empty - customer info is shown in main row */}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center">
                                {(() => {
                                  const itemProduct = item.product || {
                                    id: item.productId || '',
                                    name: item.name || '',
                                    nameAr: item.nameAr || '',
                                    sku: '',
                                    images: item.image ? [{ url: item.image }] : []
                                  };
                                  return (
                                    <>
                                      <div className="flex-shrink-0 h-10 w-10">
                                        {itemProduct.images && itemProduct.images.length > 0 ? (
                                          <img
                                            className="h-10 w-10 rounded object-cover border border-gray-200"
                                            src={itemProduct.images[0].url}
                                            alt={itemProduct.images[0].alt || itemProduct.name}
                                          />
                                        ) : (
                                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center border border-gray-300">
                                            <Package className="h-5 w-5 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                          {language === 'ar' ? (itemProduct.nameAr || itemProduct.name) : itemProduct.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {itemProduct.sku && `SKU: ${itemProduct.sku} | `}{language === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}
                                          {item.selectedSize && ` | ${language === 'ar' ? 'المقاس:' : 'Size:'} ${item.selectedSize}`}
                                          {item.selectedColor && ` | ${language === 'ar' ? 'اللون:' : 'Color:'} ${item.selectedColor}`}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                              {formatPrice(item.totalPrice)}
                            </td>
                            <td className="px-6 py-3" colSpan={1}>
                              {/* Empty - status is shown in main row */}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-3 text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(item);
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title={t('admin.viewDetails')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {modalData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
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
                        {language === 'ar' ? 'رقم الطلب' : 'Order Reference'}
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">#{modalData.base}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(modalData.firstOrder.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </h3>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(modalData.orderStatus)}
                      </div>
                      <StatusTimeline status={modalData.orderStatus} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {language === 'ar' ? 'إجمالي الطلب' : 'Order Total'}
                      </h3>
                      <p className="text-xl font-bold text-[#DAA520]">
                        {formatPrice(modalData.total)}
                      </p>
                      <div className="text-sm text-gray-500 mt-1">
                        {language === 'ar' ? `إجمالي العناصر: ${modalData.totalQty}` : `Total items: ${modalData.totalQty}`}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'الاسم' : 'Name'}
                        </h4>
                        <p className="text-gray-900">{escapeHtml(modalData.firstOrder.customerName)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'الهاتف' : 'Phone'}
                        </h4>
                        <p className="text-gray-900">{escapeHtml(modalData.firstOrder.customerPhone)}</p>
                      </div>
                      <div className="md:col-span-2 min-w-0">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          {language === 'ar' ? 'العنوان' : 'Address'}
                        </h4>
                        <p className="text-gray-900 break-words overflow-wrap-anywhere whitespace-pre-wrap">{escapeHtml(modalData.firstOrder.customerAddress)}</p>
                      </div>
                      {modalData.firstOrder.user && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                          </h4>
                          <p className="text-gray-900">{escapeHtml(modalData.firstOrder.user.email)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products Info */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ar' ? 'المنتجات' : 'Products'}
                    </h3>
                    <div className="space-y-3">
                      {modalData.relatedOrders.map((item) => {
                        const itemProduct = item.product || {
                          id: item.productId || '',
                          name: item.name || '',
                          nameAr: item.nameAr || '',
                          sku: '',
                          images: item.image ? [{ url: item.image }] : []
                        };
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            {itemProduct.images && itemProduct.images.length > 0 && (
                              <img
                                src={itemProduct.images[0].url}
                                alt={language === 'ar' ? (itemProduct.nameAr || itemProduct.name) : itemProduct.name}
                                className="w-20 h-20 object-cover rounded-lg cursor-zoom-in"
                                onClick={() => setZoomImage({ url: itemProduct.images[0].url, scale: 1, x: 0, y: 0, isPanning: false, startX: 0, startY: 0 })}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {language === 'ar' ? (itemProduct.nameAr || itemProduct.name) : itemProduct.name}
                              </h4>
                              {itemProduct.sku && <p className="text-sm text-gray-500">SKU: {itemProduct.sku}</p>}
                            <p className="text-sm text-gray-500">
                              {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                            </p>
                            {item.selectedSize && (
                              <p className="text-sm text-gray-500">
                                {language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}
                              </p>
                            )}
                            {item.selectedColor && (
                              <p className="text-sm text-gray-500">
                                {language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                              </p>
                            )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method & Payment Proof (Order-level, not per product) */}
                  {(modalData.orderPaymentMethod || modalData.orderPaymentProof) && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {language === 'ar' ? 'معلومات الدفع' : 'Payment Information'}
                      </h3>
                      {modalData.orderPaymentMethod && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                          </h4>
                          <p className="text-gray-900 font-bold text-lg">
                            {(() => {
                              const method = (modalData.orderPaymentMethod || '').toLowerCase();
                              const shippingMethod = (modalData.orderShippingPaymentMethod || '').toLowerCase();
                              
                              // If COD and shipping payment method is specified, show specific method
                              if ((method === 'cod' || method === 'cash_on_delivery') && shippingMethod) {
                                if (shippingMethod === 'instapay') {
                                  return language === 'ar' ? 'الدفع عند الاستلام (إنستا باي)' : 'Cash on Delivery (InstaPay)';
                                } else if (shippingMethod === 'vodafone') {
                                  return language === 'ar' ? 'الدفع عند الاستلام (فودافون كاش)' : 'Cash on Delivery (Vodafone Cash)';
                                }
                                return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery';
                              } else if (method === 'cod' || method === 'cash_on_delivery') {
                                return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery';
                              } else if (method === 'instapay') {
                                return language === 'ar' ? 'إنستا باي' : 'InstaPay';
                              } else if (method === 'vodafone' || method === 'vodafone_cash') {
                                return language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash';
                              }
                              return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery';
                            })()}
                          </p>
                        </div>
                      )}
                      {modalData.orderPaymentProof && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            {language === 'ar' ? 'صورة تأكيد الدفع' : 'Payment Proof'}
                          </h4>
                          <img
                            src={modalData.orderPaymentProof}
                            alt={language === 'ar' ? 'صورة تأكيد الدفع' : 'Payment proof'}
                            className="w-full max-w-md rounded-lg border cursor-zoom-in"
                            onClick={() => setZoomImage({ url: modalData.orderPaymentProof!, scale: 1, x: 0, y: 0, isPanning: false, startX: 0, startY: 0 })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Notes */}
                  {modalData.orderNotes && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {language === 'ar' ? 'ملاحظات العميل (اختياري)' : 'Customer Notes (optional)'}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                        {modalData.orderNotes}
                      </div>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {modalData.orderStatus === 'CANCELLED' && modalData.firstOrder.cancellationReason && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-red-600 mb-4">
                        {language === 'ar' ? 'سبب الإلغاء' : 'Cancellation Reason'}
                      </h3>
                      <div className="bg-red-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap border border-red-200">
                        {modalData.firstOrder.cancellationReason}
                      </div>
                    </div>
                  )}

                  {/* Order Summary (Order-level totals) */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(modalData.subTotal)}
                        </span>
                      </div>
                      {modalData.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === 'ar' ? 'الشحن' : 'Shipping'}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(modalData.shipping)}
                          </span>
                        </div>
                      )}
                      {modalData.orderCouponCode && modalData.orderCouponDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === 'ar' ? 'الخصم' : 'Discount'}
                            {modalData.orderCouponCode && ` (${modalData.orderCouponCode})`}
                          </span>
                          <span className="font-semibold text-green-600">
                            - {formatPrice(modalData.orderCouponDiscount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">
                          {language === 'ar' ? 'الإجمالي' : 'Total'}
                        </span>
                        <span className="text-xl font-bold text-[#DAA520]">
                          {formatPrice(modalData.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {modalData.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => askBeforeStatusChange(modalData.firstOrder, 'CONFIRMED')}
                            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {t('admin.confirm')}
                          </button>
                          <button
                            onClick={() => askBeforeStatusChange(modalData.firstOrder, 'CANCELLED')}
                            className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                          >
                            {t('admin.cancel')}
                          </button>
                        </>
                      )}
                      {modalData.orderStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => askBeforeStatusChange(modalData.firstOrder, 'SHIPPED')}
                          className="px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                        >
                          {t('admin.ship')}
                        </button>
                      )}
                      {modalData.orderStatus === 'SHIPPED' && (
                        <button
                          onClick={() => askBeforeStatusChange(modalData.firstOrder, 'OUT_FOR_DELIVERY')}
                          className="px-3 py-2 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700"
                        >
                          {language === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery'}
                        </button>
                      )}
                      {modalData.orderStatus === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => askBeforeStatusChange(modalData.firstOrder, 'DELIVERED')}
                          className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          {t('admin.markDelivered')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(modalData.firstOrder)}
                        className="px-3 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700 inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {language === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
                      </button>
                      <button
                        onClick={() => handleWhatsAppContact(modalData.firstOrder)}
                        className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(modalData.firstOrder)}
                        className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {language === 'ar' ? 'حذف الطلب' : 'Delete Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          type="confirm"
          title={confirmState.title}
          message={confirmState.message}
          confirmText={language === 'ar' ? 'تأكيد' : 'Confirm'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmState.onConfirm || (() => {})}
          onCancel={() => setConfirmState({ isOpen: false, title: '', message: '' })}
        />

        {/* Language Selection Modal for Invoice */}
        {showLanguageModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowLanguageModal(false);
              setOrderForInvoice(null);
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'اختر لغة الفاتورة' : 'Choose Invoice Language'}
                </h3>
                <button
                  onClick={() => {
                    setShowLanguageModal(false);
                    setOrderForInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                {language === 'ar' ? 'اختر اللغة التي تريد تحميل الفاتورة بها' : 'Choose the language for the invoice'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => downloadInvoice('ar')}
                  className="flex-1 px-6 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#c2931b] font-medium transition-colors"
                >
                  {language === 'ar' ? 'عربي' : 'Arabic'}
                </button>
                <button
                  onClick={() => downloadInvoice('en')}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  {language === 'ar' ? 'إنجليزي' : 'English'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zoom Image Modal */}
        {zoomImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomImage.url}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
