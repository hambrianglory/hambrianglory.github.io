'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/lib/localDatabase';
import { localDB } from '@/lib/localDatabase';
import { logout } from '@/lib/auth';
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
  
  // Login History State
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginStats, setLoginStats] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [historyRoleFilter, setHistoryRoleFilter] = useState('all');
  
  const router = useRouter();

  // Load data from local database
  const loadData = async () => {
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
  };

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

  // Filter members based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        (member.nicNumber && member.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'login-history') {
      loadLoginHistory();
    }
  }, [activeTab, historyDays, historyRoleFilter]);

  const handleLogout = () => {
    logout();
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
      console.log(`Starting ${type} file upload...`);
      const fileContent = await file.text();
      console.log('File content loaded, length:', fileContent.length);
      
      if (type.toLowerCase() === 'users') {
        console.log('Parsing users CSV...');
        const userData = await localDB.parseCSV(fileContent);
        console.log('Parsed users data:', userData.length, 'records');
        
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
      csvContent = 'name,email,phone,nicNumber,address,role,amount,status\n';
      csvContent += 'John Doe,john@example.com,+1234567890,123456789V,123 Street,member,150.00,paid\n';
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
        csvContent = 'Name,Email,Phone,NIC,Address,Role,Amount,Status,Payment Date\n';
        members.forEach(member => {
          csvContent += `"${member.name}","${member.email}","${member.phone}","${member.nicNumber || ''}","${member.address || ''}","${member.role}","${member.amount || ''}","${member.status || ''}","${member.paymentDate || ''}"\n`;
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
      console.log('Downloading login history as', format);
      const data = await localDB.downloadLoginHistory(format, historyDays, historyRoleFilter);
      console.log('Login history data generated, length:', data.length);
      
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `login_history_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Login history download completed');
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download login history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Debug function to check database status
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={checkDatabaseStatus}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded border"
                title="Check Database Status"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Debug DB</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'data-management', label: 'Data Management', icon: FileText },
              { id: 'login-history', label: 'Login History', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Collected</p>
                      <p className="text-2xl font-bold">Rs. {stats?.totalCollected || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending Payments</p>
                      <p className="text-2xl font-bold">{stats?.pendingPayments || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Community Balance</p>
                      <p className="text-2xl font-bold">Rs. {stats?.communityBalance || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Members Management</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.status === 'paid' ? 'bg-green-100 text-green-800' :
                              member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {member.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {member.amount || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data-management' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Data Import/Export</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Import Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm text-gray-600">Upload Users Data (CSV)</span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileUpload(e, 'Users')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm text-gray-600">Upload Payments Data (CSV)</span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileUpload(e, 'Payments')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('users', 'csv')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Users (CSV)</span>
                      </button>
                      
                      <button
                        onClick={() => exportData('payments', 'csv')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Payments (CSV)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Templates Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Templates</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => downloadTemplate('users')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Users Template</span>
                    </button>
                    
                    <button
                      onClick={() => downloadTemplate('payments')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Payments Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === 'login-history' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
