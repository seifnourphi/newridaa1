'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Check, X } from 'lucide-react';

interface PasswordStrengthBarProps {
  password: string;
  className?: string;
}

export function PasswordStrengthBar({ password, className = '' }: PasswordStrengthBarProps) {
  const { language } = useLanguage();
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const calculateStrength = () => {
      const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      };

      setChecks(checks);

      const passedChecks = Object.values(checks).filter(Boolean).length;
      setStrength(passedChecks);
    };

    calculateStrength();
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthGradient = () => {
    if (strength <= 1) return 'from-red-500 to-red-600';
    if (strength <= 2) return 'from-orange-500 to-orange-600';
    if (strength <= 3) return 'from-yellow-500 to-yellow-600';
    if (strength <= 4) return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-green-600';
  };

  const getStrengthText = () => {
    if (strength <= 1) return language === 'ar' ? 'ضعيف جداً' : 'Very Weak';
    if (strength <= 2) return language === 'ar' ? 'ضعيف' : 'Weak';
    if (strength <= 3) return language === 'ar' ? 'متوسط' : 'Fair';
    if (strength <= 4) return language === 'ar' ? 'جيد' : 'Good';
    return language === 'ar' ? 'ممتاز' : 'Excellent';
  };

  const getStrengthTextColor = () => {
    if (strength <= 1) return 'text-red-600';
    if (strength <= 2) return 'text-orange-600';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            {language === 'ar' ? 'قوة كلمة المرور:' : 'Password Strength:'}
          </span>
          <span className={`text-xs font-semibold ${getStrengthTextColor()}`}>
            {getStrengthText()}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getStrengthGradient()} shadow-sm`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600 mb-2">
          {language === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
        </div>
        
        <div className="space-y-1.5">
          <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${checks.length ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              checks.length 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {checks.length ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span>
              {language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              checks.lowercase 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {checks.lowercase ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span>
              {language === 'ar' ? 'حرف صغير (a-z)' : 'Lowercase letter (a-z)'}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              checks.uppercase 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {checks.uppercase ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span>
              {language === 'ar' ? 'حرف كبير (A-Z)' : 'Uppercase letter (A-Z)'}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${checks.number ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              checks.number 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {checks.number ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span>
              {language === 'ar' ? 'رقم (0-9)' : 'Number (0-9)'}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${checks.special ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              checks.special 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {checks.special ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <X className="w-2.5 h-2.5" />
              )}
            </div>
            <span>
              {language === 'ar' ? 'رمز خاص (!@#$...)' : 'Special character (!@#$...)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
