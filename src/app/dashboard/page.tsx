'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User as UserType } from '@/types';
import ProfilePicture from '@/components/ProfilePicture';
import {
  CreditCard,
  FileText,
  Bell,
  User,
  LogOut,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  nicNumber?: string;
  houseNumber?: string;
  membershipDate?: Date;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentType: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface CommunityBalance {
  totalBalance: number;
  totalCollected: number;
  totalExpenses: number;
  pendingPayments: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [communityBalance, setCommunityBalance] = useState<CommunityBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch user data from API
  const fetchUserData = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: { users: [...] } or direct array
        const users = data.users || data;
        const foundUser = users.find((u: UserType) => u.id === userId);
        if (foundUser) {
          console.log('Found user data:', foundUser); // Debug log
          // Ensure dates are properly parsed
          const processedUser = {
            ...foundUser,
            dateOfBirth: foundUser.dateOfBirth ? new Date(foundUser.dateOfBirth) : null,
            membershipDate: foundUser.membershipDate ? new Date(foundUser.membershipDate) : null,
            // Handle null strings - only convert actual "null" strings, not missing fields
            phone: foundUser.phone === 'null' ? null : foundUser.phone,
            address: foundUser.address === 'null' ? null : foundUser.address,
            houseNumber: foundUser.houseNumber === 'null' ? null : foundUser.houseNumber,
          };
          
          console.log('Processed user data:', processedUser); // Debug log
          setUser(processedUser);
          // Update localStorage with complete user data
          localStorage.setItem('user', JSON.stringify(processedUser));
        } else {
          console.log('User not found in API response:', userId);
        }
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Get actual user data from localStorage or decode from token
    let actualUser;
    let tokenPayload;
    
    if (userData) {
      try {
        actualUser = JSON.parse(userData);
        // Ensure dates are properly parsed from localStorage
        if (actualUser.dateOfBirth) {
          actualUser.dateOfBirth = new Date(actualUser.dateOfBirth);
        }
        if (actualUser.membershipDate) {
          actualUser.membershipDate = new Date(actualUser.membershipDate);
        }
        // Handle null strings
        if (actualUser.phone === 'null') actualUser.phone = null;
        if (actualUser.address === 'null') actualUser.address = null;
        if (actualUser.houseNumber === 'null') actualUser.houseNumber = null;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        actualUser = null;
      }
    }
    
    if (!actualUser) {
      // Fallback: decode token to get user info if user data not in localStorage
      try {
        tokenPayload = JSON.parse(atob(token.split('.')[1]));
        actualUser = {
          id: tokenPayload.userId,
          name: 'Loading...', // This will be resolved by fetching user data
          email: tokenPayload.email,
          role: tokenPayload.role
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        router.push('/login');
        return;
      }
    }

    // If we don't have complete user data, fetch it from the API
    if (!actualUser || !actualUser.name || actualUser.name === 'Loading...' || !actualUser.nicNumber) {
      if (actualUser?.id) {
        console.log('Fetching user data for ID:', actualUser.id); // Debug log
        fetchUserData(actualUser.id);
      }
    } else {
      console.log('Using existing user data:', actualUser); // Debug log
      setUser(actualUser);
    }

    const mockPendingPayments = [
      {
        id: 'payment_1',
        amount: 50000,
        paymentDate: new Date('2024-12-31'),
        paymentType: 'Annual Sanda Fee',
        description: 'Q4 2024 Sanda Fee payment',
        status: 'pending' as const
      }
    ];

    const mockRecentPayments = [
      {
        id: 'payment_2',
        amount: 50000,
        paymentDate: new Date('2024-09-30'),
        paymentType: 'Annual Sanda Fee',
        description: 'Q3 2024 Sanda Fee payment',
        status: 'completed' as const
      },
      {
        id: 'payment_3',
        amount: 50000,
        paymentDate: new Date('2024-06-30'),
        paymentType: 'Annual Sanda Fee',
        description: 'Q2 2024 Sanda Fee payment',
        status: 'completed' as const
      }
    ];

    const mockCommunityBalance = {
      totalBalance: 4500000,
      totalCollected: 12000000,
      totalExpenses: 7500000,
      pendingPayments: 1800000
    };

    // Note: User is set based on actual login data above
    setPendingPayments(mockPendingPayments);
    setRecentPayments(mockRecentPayments);
    setCommunityBalance(mockCommunityBalance);
    setLoading(false);
  }, [router]);

  const updateUser = (updatedUser: UserType) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUserData = async () => {
    if (user?.id) {
      setLoading(true);
      await fetchUserData(user.id);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Record logout in history
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/admin/login-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'logout' })
        });
      }
    } catch (error) {
      console.error('Error recording logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-1.5 shadow-sm border border-blue-100">
                <Image
                  src="/logo.png"
                  alt="Hambrian Glory Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Hambrian Glory</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Member Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="hidden sm:flex items-center space-x-3">
                {user && (
                  <ProfilePicture 
                    user={user} 
                    onUpdate={updateUser}
                    size="small"
                    readOnly={false}
                  />
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Here&apos;s your community fee overview and recent activity.</p>
        </div>

        {/* Member Profile Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Member Profile</span>
            </h2>
            <button
              onClick={refreshUserData}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
            {user && (
              <ProfilePicture 
                user={user} 
                onUpdate={updateUser}
                size="large"
                readOnly={false}
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {user?.phone && <span>📞 {user.phone}</span>}
                {user?.role && (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                  </span>
                )}
                {user?.membershipDate && (
                  <span>📅 Member since {new Date(user.membershipDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Personal Information</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm text-gray-900 break-all">{user?.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm text-gray-900">
                    {user?.phone && user.phone !== 'null' && user.phone.trim() !== '' ? user.phone : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Identity & Address</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">NIC Number</p>
                  <p className="text-sm font-medium text-gray-900">{user?.nicNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">House Number</p>
                  <p className="text-sm text-gray-900">
                    {user?.houseNumber && user.houseNumber !== 'null' && user.houseNumber.trim() !== '' ? user.houseNumber : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {user?.address && user.address !== 'null' && user.address.trim() !== '' ? user.address : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Membership Details</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user?.role === 'admin' ? '👑 Administrator' : '👤 Community Member'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm text-gray-900">
                    {user?.membershipDate ? new Date(user.membershipDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Status</p>
                  <p className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-xs text-gray-600 font-mono">{user?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                  LKR {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Community Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                  LKR {communityBalance?.totalBalance.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                  LKR {communityBalance?.totalCollected.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">My Payments</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{recentPayments.length}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Pending Payments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Pending Payments</span>
              </h2>
            </div>
            <div className="p-6">
              {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{payment.paymentType}</h3>
                          <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {payment.paymentDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">LKR {payment.amount.toLocaleString()}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                          Pay Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No pending payments</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>Recent Payments</span>
              </h2>
            </div>
            <div className="p-6">
              {recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{payment.paymentType}</h3>
                          <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Paid: {payment.paymentDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">LKR {payment.amount.toLocaleString()}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment history</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            href="/blog"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Community News</h3>
                <p className="text-xs sm:text-sm text-gray-600">Read latest updates</p>
              </div>
            </div>
          </Link>

          <Link
            href="/committee"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Committee</h3>
                <p className="text-xs sm:text-sm text-gray-600">View members</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => window.open('https://wa.me/94112345678', '_blank')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-xs sm:text-sm text-gray-600">Contact management</p>
              </div>
            </div>
          </button>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Payment History</h3>
                <p className="text-xs sm:text-sm text-gray-600">View records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
