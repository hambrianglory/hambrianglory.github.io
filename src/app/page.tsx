'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Users, FileText, CreditCard, Settings, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
                <Image
                  src="/logo.png"
                  alt="Hambrian Glory Logo"
                  width={48}
                  height={48}
                  className="rounded-2xl object-cover shadow-md"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Hambrian Glory</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Fee Management System</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Link
                href="/login"
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Log in</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Community Logo */}
          <div className="mb-6 sm:mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 relative bg-gradient-to-br from-blue-50 to-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-blue-100">
              <Image
                src="/logo.png"
                alt="Hambrian Glory Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Welcome to <span className="text-blue-600 block sm:inline">Hambrian Glory</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Your one-stop solution for managing community fees, tracking payments, 
            and staying connected with your neighbors.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-4 px-4">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <LogIn className="w-5 h-5" />
              <span>Member Login</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center space-x-2 border-2 border-blue-600 text-blue-600 px-6 py-3 sm:px-8 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto"
            >
              <Users className="w-5 h-5" />
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">System Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              Everything you need to manage your community efficiently and transparently
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Tracking</h3>
              <p className="text-gray-600 text-sm">
                Track all payments, dues, and financial transactions with detailed records
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excel Integration</h3>
              <p className="text-gray-600 text-sm">
                Import and export data seamlessly with Excel spreadsheets
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Management</h3>
              <p className="text-gray-600 text-sm">
                Manage all community members with individual login credentials
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Alerts</h3>
              <p className="text-gray-600 text-sm">
                Automated payment reminders and community updates via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Overview</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">LKR 12L+</div>
              <div className="text-gray-600">Funds Collected</div>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">LKR 8L+</div>
              <div className="text-gray-600">Community Improvements</div>
            </div>
            
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Payment Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">Hambrian Glory</span>
              </div>
              <p className="text-gray-400">
                Building a better community through transparency, efficiency, and seamless communication.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/committee" className="hover:text-white transition-colors">Committee Members</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Community News</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Member Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 admin@hambrianglory.com</p>
                <p>📞 +94 11 234 5678</p>
                <p>📍 Hambrian Glory, Colombo 03, Sri Lanka</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hambrian Glory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
