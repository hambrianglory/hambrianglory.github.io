'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/lib/localDatabase';
import { localDB } from '@/lib/localDatabase';
import { logout } from '@/lib/auth';
import { LOGO_PATH } from '@/lib/assets';
import {
  Home,
  Users,
  CreditCard,
  FileText,
  Upload,
  Download,
  Settings,
  LogOut,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Bell,
  BarChart3,
  MessageSquare,
  Edit,
  Save,
  X,
  Trash2,
  Search,
  Plus,
  UserPlus,
  Clock,
  Shield,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AdminStats {
  totalMembers: number;
  totalCollected: number;
  pendingPayments: number;
  totalExpenses: number;
  communityBalance: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    nicNumber: '',
    dateOfBirth: new Date(),
    address: '',
    role: 'member',
    houseNumber: '',
    isActive: true
  });
  
  // Login History State
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginStats, setLoginStats] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [historyRoleFilter, setHistoryRoleFilter] = useState('all');
  
  const router = useRouter();

  // Filter members based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        (member.nicNumber && member.nicNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.houseNumber && member.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [members, searchTerm]);

  const loadData = useCallback(async () => {
    try {
      console.log('Loading admin data...');
      
      // Initialize database first
      console.log('Initializing database...');
      await localDB.initializeDatabase();
      
      console.log('Loading users...');
      const allUsers = await localDB.getAllUsers();
      console.log('Users loaded:', allUsers.length);
      
      setMembers(allUsers);
      setFilteredMembers(allUsers);
      
      console.log('Loading statistics...');
      const dbStats = await localDB.getStats();
      console.log('Stats loaded:', dbStats);
      
      setStats({
        totalMembers: dbStats.totalUsers,
        totalCollected: dbStats.totalAmount,
        pendingPayments: dbStats.pendingUsers,
        totalExpenses: 0,
        communityBalance: dbStats.totalAmount
      });
      
      console.log('Admin data loaded successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert(`Failed to load admin data: ${error instanceof Error ? error.message : 'Unknown error'}. Check the browser console for details.`);
      setLoading(false);
    }
  }, []);

  // Load login history
  const loadLoginHistory = async () => {
    setHistoryLoading(true);
    try {
      console.log('Loading login history...');
      console.log('Days:', historyDays, 'Role filter:', historyRoleFilter);
      
      const result = await localDB.getLoginHistoryWithStats(historyDays, historyRoleFilter, 50, 0);
      console.log('Login history result:', result);
      
      setLoginHistory(result.history || []);
      setLoginStats(result.stats);
      
      console.log('Login history loaded successfully');
    } catch (error) {
      console.error('Error loading login history:', error);
      alert(`Failed to load login history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoginHistory([]);
      setLoginStats(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, loadData]);

  useEffect(() => {
    if (activeTab === 'loginHistory') {
      loadLoginHistory();
    }
  }, [activeTab, historyDays, historyRoleFilter]);

  const handleLogout = () => {
    logout();
  };

  const checkDatabaseStatus = async () => {
    try {
      console.log('=== DATABASE STATUS CHECK ===');
      
      // Run health check
      const healthCheck = await localDB.checkDatabaseHealth();
      console.log('Health check result:', healthCheck);
      
      // Check localStorage
      const storageData = localStorage.getItem('cfms_encrypted_data');
      console.log('LocalStorage data exists:', !!storageData);
      console.log('Storage data length:', storageData?.length || 0);
      
      // Check database contents
      const users = await localDB.getAllUsers();
      const payments = await localDB.getAllPayments();
      const loginHistory = await localDB.getLoginHistory();
      const stats = await localDB.getStats();
      
      console.log('Users count:', users.length);
      console.log('Payments count:', payments.length);
      console.log('Login history count:', loginHistory.length);
      console.log('Stats:', stats);
      
      // Check sample data
      const adminUser = users.find(u => u.role === 'admin');
      console.log('Admin user exists:', !!adminUser);
      console.log('Admin email:', adminUser?.email);
      
      let alertMessage = `Database Status:
Users: ${users.length}
Payments: ${payments.length}
Login History: ${loginHistory.length}
Admin User: ${adminUser ? 'Found' : 'Missing'}
Storage Size: ${(storageData?.length || 0)} bytes

Health Check: ${healthCheck.isHealthy ? 'HEALTHY' : 'ISSUES FOUND'}`;

      if (!healthCheck.isHealthy) {
        alertMessage += `\n\nIssues:\n${healthCheck.issues.join('\n')}`;
      }

      alertMessage += '\n\nCheck the browser console for detailed information.';
      
      alert(alertMessage);
      
    } catch (error) {
      console.error('Database status check failed:', error);
      alert(`Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      alert('Please upload a valid CSV file.');
      return;
    }

    setLoading(true);
    try {
      console.log(`Uploading ${type} file:`, file.name);
      const fileContent = await file.text();
      console.log('File content length:', fileContent.length);
      
      if (type.toLowerCase() === 'users') {
        console.log('Parsing users CSV...');
        const userData = await localDB.parseCSV(fileContent);
        console.log('Parsed users data:', userData.length, 'records');
        console.log('Sample user data:', userData[0]);
        
        console.log('Importing users...');
        const results = await localDB.importUsers(userData);
        console.log('Import results:', results);
        
        let message = `Users imported successfully!\n`;
        message += `Added: ${results.added}, Updated: ${results.updated}\n`;
        if (results.errors.length > 0) {
          message += `Errors: ${results.errors.length}\n${results.errors.slice(0, 5).join('\n')}`;
          if (results.errors.length > 5) {
            message += `\n... and ${results.errors.length - 5} more errors`;
          }
        }
        
        alert(message);
        if (results.success) {
          console.log('Reloading data...');
          await loadData();
        }
      } else if (type.toLowerCase() === 'payments') {
        console.log('Parsing payments CSV...');
        const paymentData = await localDB.parseCSV(fileContent);
        console.log('Parsed payments data:', paymentData.length, 'records');
        
        console.log('Importing payments...');
        const results = await localDB.importPayments(paymentData);
        console.log('Import results:', results);
        
        let message = `Payments imported successfully!\n`;
        message += `Added: ${results.added}, Updated: ${results.updated}\n`;
        if (results.errors.length > 0) {
          message += `Errors: ${results.errors.length}\n${results.errors.slice(0, 5).join('\n')}`;
          if (results.errors.length > 5) {
            message += `\n... and ${results.errors.length - 5} more errors`;
          }
        }
        
        alert(message);
        if (results.success) {
          console.log('Reloading data...');
          await loadData();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}. Check the console for details.`);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = (type: 'users' | 'payments') => {
    let csvContent = '';
    
    if (type === 'users') {
      csvContent = 'name,email,phone,nicNumber,dateOfBirth,address,role,houseNumber,amount,status\n';
      csvContent += 'John Doe,john@example.com,+1234567890,123456789V,1990-01-01,123 Street,member,A-101,150.00,paid\n';
    } else {
      csvContent = 'email,amount,date,status,method,reference\n';
      csvContent += 'john@example.com,150.00,2025-01-15,paid,bank,TXN123\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportData = async (type: 'users' | 'payments', format: 'csv' | 'excel' = 'csv') => {
    try {
      let csvContent = '';
      
      if (type === 'users') {
        csvContent = 'Name,Email,Phone,NIC,Date of Birth,Address,House Number,Role,Amount,Status,Payment Date,Membership Date\n';
        members.forEach(member => {
          const dateOfBirth = member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '';
          const membershipDate = member.membershipDate ? new Date(member.membershipDate).toISOString().split('T')[0] : '';
          csvContent += `"${member.name}","${member.email}","${member.phone}","${member.nicNumber || ''}","${dateOfBirth}","${member.address || ''}","${member.houseNumber || ''}","${member.role}","${member.amount || ''}","${member.status || ''}","${member.paymentDate || ''}","${membershipDate}"\n`;
        });
      } else {
        const payments = await localDB.getAllPayments();
        csvContent = 'User Email,Amount,Date,Status,Method,Reference\n';
        payments.forEach(payment => {
          const user = members.find(m => m.id === payment.userId);
          csvContent += `"${user?.email || ''}","${payment.amount}","${payment.date}","${payment.status}","${payment.method}","${payment.reference || ''}"\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`${type} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data.');
    }
  };

  const downloadLoginHistory = async (format: 'csv' | 'json') => {
    try {
      const data = await localDB.downloadLoginHistory(format, historyDays, historyRoleFilter);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `login_history_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download login history.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-1 sm:p-1.5 shadow-sm border border-blue-100">
                <Image
                  src={LOGO_PATH}
                  alt="Hambrian Glory Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Hambrian Glory</h1>
                <p className="text-xs sm:text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 touch-target">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 touch-target">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 cursor-pointer touch-target" />
              <button
                onClick={checkDatabaseStatus}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded border"
                title="Check Database Status"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Debug DB</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 touch-target"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Admin Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Community Management Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage members, payments, and community operations.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('loginHistory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'loginHistory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Login History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats?.totalMembers}</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Collected</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      LKR {stats?.totalCollected.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">
                      LKR {stats?.pendingPayments.toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">
                      LKR {stats?.totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community Balance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      LKR {stats?.communityBalance.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Import Data</span>
                </h3>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Users Data (CSV)</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'Users')}
                      disabled={loading}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {loading ? 'Processing file...' : 'Supports CSV format'}
                    </p>
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Payments Data (CSV)</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'Payments')}
                      disabled={loading}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {loading ? 'Processing file...' : 'Supports CSV format'}
                    </p>
                  </label>
                  {loading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Processing file upload...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span>Export Data</span>
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => exportData('users', 'csv')}
                    className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    Export Users CSV
                  </button>
                  <button
                    onClick={() => exportData('payments', 'csv')}
                    className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Export Payments CSV
                  </button>
                  <hr className="my-2" />
                  <p className="text-xs text-gray-500 mb-2">Template Downloads:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadTemplate('users')}
                      className="bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-xs"
                    >
                      Users Template
                    </button>
                    <button
                      onClick={() => downloadTemplate('payments')}
                      className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                    >
                      Payments Template
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <span>WhatsApp Notifications</span>
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-orange-50 text-orange-700 py-2 px-4 rounded-lg hover:bg-orange-100 transition-colors text-sm">
                    Send Payment Reminders
                  </button>
                  <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                    Send Announcement
                  </button>
                  <button className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Notification Settings
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Quick Actions</span>
                </h3>
                <div className="space-y-3">
                  <Link href="/blog" className="block w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm text-center">
                    Manage Blog Posts
                  </Link>
                  <Link href="/committee" className="block w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm text-center">
                    Committee Members
                  </Link>
                  <Link href="/about" className="block w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm text-center">
                    Community Info
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Member Management Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Members</h2>
                  <p className="text-sm text-gray-600">View and edit member details ({filteredMembers.length} of {members.length} members)</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            <div className="text-xs text-gray-400">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{member.phone}</div>
                          <div className="text-sm text-gray-500">{member.address}</div>
                          {member.houseNumber && (
                            <div className="text-xs text-gray-400">House: {member.houseNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">NIC: {member.nicNumber}</div>
                          <div className="text-sm text-gray-500">DOB: {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">Since: {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            Status: <span className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {member.amount || 0}</div>
                        <div className="text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            member.status === 'paid' ? 'bg-green-100 text-green-800' :
                            member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {member.status || 'N/A'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === 'loginHistory' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Login History</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={historyDays}
                    onChange={(e) => setHistoryDays(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  
                  <select
                    value={historyRoleFilter}
                    onChange={(e) => setHistoryRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="admin">Admin Only</option>
                    <option value="member">Members Only</option>
                  </select>
                  
                  <button
                    onClick={() => downloadLoginHistory('csv')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {loginStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Logins</p>
                    <p className="text-2xl font-bold text-blue-900">{loginStats.totalLogins}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Successful</p>
                    <p className="text-2xl font-bold text-green-900">{loginStats.successfulLogins}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{loginStats.failedLogins}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Unique Users</p>
                    <p className="text-2xl font-bold text-purple-900">{loginStats.uniqueUsers}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading login history...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistory.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.success ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.failureReason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
