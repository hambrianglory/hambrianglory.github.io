'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, AlertCircle, Key, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use minimal login endpoint to bypass complex dependencies
      const apiUrl = '/api/auth/minimal-login';
      
      console.log('Attempting login to:', apiUrl); // Debug log
      console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status); // Debug log
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        console.log('Authentication failed with debug info:', data.debug); // Debug log
        if (data.debug) {
          setError(`Authentication failed. Debug info: ${JSON.stringify(data.debug, null, 2)}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      if (data.success) {
        if (data.requiresPasswordChange) {
          setRequiresPasswordChange(true);
          setError('You are using a temporary password. Please change it to continue.');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Network error: ${errorMessage}. Please check if environment variables are set.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          oldPassword: password,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordChangeSuccess(true);
        setError('');
        setTimeout(() => {
          setRequiresPasswordChange(false);
          setPasswordChangeSuccess(false);
          setPassword(newPassword);
          setNewPassword('');
          setConfirmPassword('');
          handleLoginAfterPasswordChange();
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAfterPasswordChange = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-2 shadow-lg border border-blue-100">
              <Image
                src="/logo.png"
                alt="Hambrian Glory Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Hambrian Glory</h1>
              <p className="text-xs sm:text-sm text-gray-500">Fee Management System</p>
            </div>
          </Link>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-sm sm:text-base">Sign in to your community account</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-6 shadow-lg rounded-lg">
          {passwordChangeSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">Password changed successfully! Logging you in...</span>
            </div>
          )}

          {!requiresPasswordChange ? (
            /* Login Form */
            <>
            {/* Login Instructions */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Login Instructions:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> Use admin@hambriangLory.com / Admin@2025</p>
                <p><strong>Members:</strong> Use your email and NIC number as password</p>
                <p className="text-blue-600">Example: john@example.com / 123456789V</p>
              </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && !requiresPasswordChange && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password (NIC number for first login)"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  First time login? Use your NIC number as password
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
            </>
          ) : (
            /* Password Change Form */
            <form className="space-y-6" onSubmit={handlePasswordChange}>
              <div className="text-center mb-6">
                <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Change Your Password</h3>
                <p className="text-sm text-gray-600">You're using a temporary password. Please create a new secure password.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your new password"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your new password"
                    style={{ color: '#111827', backgroundColor: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequiresPasswordChange(false);
                  setError('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
