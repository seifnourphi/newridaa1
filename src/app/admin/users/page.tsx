'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCSRF } from '@/hooks/useCSRF';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Bell,
  BellOff,
  MapPin
} from 'lucide-react';

interface Address {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  isActive: boolean;
  subscribedToNewsletter?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
  addresses?: Address[];
}

export default function UsersManagementPage() {
  const { language } = useLanguage();
  const { csrfToken, loading: csrfLoading } = useCSRF();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [newsletterFilter, setNewsletterFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    subscribed: 0,
    unsubscribed: 0
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        // Handle structured response format: {success: true, data: {users: [...]}}
        const usersList = data.success && data.data?.users 
          ? data.data.users 
          : data.users || [];
        const usersArray = Array.isArray(usersList) ? usersList : [];
        
        setUsers(usersArray);
        setFilteredUsers(usersArray);
        
        // Calculate stats
        const total = usersArray.length;
        const active = usersArray.filter((u: User) => u.isActive).length;
        const inactive = total - active;
        const verified = usersArray.filter((u: User) => u.emailVerified).length;
        const unverified = total - verified;
        const subscribed = usersArray.filter((u: User) => u.subscribedToNewsletter).length;
        const unsubscribed = total - subscribed;
        
        setStats({ total, active, inactive, verified, unverified, subscribed, unsubscribed });
      } else {
        console.error('Failed to fetch users:', data.error);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(user => 
        verificationFilter === 'verified' ? user.emailVerified : !user.emailVerified
      );
    }

    // Newsletter filter
    if (newsletterFilter !== 'all') {
      filtered = filtered.filter(user => 
        newsletterFilter === 'subscribed' ? user.subscribedToNewsletter : !user.subscribedToNewsletter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, verificationFilter, newsletterFilter]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!csrfToken) {
      console.error('CSRF token not available');
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
        : 'Your session has expired. Please sign in again.'
      );
      return;
    }

    try {
      const newStatus = !currentStatus;
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: Include cookies
        body: JSON.stringify({ 
          isActive: newStatus,
          csrfToken: csrfToken // CRITICAL: Include CSRF token
        }),
      });

      if (!response.ok) {
        let errorMessage = language === 'ar' ? 'فشل تحديث حالة المستخدم' : 'Failed to update user status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        console.error('Failed to update user status:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        });
        alert(language === 'ar' 
          ? `فشل تحديث حالة المستخدم: ${errorMessage}`
          : `Failed to update user status: ${errorMessage}`
        );
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: newStatus } : user
        ));
        
        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, isActive: newStatus });
        }
      } else {
        console.error('Failed to update user status:', data.error);
        alert(language === 'ar' 
          ? 'فشل تحديث حالة المستخدم: ' + (data.error || 'خطأ غير معروف')
          : 'Failed to update user status: ' + (data.error || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ أثناء تحديث حالة المستخدم'
        : 'An error occurred while updating user status'
      );
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      return;
    }

    if (!csrfToken) {
      console.error('CSRF token not available');
      alert(language === 'ar' 
        ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
        : 'Your session has expired. Please sign in again.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: Include cookies
        body: JSON.stringify({ 
          csrfToken: csrfToken // CRITICAL: Include CSRF token
        }),
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Export users to CSV
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      alert(language === 'ar' 
        ? 'لا توجد بيانات للتصدير'
        : 'No data to export'
      );
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    const csvData = [
      [language === 'ar' ? 'تقرير المستخدمين' : 'Users Report', ''],
      ['', ''],
      [language === 'ar' ? 'المعلومات' : 'Information', ''],
      [language === 'ar' ? 'الاسم الأول' : 'First Name', language === 'ar' ? 'الاسم الأخير' : 'Last Name', language === 'ar' ? 'البريد الإلكتروني' : 'Email', language === 'ar' ? 'الهاتف' : 'Phone', language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'متحقق' : 'Verified', language === 'ar' ? 'مشترك في النشرة' : 'Newsletter', language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date', language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'],
      ...filteredUsers.map(user => [
        user.firstName,
        user.lastName,
        user.email,
        user.phone || '-',
        user.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive'),
        user.emailVerified ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
        user.subscribedToNewsletter ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
        new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'
      ])
    ];
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-report-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#DAA520]" />
              {language === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'ar' ? 'إدارة وتتبع جميع المستخدمين المسجلين' : 'Manage and track all registered users'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button
              onClick={exportToCSV}
              disabled={isLoading || filteredUsers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#DAA520] text-white rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {language === 'ar' ? 'تصدير' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'نشط' : 'Active'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'غير نشط' : 'Inactive'}
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'متحقق' : 'Verified'}
              </p>
              <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'غير متحقق' : 'Unverified'}
              </p>
              <p className="text-2xl font-bold text-orange-600">{stats.unverified}</p>
            </div>
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'ar' ? 'مشترك في النشرة' : 'Newsletter Subscribers'}
              </p>
              <p className="text-2xl font-bold text-[#DAA520]">{stats.subscribed}</p>
            </div>
            <Bell className="w-8 h-8 text-[#DAA520]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'البحث عن مستخدم...' : 'Search users...'}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
            >
              <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'التحقق' : 'Verification'}
            </label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
            >
              <option value="all">{language === 'ar' ? 'جميع المستخدمين' : 'All Users'}</option>
              <option value="verified">{language === 'ar' ? 'متحقق' : 'Verified'}</option>
              <option value="unverified">{language === 'ar' ? 'غير متحقق' : 'Unverified'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'النشرة الإخبارية' : 'Newsletter'}
            </label>
            <select
              value={newsletterFilter}
              onChange={(e) => setNewsletterFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="subscribed">{language === 'ar' ? 'مشترك' : 'Subscribed'}</option>
              <option value="unsubscribed">{language === 'ar' ? 'غير مشترك' : 'Unsubscribed'}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setVerificationFilter('all');
                setNewsletterFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#DAA520] mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'ar' ? 'جاري تحميل المستخدمين...' : 'Loading users...'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'المستخدم' : 'User'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'النشرة الإخبارية' : 'Newsletter'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#DAA520] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getUserInitials(user)
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.emailVerified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ {language === 'ar' ? 'متحقق' : 'Verified'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠ {language === 'ar' ? 'غير متحقق' : 'Unverified'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            {language === 'ar' ? 'نشط' : 'Active'}
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            {language === 'ar' ? 'غير نشط' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.subscribedToNewsletter ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#DAA520]/10 text-[#DAA520] border border-[#DAA520]/20">
                          <Bell className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'مشترك' : 'Subscribed'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <BellOff className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'غير مشترك' : 'Not Subscribed'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              // Fetch full user details including addresses
                              const response = await fetch(`/api/admin/users/${user.id}`, {
                                credentials: 'include'
                              });
                              if (response.ok) {
                                const data = await response.json();
                                if (data.success && data.data?.user) {
                                  setSelectedUser(data.data.user);
                                  setShowUserModal(true);
                                } else {
                                  // Fallback to basic user data
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }
                              } else {
                                // Fallback to basic user data
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }
                            } catch (error) {
                              console.error('Error fetching user details:', error);
                              // Fallback to basic user data
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'ar' ? 'لا توجد مستخدمين' : 'No users found'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {language === 'ar' ? 'تفاصيل المستخدم' : 'User Details'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#DAA520] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {selectedUser.avatar ? (
                      <img 
                        src={selectedUser.avatar} 
                        alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('span')) {
                            const span = document.createElement('span');
                            span.textContent = getUserInitials(selectedUser);
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      getUserInitials(selectedUser)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 break-words overflow-wrap-anywhere">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h4>
                    <p className="text-gray-600 break-words overflow-wrap-anywhere">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedUser.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <UserX className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'غير نشط' : 'Inactive'}
                        </span>
                      )}
                      {selectedUser.emailVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ {language === 'ar' ? 'متحقق' : 'Verified'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠ {language === 'ar' ? 'غير متحقق' : 'Unverified'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </p>
                      <p className="text-gray-900 break-words overflow-wrap-anywhere">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {language === 'ar' ? 'الهاتف' : 'Phone'}
                      </p>
                      <p className="text-gray-900 break-words overflow-wrap-anywhere">{selectedUser.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="flex items-center gap-3">
                  {selectedUser.subscribedToNewsletter ? (
                    <Bell className="w-5 h-5 text-[#DAA520]" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'الاشتراك في النشرة الإخبارية' : 'Newsletter Subscription'}
                    </p>
                    <p className={`text-sm font-semibold ${
                      selectedUser.subscribedToNewsletter ? 'text-[#DAA520]' : 'text-gray-600'
                    }`}>
                      {selectedUser.subscribedToNewsletter
                        ? (language === 'ar' ? '✓ مشترك' : '✓ Subscribed')
                        : (language === 'ar' ? 'غير مشترك' : 'Not Subscribed')}
                    </p>
                  </div>
                </div>

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {language === 'ar' ? 'العناوين' : 'Addresses'}
                    </h4>
                    <div className="space-y-3">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-0">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {address.isDefault && (
                              <span className="inline-block mb-2 px-2 py-0.5 bg-[#DAA520] text-white text-xs font-semibold rounded">
                                {language === 'ar' ? 'افتراضي' : 'Default'}
                              </span>
                            )}
                            <div className="space-y-1 text-sm">
                              {address.name && (
                                <p className="font-medium text-gray-900 break-words overflow-wrap-anywhere">{address.name}</p>
                              )}
                              {address.address && (
                                <p className="text-gray-700 break-words overflow-wrap-anywhere whitespace-pre-wrap">{address.address}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-gray-600">
                                {address.city && (
                                  <span className="break-words overflow-wrap-anywhere">{address.city}</span>
                                )}
                                {address.postalCode && (
                                  <span className="break-words overflow-wrap-anywhere">{address.postalCode}</span>
                                )}
                              </div>
                              {address.phone && (
                                <p className="text-gray-600 text-xs break-words overflow-wrap-anywhere">
                                  {language === 'ar' ? 'هاتف:' : 'Phone:'} {address.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}
                      </p>
                      <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                  {selectedUser.lastLoginAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}
                        </p>
                        <p className="text-gray-900">{formatDate(selectedUser.lastLoginAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedUser.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedUser.isActive 
                    ? (language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate')
                    : (language === 'ar' ? 'تفعيل' : 'Activate')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
