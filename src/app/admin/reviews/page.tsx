'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { useToast } from '@/components/providers/ToastProvider';
import { getImageSrc } from '@/lib/image-utils';
import { 
  MessageSquare, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Home, 
  Filter,
  Search,
  X
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Review {
  id: string;
  rating: number;
  comment: string;
  commentAr?: string;
  isActive: boolean;
  createdAt: string;
  productId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    images?: Array<{ url: string; alt?: string }>;
  };
}

export default function ReviewsManagementPage() {
  const { language } = useLanguage();
  const { csrfToken } = useCSRF();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'home' | 'product'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {reviews: [...]}}
        const reviewsList = data.success && data.data?.reviews 
          ? data.data.reviews 
          : data.reviews || [];
        setReviews(Array.isArray(reviewsList) ? reviewsList : []);
      } else {
        setReviews([]); // Ensure reviews is always an array
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterType, filterActive]);

  const handleToggleActive = async (review: Review) => {
    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error',
        3000
      );
      return;
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          id: review.id,
          isActive: !review.isActive,
          csrfToken,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        // Handle structured response format
        const updatedReview = responseData.success && responseData.data?.review 
          ? responseData.data.review 
          : responseData.review;
        
        // Update the review in the list immediately for better UX
        if (updatedReview) {
          setReviews(prevReviews => 
            prevReviews.map(r => r.id === review.id ? { ...r, isActive: updatedReview.isActive } : r)
          );
          // Also update selected review if it's the same
          // Use setTimeout to avoid setState during render
          if (selectedReview?.id === review.id) {
            setTimeout(() => {
              setSelectedReview({ ...selectedReview, isActive: updatedReview.isActive });
            }, 0);
          }
          
          // Show success message
          showToast(
            language === 'ar' 
              ? `تم ${updatedReview.isActive ? 'تفعيل' : 'إلغاء تفعيل'} التقييم بنجاح` 
              : `Review ${updatedReview.isActive ? 'activated' : 'deactivated'} successfully`,
            'success',
            3000
          );
        } else {
          // If no response data, refresh the list
          await fetchReviews();
          showToast(
            language === 'ar' 
              ? `تم ${!review.isActive ? 'تفعيل' : 'إلغاء تفعيل'} التقييم بنجاح` 
              : `Review ${!review.isActive ? 'activated' : 'deactivated'} successfully`,
            'success',
            3000
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Handle structured error format: {success: false, error: "..."}
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || (language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status');
        showToast(errorMessage, 'error', 4000);
      }
    } catch (error) {
      showToast(language === 'ar' ? 'حدث خطأ أثناء تحديث الحالة' : 'Error updating status', 'error', 4000);
    }
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    if (!csrfToken) {
      showToast(
        language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.',
        'error',
        3000
      );
      setShowDeleteDialog(false);
      setReviewToDelete(null);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('id', reviewToDelete.id);
      params.append('csrfToken', csrfToken);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchReviews();
        // If deleting the selected review in detail modal, close it
        if (selectedReview?.id === reviewToDelete.id) {
          setShowDetailModal(false);
          setSelectedReview(null);
        }
        showToast(language === 'ar' ? 'تم حذف التقييم بنجاح' : 'Review deleted successfully', 'success', 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Handle structured error format: {success: false, error: "..."}
        const errorMessage = errorData.success === false && errorData.error 
          ? errorData.error 
          : errorData.error || (language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
        showToast(errorMessage, 'error', 4000);
      }
    } catch (error) {
      showToast(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting review', 'error', 4000);
    } finally {
      setShowDeleteDialog(false);
      setReviewToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setReviewToDelete(null);
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-[#DAA520] fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Filter reviews by search term
  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      review.user.firstName.toLowerCase().includes(searchLower) ||
      review.user.lastName.toLowerCase().includes(searchLower) ||
      review.user.email.toLowerCase().includes(searchLower) ||
      review.comment.toLowerCase().includes(searchLower) ||
      (review.commentAr && review.commentAr.toLowerCase().includes(searchLower)) ||
      (review.product && (
        review.product.name.toLowerCase().includes(searchLower) ||
        review.product.nameAr.toLowerCase().includes(searchLower)
      ))
    );
  });

  const stats = {
    total: reviews.length,
    home: reviews.filter(r => !r.productId).length,
    products: reviews.filter(r => r.productId).length,
    active: reviews.filter(r => r.isActive).length,
    inactive: reviews.filter(r => !r.isActive).length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'إدارة التعليقات والتقييمات' : 'Reviews & Comments Management'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {language === 'ar' 
                  ? 'إدارة تعليقات الصفحة الرئيسية وتقييمات المنتجات'
                  : 'Manage homepage testimonials and product reviews'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">
              {language === 'ar' ? 'إجمالي' : 'Total'}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Home className="w-4 h-4" />
              {language === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}
            </div>
            <div className="text-2xl font-bold text-[#DAA520]">{stats.home}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Package className="w-4 h-4" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.products}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">
              {language === 'ar' ? 'نشط' : 'Active'}
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
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
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder={language === 'ar' ? 'البحث في التعليقات...' : 'Search reviews...'}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {language === 'ar' ? 'النوع:' : 'Type:'}
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'home' | 'product')}
                    className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="home">{language === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}</option>
                    <option value="product">{language === 'ar' ? 'المنتجات' : 'Products'}</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  </label>
                  <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                    className="focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DAA520]/20 border-t-[#DAA520]"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ar' ? 'لا توجد تعليقات' : 'No reviews found'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'المستخدم' : 'User'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'التقييم' : 'Rating'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'التعليق' : 'Comment'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {review.user && review.user.avatar ? (
                            <img
                              src={getImageSrc(review.user.avatar, '')}
                              alt={`${review.user.firstName || ''} ${review.user.lastName || ''}`}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : review.user ? (
                            <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold mr-3">
                              {(review.user.firstName?.charAt(0) || 'U')}{(review.user.lastName?.charAt(0) || '')}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold mr-3">
                              U
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {review.user ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">{review.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {language === 'ar' && review.commentAr ? review.commentAr : review.comment}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.productId ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Package className="w-3 h-3 mr-1" />
                            {language === 'ar' ? 'منتج' : 'Product'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#DAA520]/10 text-[#DAA520]">
                            <Home className="w-3 h-3 mr-1" />
                            {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {language === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {language === 'ar' ? 'غير نشط' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(review)}
                            className="text-[#DAA520] hover:text-[#B8860B]"
                            title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(review)}
                            className={`${
                              review.isActive
                                ? 'text-orange-600 hover:text-orange-800'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={review.isActive 
                              ? (language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate')
                              : (language === 'ar' ? 'تفعيل' : 'Activate')
                            }
                          >
                            {review.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(review)}
                            className="text-red-600 hover:text-red-800"
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'ar' ? 'تفاصيل التقييم' : 'Review Details'}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'المستخدم' : 'User'}
                    </h3>
                    <div className="flex items-center gap-4">
                      {selectedReview.user && selectedReview.user.avatar ? (
                        <img
                          src={getImageSrc(selectedReview.user.avatar, '')}
                          alt={`${selectedReview.user.firstName || ''} ${selectedReview.user.lastName || ''}`}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : selectedReview.user ? (
                        <div className="w-16 h-16 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold text-xl">
                          {(selectedReview.user.firstName?.charAt(0) || 'U')}{(selectedReview.user.lastName?.charAt(0) || '')}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold text-xl">
                          U
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {selectedReview.user ? `${selectedReview.user.firstName || ''} ${selectedReview.user.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">{selectedReview.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'التقييم' : 'Rating'}
                    </h3>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedReview.rating)}
                      <span className="ml-2 text-gray-700">{selectedReview.rating}/5</span>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </h3>
                    {selectedReview.productId ? (
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-2">
                          <Package className="w-4 h-4 mr-1" />
                          {language === 'ar' ? 'تقييم منتج' : 'Product Review'}
                        </span>
                        {selectedReview.product && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>{language === 'ar' ? 'المنتج:' : 'Product:'}</strong>{' '}
                              {language === 'ar' ? selectedReview.product.nameAr : selectedReview.product.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#DAA520]/10 text-[#DAA520]">
                        <Home className="w-4 h-4 mr-1" />
                        {language === 'ar' ? 'تعليق الصفحة الرئيسية' : 'Homepage Testimonial'}
                      </span>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'التعليق (إنجليزي)' : 'Comment (English)'}
                    </h3>
                    <p className="text-gray-900">{selectedReview.comment}</p>
                  </div>

                  {selectedReview.commentAr && (
                    <div className="border-b pb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {language === 'ar' ? 'التعليق (عربي)' : 'Comment (Arabic)'}
                      </h3>
                      <p className="text-gray-900">{selectedReview.commentAr}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </h3>
                    {selectedReview.isActive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {language === 'ar' ? 'غير نشط' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {language === 'ar' ? 'التاريخ' : 'Date'}
                    </h3>
                    <p className="text-gray-900">
                      {new Date(selectedReview.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleToggleActive(selectedReview)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      selectedReview.isActive
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedReview.isActive
                      ? (language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate')
                      : (language === 'ar' ? 'تفعيل' : 'Activate')}
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteClick(selectedReview);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={
            language === 'ar'
              ? 'هل أنت متأكد من حذف هذا التعليق؟\nلا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to delete this review?\nThis action cannot be undone.'
          }
          type="confirm"
          confirmText={language === 'ar' ? 'حذف' : 'Delete'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </AdminLayout>
  );
}

