'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { Mail, Send, Users, CheckCircle, AlertCircle, Loader, Upload, X } from 'lucide-react';

export default function SendOffersPage() {
  const { language } = useLanguage();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    image: '',
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/subscribers/count', {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle structured response format: {success: true, data: {count: number}}
        const count = data.success && data.data?.count !== undefined
          ? data.data.count
          : data.count || 0;
        setSubscriberCount(count);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'الرجاء اختيار صورة صحيحة' : 'Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء رفع الصورة' : 'An error occurred while uploading image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleTestEmail = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      setResult({
        success: false,
        message: language === 'ar' ? 'الرجاء إدخال الموضوع والرسالة' : 'Please enter subject and message'
      });
      return;
    }

    if (!csrfToken) {
      setResult({
        success: false,
        message: language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/newsletter/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          image: formData.image,
          csrfToken: csrfToken,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: language === 'ar' ? 'حدث خطأ أثناء إرسال البريد التجريبي' : 'An error occurred while sending test email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setResult({
        success: false,
        message: language === 'ar' ? 'الرجاء إدخال الموضوع والرسالة' : 'Please enter subject and message'
      });
      return;
    }

    if (!csrfToken) {
      setResult({
        success: false,
        message: language === 'ar' 
          ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Your session has expired. Please sign in again.'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: Include cookies
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          image: formData.image,
          csrfToken: csrfToken, // CRITICAL: Include CSRF token
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({ subject: '', message: '', image: '' });
        fetchSubscriberCount(); // Refresh count
      }
    } catch (error) {
      setResult({
        success: false,
        message: language === 'ar' ? 'حدث خطأ أثناء إرسال العروض' : 'An error occurred while sending offers'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'إرسال العروض والخصومات' : 'Send Offers & Discounts'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {language === 'ar' 
                  ? 'إرسال العروض والخصومات للمستخدمين الموافقين على تلقي العروض'
                  : 'Send offers and discounts to users who subscribed to newsletter'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Subscriber Count */}
        {subscriberCount !== null && (
          <div className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">
                  {language === 'ar' ? 'عدد المشتركين' : 'Subscribers Count'}
                </p>
                <p className="text-white text-3xl font-bold">{subscriberCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'موضوع الرسالة' : 'Subject'}
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: خصم خاص 50% على جميع المنتجات' : 'Example: Special 50% discount on all products'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'صورة العرض (اختياري)' : 'Offer Image (Optional)'}
              </label>
              {!formData.image ? (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#DAA520] transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? 'رفع صورة' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.image}
                      alt={language === 'ar' ? 'صورة العرض' : 'Offer Image'}
                      className="w-full h-auto rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      title={language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {language === 'ar' 
                  ? 'يمكنك رفع صورة للعرض (JPG, PNG, GIF - حد أقصى 5 ميجابايت)'
                  : 'You can upload an image for the offer (JPG, PNG, GIF - max 5MB)'
                }
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'محتوى الرسالة' : 'Message Content'}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={12}
                placeholder={language === 'ar' 
                  ? 'اكتب محتوى الرسالة هنا... يمكنك استخدام HTML للتنسيق'
                  : 'Write message content here... You can use HTML for formatting'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-none"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                {language === 'ar' 
                  ? 'يمكنك استخدام HTML لتنسيق الرسالة (مثل: <b>نص عريض</b>, <br/> لسطر جديد)'
                  : 'You can use HTML to format the message (e.g., <b>bold</b>, <br/> for new line)'
                }
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {language === 'ar' ? 'إرسال تجريبي' : 'Send Test'}
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {language === 'ar' ? 'إرسال للعملاء' : 'Send to Subscribers'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg shadow p-6 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.success 
                    ? (language === 'ar' ? 'تم الإرسال بنجاح' : 'Sent Successfully')
                    : (language === 'ar' ? 'فشل الإرسال' : 'Send Failed')
                  }
                </h3>
                <p className={`text-sm ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message || result.error}
                </p>
                {result.success && result.stats && (
                  <div className="mt-4 space-y-2 text-sm text-green-800">
                    <p>
                      {language === 'ar' ? 'عدد الرسائل المرسلة:' : 'Messages Sent:'} {result.stats.sent}
                    </p>
                    {result.stats.failed > 0 && (
                      <div className="space-y-1">
                        <p className="text-red-600 font-semibold">
                          {language === 'ar' ? 'عدد الرسائل الفاشلة:' : 'Failed:'} {result.stats.failed}
                        </p>
                        {result.failedEmails && result.failedEmails.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {result.failedEmails.map((failed: any, index: number) => (
                              <p key={index} className="text-xs text-red-600">
                                • {failed.email}: {failed.reason}
                              </p>
                            ))}
                          </div>
                        )}
                        {result.emailConfigured === false && (
                          <p className="text-xs text-orange-600 mt-2">
                            {language === 'ar' 
                              ? '⚠️ تحقق من إعدادات البريد الإلكتروني في ملف .env (SMTP_USER, SMTP_PASS)'
                              : '⚠️ Check email configuration in .env file (SMTP_USER, SMTP_PASS)'
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                {language === 'ar' ? 'معلومات مهمة' : 'Important Information'}
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  {language === 'ar' 
                    ? 'سيتم إرسال العروض فقط للمستخدمين الموافقين على تلقي العروض'
                    : 'Offers will only be sent to users who subscribed to newsletter'
                  }
                </li>
                <li>
                  {language === 'ar' 
                    ? 'يمكنك استخدام HTML لتنسيق الرسائل بشكل أفضل'
                    : 'You can use HTML to format messages better'
                  }
                </li>
                <li>
                  {language === 'ar' 
                    ? 'يُنصح بكتابة موضوع واضح وجذاب للمستخدمين'
                    : 'It\'s recommended to write a clear and attractive subject'
                  }
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

