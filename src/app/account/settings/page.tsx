'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';
import { 
  Settings, 
  User, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

interface SettingsData {
  language: string;
}

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    language: 'ar',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Update language if changed
      if (settings.language !== language) {
        setLanguage(settings.language as 'ar' | 'en');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast(
        language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!',
        'success',
        3000
      );
    } catch (error) {
      // Error saving settings - no sensitive data logged
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error occurred while saving settings',
        'error',
        3000
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setSettings({
      language: 'ar',
    });
    setShowResetModal(false);
    showToast(
      language === 'ar' ? 'تم إعادة تعيين الإعدادات بنجاح!' : 'Settings reset successfully!',
      'success',
      3000
    );
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'ar' ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
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
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#DAA520]" />
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'اللغة' : 'Language'}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({...settings, language: 'ar'})}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      settings.language === 'ar'
                        ? 'bg-[#DAA520] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => setSettings({...settings, language: 'en'})}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      settings.language === 'en'
                        ? 'bg-[#DAA520] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {language === 'ar' ? 'إجراءات الحساب' : 'Account Actions'}
            </h2>
            
            <div className="space-y-4">
              <Link 
                href="/account/delete-account"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <User className="w-4 h-4" />
                {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowResetModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ar' ? 'إعادة تعيين الإعدادات' : 'Reset Settings'}
                  </h3>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  {language === 'ar' 
                    ? 'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟ لا يمكن التراجع عن هذا الإجراء.'
                    : 'Are you sure you want to reset all settings to default values? This action cannot be undone.'
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={confirmReset}
                    className="flex-1 px-4 py-3 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {language === 'ar' ? 'إعادة التعيين' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
