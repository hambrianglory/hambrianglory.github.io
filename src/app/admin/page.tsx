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
  
  // User Management State
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Account Management State
  const [lockedUsers, setLockedUsers] = useState<string[]>([]);
  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    apiKey: '',
    phoneNumber: '',
    template: 'Hello {name}, your payment of LKR {amount} is due.'
  });
  
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
      
      console.log('Loading locked users...');
      const locked = await localDB.getLockedUsers();
      console.log('Locked users:', locked.length);
      setLockedUsers(locked.map(u => u.id));
      
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
        csvContent = 'id,name,email,phone,nicNumber,dateOfBirth,address,role,houseNumber,membershipDate,isActive\n';
        members.forEach(member => {
          const dateOfBirth = member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '';
          const membershipDate = member.membershipDate ? new Date(member.membershipDate).toISOString().split('T')[0] : '';
          csvContent += `"${member.id}","${member.name}","${member.email}","${member.phone}","${member.nicNumber || ''}","${dateOfBirth}","${member.address || ''}","${member.role}","${member.houseNumber || ''}","${membershipDate}","${member.isActive}"\n`;
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
                onClick={() => setActiveTab('accountManagement')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'accountManagement'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Management
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'whatsapp'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('dataSync')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'dataSync'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Sync
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
                  <p className="text-sm text-gray-600">Manage member accounts ({filteredMembers.length} of {members.length} members)</p>
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
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md">
                  <span className="text-sm text-blue-800">
                    {selectedUsers.length} member(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${selectedUsers.length} selected member(s)?`)) {
                          for (const userId of selectedUsers) {
                            await localDB.deleteUser(userId);
                          }
                          setSelectedUsers([]);
                          await loadData();
                        }
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Selection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectAll(checked);
                          if (checked) {
                            setSelectedUsers(filteredMembers.map(m => m.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className={selectedUsers.includes(member.id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, member.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== member.id));
                              setSelectAll(false);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      {editingMember === member.id ? (
                        // Edit Mode Row
                        <>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="Name"
                              />
                              <input
                                type="email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="Email"
                              />
                              <select
                                value={editForm.role || 'member'}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value as 'admin' | 'member'})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="Phone"
                              />
                              <input
                                type="text"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="Address"
                              />
                              <input
                                type="text"
                                value={editForm.houseNumber || ''}
                                onChange={(e) => setEditForm({...editForm, houseNumber: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="House Number"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.nicNumber || ''}
                                onChange={(e) => setEditForm({...editForm, nicNumber: e.target.value})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="NIC Number"
                              />
                              <input
                                type="number"
                                value={editForm.amount || 0}
                                onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                                className="block w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                                placeholder="Amount"
                              />
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive !== false}
                                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">Active</span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await localDB.updateUser(member.id, editForm);
                                    setEditingMember(null);
                                    setEditForm({});
                                    await loadData();
                                  } catch (error) {
                                    alert('Failed to update user');
                                  }
                                }}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMember(null);
                                  setEditForm({});
                                }}
                                className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode Row
                        <>
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
                              <div className="text-sm text-gray-500">Amount: Rs. {member.amount || 0}</div>
                              <div className="text-sm">
                                Status: <span className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                                  {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {lockedUsers.includes(member.id) && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Locked
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMember(member.id);
                                  setEditForm(member);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete ${member.name}?`)) {
                                    try {
                                      await localDB.deleteUser(member.id);
                                      await loadData();
                                    } catch (error) {
                                      alert('Failed to delete user');
                                    }
                                  }
                                }}
                                className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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

        {/* Account Management Tab */}
        {activeTab === 'accountManagement' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
              <p className="text-sm text-gray-600">Manage user account security and access</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Locked Users Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Locked Accounts</h3>
                  {lockedUsers.length > 0 ? (
                    <div className="space-y-2">
                      {lockedUsers.map(userId => {
                        const user = members.find(m => m.id === userId);
                        return user ? (
                          <div key={userId} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-medium text-sm">
                                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setLockedUsers(lockedUsers.filter(id => id !== userId));
                                alert(`Account for ${user.name} has been unlocked.`);
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Unlock</span>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No locked accounts</p>
                    </div>
                  )}
                </div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Failed Login Attempts Limit</h4>
                        <p className="text-sm text-gray-600">Users will be locked after this many failed attempts</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="3">3 attempts</option>
                        <option value="5" selected>5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Auto-unlock Period</h4>
                        <p className="text-sm text-gray-600">Automatically unlock accounts after this period</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="15">15 minutes</option>
                        <option value="30" selected>30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="0">Manual unlock only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Test Lock Account */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Test Account Lock</h3>
                  <div className="flex items-center space-x-3">
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) => {
                        if (e.target.value && !lockedUsers.includes(e.target.value)) {
                          setLockedUsers([...lockedUsers, e.target.value]);
                          const user = members.find(m => m.id === e.target.value);
                          alert(`Account for ${user?.name} has been locked for testing.`);
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="">Select user to lock...</option>
                      {members.filter(m => !lockedUsers.includes(m.id)).map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h2>
              <p className="text-sm text-gray-600">Configure WhatsApp notifications for payment reminders</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* WhatsApp Settings */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Enable WhatsApp Notifications</h4>
                        <p className="text-sm text-gray-600">Send automated payment reminders via WhatsApp</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappSettings.enabled}
                          onChange={(e) => setWhatsappSettings({...whatsappSettings, enabled: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Business API Phone Number
                      </label>
                      <input
                        type="text"
                        value={whatsappSettings.phoneNumber}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, phoneNumber: e.target.value})}
                        placeholder="+94xxxxxxxxx"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={whatsappSettings.apiKey}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, apiKey: e.target.value})}
                        placeholder="Enter your WhatsApp Business API key"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Template
                      </label>
                      <textarea
                        rows={4}
                        value={whatsappSettings.template}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, template: e.target.value})}
                        placeholder="Hello {name}, your payment of LKR {amount} is due."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{name}'}, {'{amount}'}, {'{dueDate}'}, {'{houseNumber}'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test WhatsApp */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Test Message</h3>
                  <div className="flex items-center space-x-3">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select user to send test message...</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.phone})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => alert('Test message sent! (Demo mode - no actual message sent)')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      disabled={!whatsappSettings.enabled}
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Send Test
                    </button>
                  </div>
                </div>

                {/* Bulk Send */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Bulk Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => alert('Payment reminders sent to all overdue members! (Demo mode)')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        disabled={!whatsappSettings.enabled}
                      >
                        Send Overdue Reminders
                      </button>
                      <button
                        onClick={() => alert('Payment confirmations sent to all paid members! (Demo mode)')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        disabled={!whatsappSettings.enabled}
                      >
                        Send Payment Confirmations
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Note: This is a demo environment. In production, these would integrate with WhatsApp Business API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sync Tab */}
        {activeTab === 'dataSync' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Data Synchronization</h2>
              <p className="text-sm text-gray-600">Backup and sync your data across devices</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Export/Backup Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Export Data</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Create Full Database Backup</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Export all your data (users, payments, settings) to a file that can be imported on another device.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const backup = await localDB.createBackup();
                            if (backup.success && backup.data && backup.filename) {
                              const blob = new Blob([backup.data], { type: 'application/json' });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = backup.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              alert('Database backup created successfully!');
                            } else {
                              alert(`Failed to create backup: ${backup.error}`);
                            }
                          } catch (error) {
                            alert('Failed to create backup');
                          }
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Backup</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Import Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Import Data</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Restore from Backup</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Upload a backup file to restore or merge data from another device. Existing data will be preserved and merged.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept=".json"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const text = await file.text();
                                const result = await localDB.importDatabase(text, true);
                                
                                if (result.success) {
                                  alert(`Database imported successfully!\n\nStats:\n- Added Users: ${result.stats.addedUsers}\n- Updated Users: ${result.stats.updatedUsers}\n- Added Payments: ${result.stats.addedPayments}\n- Total Users: ${result.stats.totalUsers}`);
                                  await loadData(); // Reload the admin data
                                } else {
                                  alert(`Import failed: ${result.message}`);
                                }
                              } catch (error) {
                                alert('Failed to read backup file');
                              }
                              e.target.value = '';
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                        <p className="text-xs text-green-600">
                          Supported format: JSON backup files created by this system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sync Instructions */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Cross-Device Sync Instructions</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="space-y-3 text-sm text-yellow-800">
                      <p><strong>To sync data between devices:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>On the source device: Click "Download Backup" to export your data</li>
                        <li>Transfer the backup file to your target device (email, cloud storage, etc.)</li>
                        <li>On the target device: Log in as admin and go to Data Sync tab</li>
                        <li>Click "Choose File" and select your backup file</li>
                        <li>The system will merge the data automatically</li>
                      </ol>
                      <p className="text-xs mt-3">
                        <strong>Note:</strong> Data is stored locally in your browser. Regular backups ensure you don't lose important information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Storage Stats */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Storage Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="text-2xl font-bold text-gray-900">{members.length}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="text-2xl font-bold text-gray-900">{loginHistory.length}</div>
                      <div className="text-sm text-gray-600">Login Records</div>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round((localStorage.getItem('community_fee_data')?.length || 0) / 1024)}KB
                      </div>
                      <div className="text-sm text-gray-600">Storage Used</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await localDB.addUser({
                    ...addMemberForm,
                    id: `user_${Date.now()}`,
                    password: localDB.hashPassword(addMemberForm.phone || '123456'),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  } as User);
                  
                  setShowAddMemberModal(false);
                  setAddMemberForm({
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
                  await loadData();
                  alert('Member added successfully!');
                } catch (error) {
                  alert('Failed to add member. Please check all fields.');
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={addMemberForm.name}
                    onChange={(e) => setAddMemberForm({...addMemberForm, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={addMemberForm.email}
                    onChange={(e) => setAddMemberForm({...addMemberForm, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={addMemberForm.phone}
                    onChange={(e) => setAddMemberForm({...addMemberForm, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    value={addMemberForm.nicNumber}
                    onChange={(e) => setAddMemberForm({...addMemberForm, nicNumber: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={addMemberForm.address}
                    onChange={(e) => setAddMemberForm({...addMemberForm, address: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                  <input
                    type="text"
                    value={addMemberForm.houseNumber}
                    onChange={(e) => setAddMemberForm({...addMemberForm, houseNumber: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm({...addMemberForm, role: e.target.value as 'admin' | 'member'})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={addMemberForm.amount || 0}
                    onChange={(e) => setAddMemberForm({...addMemberForm, amount: parseFloat(e.target.value) || 0})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={addMemberForm.isActive !== false}
                  onChange={(e) => setAddMemberForm({...addMemberForm, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Active Member</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
