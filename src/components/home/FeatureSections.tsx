'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Star, Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { getImageSrc } from '@/lib/image-utils';

interface CustomerReview {
  id: string;
  rating: number;
  comment: string;
  commentAr?: string;
  createdAt?: string;
  updatedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export function FeatureSections() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '100px 0px'
        }
      );

      observer.observe(sectionRef.current);

      return () => observer.disconnect();
    }
  }, []);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { csrfToken } = useCSRF();
  const [testimonialImages, setTestimonialImages] = useState<string[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    commentAr: ''
  });
  const [displayedReviews, setDisplayedReviews] = useState<CustomerReview[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewRows, setReviewRows] = useState<CustomerReview[][]>([]);
  // Store newly added reviews to ensure they persist through refreshes
  const newReviewsRef = useRef<Map<string, CustomerReview>>(new Map());

  // Validate comment format (Arabic, English, numbers only)
  const validateCommentFormat = (text: string): { isValid: boolean; error?: string } => {
    if (!text || !text.trim()) {
      return { isValid: false, error: language === 'ar' ? 'التعليق لا يمكن أن يكون فارغاً' : 'Comment cannot be empty' };
    }
    
    // Check if contains only allowed characters
    const allowedPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,!?؛،\-_()]*$/;
    
    if (!allowedPattern.test(text)) {
      return { 
        isValid: false, 
        error: language === 'ar' 
          ? 'التعليق يمكن أن يحتوي فقط على حروف عربية وإنجليزية وأرقام وعلامات ترقيم أساسية' 
          : 'Comment can only contain Arabic letters, English letters, numbers, spaces, and basic punctuation'
      };
    }
    
    if (text.trim().length < 3) {
      return { isValid: false, error: language === 'ar' ? 'التعليق يجب أن يكون على الأقل 3 أحرف' : 'Comment must be at least 3 characters long' };
    }
    
    if (text.length > 300) {
      return { isValid: false, error: language === 'ar' ? 'التعليق يجب ألا يتجاوز 300 حرف' : 'Comment must not exceed 300 characters' };
    }
    
    return { isValid: true };
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast(
        language === 'ar' ? 'يجب تسجيل الدخول لإضافة رأي' : 'Please login to add a review',
        'error',
        3000
      );
      return;
    }

    // Check if at least one comment field is provided based on language
    const currentComment = language === 'ar' ? reviewFormData.commentAr : reviewFormData.comment;
    if (!currentComment || !currentComment.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إضافة تعليق' : 'Please add a comment',
        'error',
        3000
      );
      return;
    }

    // Validate comment format
    const validation = validateCommentFormat(currentComment);
    if (!validation.isValid) {
      showToast(
        validation.error || (language === 'ar' ? 'صيغة التعليق غير صحيحة' : 'Invalid comment format'),
        'error',
        4000
      );
      return;
    }

    if (!csrfToken) {
      showToast(
        language === 'ar' ? 'يرجى الانتظار...' : 'Please wait...',
        'error',
        3000
      );
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/customer-reviews', {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          ...reviewFormData,
          csrfToken: csrfToken, // Add CSRF token
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newReview = responseData.review;
        
        showToast(
          language === 'ar' ? 'تم إضافة رأيك بنجاح!' : 'Your review has been added successfully!',
          'success',
          3000
        );
        setReviewFormData({ rating: 5, comment: '', commentAr: '' });
        setShowReviewForm(false);
        
        // Helper function to organize reviews into rows
        const organizeReviewsIntoRows = (reviews: CustomerReview[]) => {
          // Remove duplicates based on review ID before organizing
          const uniqueReviewsMap = new Map<string, CustomerReview>();
          reviews.forEach((review: CustomerReview) => {
            if (!uniqueReviewsMap.has(review.id)) {
              uniqueReviewsMap.set(review.id, review);
            }
          });
          const uniqueReviewsList = Array.from(uniqueReviewsMap.values());
          
          // Sort by createdAt descending (newest first)
          uniqueReviewsList.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          
          // Organize reviews into rows of 10
          const rows: CustomerReview[][] = [];
          for (let i = 0; i < uniqueReviewsList.length; i += 10) {
            const row = uniqueReviewsList.slice(i, i + 10);
            if (row.length > 0) {
              // Duplicate reviews for seamless loop (need at least 3 copies for smooth animation)
              rows.push([...row, ...row, ...row]); // Triple for smooth loop
            }
          }
          return { rows, uniqueReviewsList };
        };
        
        // Immediately add the new review to the state if available
        if (newReview && newReview.id) {
          // Ensure createdAt is set if missing
          if (!newReview.createdAt) {
            newReview.createdAt = new Date().toISOString();
          }
          
          // Store in ref to persist through refreshes - CRITICAL
          newReviewsRef.current.set(newReview.id, newReview);
          
          // Add to current reviews list
          const updatedReviews = [newReview, ...customerReviews];
          setCustomerReviews(updatedReviews);
          
          // Organize into rows
          const { rows } = organizeReviewsIntoRows(updatedReviews);
          
          // CRITICAL: Ensure new review is in the first row
          if (rows.length > 0) {
            const firstRow = rows[0];
            const firstRowUnique = firstRow.slice(0, firstRow.length / 3); // Get unique reviews
            const reviewInFirstRow = firstRowUnique.some(r => r.id === newReview.id);
            
            if (!reviewInFirstRow) {
              // New review not in first row, adding it - no sensitive data logged
              firstRowUnique.unshift(newReview);
              // Recreate first row with new review at the start
              rows[0] = [...firstRowUnique, ...firstRowUnique, ...firstRowUnique];
            }
          } else {
            // No rows yet, create first row with new review
            rows.push([newReview, newReview, newReview]);
          }
          
          setReviewRows(rows);
          
          // Review added to state - no sensitive data logged
          
          // Double-check: Verify review is in rows
          const reviewInRows = rows.some(row => row.some(r => r.id === newReview.id));
          const reviewInFirstRow = rows.length > 0 && rows[0].some(r => r.id === newReview.id);
          // Review verification complete - no sensitive data logged
        }
        
        // Store newReview in a variable that will be accessible in setTimeout
        const savedNewReview = newReview;
        
        // Refresh reviews after a delay to ensure database is updated and we have all reviews
        // We'll merge the new review with the fetched reviews to ensure it doesn't disappear
        setTimeout(async () => {
          try {
            // Use same limit as initial fetch to get all reviews
            const refreshResponse = await fetch('/api/customer-reviews?limit=50');
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const fetchedReviews: CustomerReview[] = refreshData.reviews || [];
              
              // Fetched reviews from server - no sensitive data logged
              
              // Merge with existing reviews to ensure newReview is included
              // Create a map to avoid duplicates
              const reviewsMap = new Map<string, CustomerReview>();
              
              // First, add all stored new reviews from ref (these are user's newly added reviews)
              // This ensures new reviews are always included even if not in server response yet
              newReviewsRef.current.forEach((review) => {
                if (review && review.id) {
                  reviewsMap.set(review.id, review);
                  // Including stored new review from ref - no sensitive data logged
                }
              });
              
              // Then add all fetched reviews (this will overwrite if newReview is already in fetchedReviews)
              fetchedReviews.forEach((review) => {
                if (review && review.id) {
                  reviewsMap.set(review.id, review);
                  // Remove from ref if it's now in the server response (it's persisted in DB)
                  if (newReviewsRef.current.has(review.id)) {
                    newReviewsRef.current.delete(review.id);
                    // Removed review from ref (now in server) - no sensitive data logged
                  }
                }
              });
              
              // Convert back to array
              const allReviews = Array.from(reviewsMap.values());
              
              // CRITICAL: Always ensure savedNewReview is in the list
              // Add it first to ensure it's at the top (newest)
              if (savedNewReview && savedNewReview.id) {
                // Remove it first if it exists (to avoid duplicates)
                const existingIndex = allReviews.findIndex(r => r.id === savedNewReview.id);
                if (existingIndex !== -1) {
                  allReviews.splice(existingIndex, 1);
                  // Removed duplicate review before adding - no sensitive data logged
                }
                // Add it at the beginning (newest first)
                allReviews.unshift(savedNewReview);
                // Ensure it stays in ref
                newReviewsRef.current.set(savedNewReview.id, savedNewReview);
                // Ensured new review is at the top of list - no sensitive data logged
              }
              
              // Also ensure all reviews from ref are in the list
              newReviewsRef.current.forEach((refReview) => {
                if (refReview && refReview.id && !allReviews.some(r => r.id === refReview.id)) {
                  allReviews.unshift(refReview);
                  // Added missing review from ref - no sensitive data logged
                }
              });
              
              // Final check: Make sure savedNewReview is definitely in the list
              if (savedNewReview && savedNewReview.id) {
                const finalCheck = allReviews.some(r => r.id === savedNewReview.id);
                if (!finalCheck) {
                  allReviews.unshift(savedNewReview);
                  newReviewsRef.current.set(savedNewReview.id, savedNewReview);
                }
              }
              
              setCustomerReviews(allReviews);
              
              const { rows, uniqueReviewsList } = organizeReviewsIntoRows(allReviews);
              
              // Final verification: Check if new review is in rows
              if (savedNewReview && savedNewReview.id) {
                const reviewInRows = rows.some(row => row.some(r => r.id === savedNewReview.id));
                if (!reviewInRows) {
                  // Force add to first row
                  if (rows.length > 0 && rows[0].length > 0) {
                    const firstRow = rows[0];
                    const firstRowUnique = firstRow.slice(0, firstRow.length / 3); // Get unique reviews
                    firstRowUnique.unshift(savedNewReview);
                    // Recreate first row with new review
                    rows[0] = [...firstRowUnique, ...firstRowUnique, ...firstRowUnique];
                  } else {
                    // Create new row with just the new review
                    rows.unshift([savedNewReview, savedNewReview, savedNewReview]);
                  }
                }
                // New review in rows after refresh - no sensitive data logged
              }
              
              setReviewRows(rows);
              const hasNewReviewInFinal = savedNewReview ? allReviews.some(r => r.id === savedNewReview.id) : false;
              // Reviews refreshed - no sensitive data logged
            }
          } catch (error) {
            // Error fetching customer reviews
          }
        }, 3000); // Increased delay to 3 seconds to ensure database is fully updated
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 401) {
          showToast(
            language === 'ar' 
              ? 'يجب تسجيل الدخول لإضافة رأي. يرجى تسجيل الدخول أولاً.' 
              : 'You must be logged in to add a review. Please log in first.',
            'error',
            5000
          );
        } else {
          showToast(errorData.error || (language === 'ar' ? 'فشل إضافة الرأي' : 'Failed to add review'), 'error');
        }
      }
    } catch (error) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء إضافة الرأي' : 'Error occurred while adding review',
        'error'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchTestimonialImages = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setTestimonialImages(data.images || []);
        }
      } catch (error) {
        // Error fetching testimonial images
      }
    };

    const fetchCustomerReviews = async () => {
      try {
        const response = await fetch('/api/customer-reviews?limit=50');
        if (response.ok) {
          const data = await response.json();
          const fetchedReviews: CustomerReview[] = data.reviews || [];
          
          // Merge with stored new reviews to ensure they persist
          const reviewsMap = new Map<string, CustomerReview>();
          
          // First, add all stored new reviews from ref
          newReviewsRef.current.forEach((review) => {
            if (review && review.id) {
              reviewsMap.set(review.id, review);
            }
          });
          
          // Then add all fetched reviews
          fetchedReviews.forEach((review: CustomerReview) => {
            if (review && review.id) {
              reviewsMap.set(review.id, review);
              // Remove from ref if it's now in the server response (it's persisted in DB)
              if (newReviewsRef.current.has(review.id)) {
                newReviewsRef.current.delete(review.id);
              }
            }
          });
          
          const allReviews = Array.from(reviewsMap.values());
          setCustomerReviews(allReviews);
          
          // Remove duplicates based on review ID before organizing
          const uniqueReviewsMap = new Map<string, CustomerReview>();
          allReviews.forEach((review: CustomerReview) => {
            if (!uniqueReviewsMap.has(review.id)) {
              uniqueReviewsMap.set(review.id, review);
            }
          });
          const uniqueReviewsList = Array.from(uniqueReviewsMap.values());
          
          // Sort by createdAt descending (newest first)
          uniqueReviewsList.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          
          // Organize reviews into rows of 10
          const rows: CustomerReview[][] = [];
          for (let i = 0; i < uniqueReviewsList.length; i += 10) {
            const row = uniqueReviewsList.slice(i, i + 10);
            if (row.length > 0) {
              // Duplicate reviews for seamless loop
              rows.push([...row, ...row, ...row]); // Triple for smooth loop
            }
          }
          // Reviews organized - no sensitive data logged
          setReviewRows(rows);
        }
      } catch (error) {
        // Error fetching customer reviews
      }
    };

    fetchTestimonialImages();
    fetchCustomerReviews();
  }, []);

  // Monitor reviewRows to ensure new reviews from ref are always displayed
  useEffect(() => {
    // Check if any new reviews from ref are missing from reviewRows
    if (reviewRows.length > 0 && newReviewsRef.current.size > 0) {
      const allReviewIdsInRows = new Set<string>();
      reviewRows.forEach(row => {
        const uniqueInRow = row.slice(0, row.length / 3); // Get unique reviews (first third)
        uniqueInRow.forEach(review => {
          if (review && review.id) {
            allReviewIdsInRows.add(review.id);
          }
        });
      });
      
      // Check if any ref reviews are missing
      let needsUpdate = false;
      newReviewsRef.current.forEach((refReview) => {
        if (refReview && refReview.id && !allReviewIdsInRows.has(refReview.id)) {
          needsUpdate = true;
          // Review from ref missing from rows, will update - no sensitive data logged
        }
      });
      
      // If missing, merge and update
      if (needsUpdate) {
        const reviewsMap = new Map<string, CustomerReview>();
        
        // Add all current reviews from rows
        reviewRows.forEach(row => {
          const uniqueInRow = row.slice(0, row.length / 3);
          uniqueInRow.forEach(review => {
            if (review && review.id) {
              reviewsMap.set(review.id, review);
            }
          });
        });
        
        // Add all reviews from ref
        newReviewsRef.current.forEach((refReview) => {
          if (refReview && refReview.id) {
            reviewsMap.set(refReview.id, refReview);
          }
        });
        
        const allReviews = Array.from(reviewsMap.values());
        allReviews.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        
        setCustomerReviews(allReviews);
        
        // Reorganize rows
        const rows: CustomerReview[][] = [];
        for (let i = 0; i < allReviews.length; i += 10) {
          const row = allReviews.slice(i, i + 10);
          if (row.length > 0) {
            rows.push([...row, ...row, ...row]);
          }
        }
        setReviewRows(rows);
        // Fixed missing reviews in rows - no sensitive data logged
      }
    }
  }, [reviewRows.length]); // Only trigger when row count changes


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <style jsx>{`
        @keyframes slide-right {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
        
        @keyframes slide-left {
          from {
            transform: translateX(-33.333%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .slider-right {
          animation: slide-right 90s linear infinite;
        }
        
        .slider-left {
          animation: slide-left 90s linear infinite;
        }
        
        .slider-container:hover .slider-right,
        .slider-container:hover .slider-left {
          animation-play-state: paused;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .slider-right,
          .slider-left {
            animation: none;
          }
        }
      `}</style>
      {/* Testimonials Section */}
      <section 
        ref={sectionRef}
        className={`py-20 bg-gradient-to-b from-white via-gray-50 to-white transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-16">
              <p 
                className={`text-2xl lg:text-3xl font-bold text-gray-900 max-w-3xl mx-auto mb-8 ${language === 'ar' ? 'font-tajawal' : 'font-poppins'}`}
              >
                {language === 'ar' 
                  ? 'اكتشف ما يقوله عملاؤنا عن تجربتهم معنا'
                  : 'Discover what our customers say about their experience with us'
                }
              </p>
              
              {/* Add Review Button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="inline-flex items-center gap-2 bg-[#DAA520] text-white px-6 py-3 rounded-lg hover:bg-[#B8860B] transition-colors font-semibold"
              >
                <Send className="w-5 h-5" />
                {language === 'ar' ? 'أضف رأيك' : 'Add Your Review'}
              </button>
            </div>
          </ScrollReveal>

          {/* Review Form */}
          {showReviewForm && (
            <div className="max-w-2xl mx-auto mb-16 bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {language === 'ar' ? 'شاركنا رأيك' : 'Share Your Opinion'}
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {language === 'ar' ? 'التقييم' : 'Rating'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= reviewFormData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'تعليقك' : 'Your Comment'}
                  </label>
                  <textarea
                    value={language === 'ar' ? reviewFormData.commentAr : reviewFormData.comment}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove HTML tags and allow only Arabic, English, numbers, spaces, and safe punctuation
                      value = value.replace(/<[^>]*>/g, ''); // Remove HTML tags
                      value = value.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,!?؛،\-_()]/g, '');
                      // Limit length to 300 characters
                      if (value.length > 300) {
                        value = value.substring(0, 300);
                      }
                      setReviewFormData(prev => ({
                        ...prev,
                        [language === 'ar' ? 'commentAr' : 'comment']: value
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAA520] resize-none"
                    rows={4}
                    placeholder={language === 'ar' ? 'أضف تعليقك هنا...' : 'Add your comment here...'}
                    maxLength={300}
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#DAA520] text-white px-6 py-3 rounded-lg hover:bg-[#B8860B] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {language === 'ar' ? 'إرسال الرأي' : 'Submit Review'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sliding Reviews Carousel */}
          {reviewRows.length > 0 ? (
            <div className="space-y-6 overflow-hidden py-4">
              {reviewRows.map((row, rowIndex) => {
                const isEvenRow = rowIndex % 2 === 1; // Second, fourth, etc. rows move left
                const originalRowLength = row.length / 3; // We tripled the rows for seamless loop
                // Get unique reviews only (first copy of each review)
                const uniqueReviews = row.slice(0, originalRowLength);
                return (
                  <div 
                    key={rowIndex}
                    className="slider-container relative w-full overflow-hidden"
                  >
                    <div 
                      className={`flex gap-6 ${isEvenRow ? 'slider-left' : 'slider-right'}`}
                      style={{ width: `${row.length * 400}px` }}
                    >
                      {row.map((review, index) => {
                        // Calculate which review to show (cycling through original reviews)
                        const reviewIndex = index % originalRowLength;
                        const uniqueReview = uniqueReviews[reviewIndex];
                        
                        if (!uniqueReview) return null;
                        
                        // Determine if this is a duplicate (for styling/display purposes)
                        const isDuplicate = index >= originalRowLength;
                        
                        return (
                        <div
                          key={`${uniqueReview.id}-${index}`}
                          className={`flex-shrink-0 w-[380px] bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 relative overflow-hidden group ${
                            isDuplicate ? 'pointer-events-none' : ''
                          }`}
                          style={isDuplicate ? { opacity: 0 } : { wordBreak: 'break-word' }}
                        >
                          {/* Decorative background elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#DAA520]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#DAA520]/10 transition-colors duration-500"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#DAA520]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-[#DAA520]/10 transition-colors duration-500"></div>
                          
                          {/* Quote icon */}
                          <div className="absolute top-4 right-4 text-[#DAA520]/20 group-hover:text-[#DAA520]/30 transition-colors duration-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                            </svg>
                          </div>

                          <div className="relative z-10">
                            {/* User Info */}
                            <div className="flex items-center mb-4">
                              {uniqueReview.user && uniqueReview.user.avatar ? (
                                <div className="relative flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-[#DAA520]/20 shadow-md">
                                    <img
                                      src={getImageSrc(uniqueReview.user.avatar, '')}
                                      alt={`${uniqueReview.user.firstName || ''} ${uniqueReview.user.lastName || ''}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-white font-bold mr-3 shadow-lg border-2 border-white text-sm">
                                  {getInitials(uniqueReview.user?.firstName || 'U', uniqueReview.user?.lastName || 'N')}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-base mb-1 truncate antialiased">
                                  {uniqueReview.user?.firstName || 'User'} {uniqueReview.user?.lastName || ''}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 transition-transform duration-300 ${
                                        star <= uniqueReview.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Review Text */}
                            <div className="relative overflow-hidden">
                              <p className="text-gray-700 leading-relaxed text-sm font-medium line-clamp-3 break-words overflow-hidden">
                                <span className="text-[#DAA520] text-xl leading-none">"</span>
                                {language === 'ar' && uniqueReview.commentAr ? uniqueReview.commentAr : uniqueReview.comment}
                                <span className="text-[#DAA520] text-xl leading-none">"</span>
                              </p>
                            </div>

                            {/* Verified badge */}
                            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">
                                {language === 'ar' ? 'موثق' : 'Verified'}
                              </span>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : customerReviews.length > 0 ? (
            // Fallback: Show as grid if no rows organized yet
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customerReviews.slice(0, 6).map((review, index) => (
                <ScrollReveal 
                  key={review.id}
                  direction="up" 
                  delay={index * 200}
                >
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:-translate-y-2 relative overflow-hidden group" style={{ wordBreak: 'break-word' }}>
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#DAA520]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#DAA520]/10 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#DAA520]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-[#DAA520]/10 transition-colors duration-500"></div>
                    
                    {/* Quote icon */}
                    <div className="absolute top-4 right-4 text-[#DAA520]/20 group-hover:text-[#DAA520]/30 transition-colors duration-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                      </svg>
                    </div>

                    <div className="relative z-10">
                      {/* User Info */}
                      <div className="flex items-center mb-6">
                        {review.user && review.user.avatar ? (
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#DAA520]/20 shadow-md">
                              <img
                                src={getImageSrc(review.user.avatar, '')}
                                alt={`${review.user.firstName || ''} ${review.user.lastName || ''}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg border-2 border-white">
                                        ${getInitials(review.user?.firstName || 'U', review.user?.lastName || 'N')}
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                            <div className="absolute bottom-0 right-4 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg border-2 border-white">
                            {getInitials(review.user?.firstName || 'U', review.user?.lastName || 'N')}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 antialiased">
                            {review.user?.firstName || 'User'} {review.user?.lastName || ''}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 transition-transform duration-300 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current scale-110'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500 font-medium">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="relative overflow-hidden">
                        <p className="text-gray-700 leading-relaxed text-base font-medium line-clamp-4 group-hover:line-clamp-none transition-all duration-300 break-words overflow-hidden">
                          <span className="text-[#DAA520] text-2xl leading-none">"</span>
                          {language === 'ar' && review.commentAr ? review.commentAr : review.comment}
                          <span className="text-[#DAA520] text-2xl leading-none">"</span>
                        </p>
                      </div>

                      {/* Verified badge */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                          {language === 'ar' ? 'عميل موثق' : 'Verified Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              {language === 'ar' 
                ? 'لا توجد آراء عملاء بعد. كن أول من يشارك رأيه!'
                : 'No customer reviews yet. Be the first to share your opinion!'
              }
            </div>
          )}

          {/* Customer Review Images Gallery */}
          {testimonialImages.length > 0 && (
            <div className="mt-16">
              <ScrollReveal direction="up" delay={400}>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                  {language === 'ar' ? 'صور من عملائنا' : 'Photos from Our Customers'}
                </h3>
              </ScrollReveal>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {testimonialImages.map((imageUrl, index) => (
                  <ScrollReveal 
                    key={index}
                    direction="up" 
                    delay={500 + (index * 100)}
                  >
                    <div className="relative group overflow-hidden rounded-xl cursor-pointer">
                      <img
                        src={imageUrl}
                        alt={`Customer review ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
