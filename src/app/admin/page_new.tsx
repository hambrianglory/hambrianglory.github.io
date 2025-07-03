'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';
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
  X
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
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Mock admin stats
    const mockStats = {
      totalMembers: 150,
      totalCollected: 1200000,
      pendingPayments: 180000,
      totalExpenses: 750000,
      communityBalance: 450000
    };

    setStats(mockStats);
    setLoading(false);
    
    // Load mock member data
    const mockMembers: User[] = [
      {
        id: 'admin_1',
        name: 'Community Admin',
        email: 'admin@hambrianglory.lk',
        phone: '+94112345678',
        nicNumber: '198512345678',
        dateOfBirth: new Date('1985-06-15'),
        address: 'Hambrian Glory Community Office',
        role: 'admin',
        membershipDate: new Date('2024-01-01'),
        isActive: true
      },
      {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+94112345679',
        nicNumber: '199012345678',
        dateOfBirth: new Date('1990-03-22'),
        address: '123 Galle Road, Colombo 03',
        role: 'member',
        houseNumber: 'A-101',
        membershipDate: new Date('2024-01-15'),
        isActive: true
      },
      {
        id: 'user_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+94112345680',
        nicNumber: '199212345678',
        dateOfBirth: new Date('1992-08-10'),
        address: '456 Marine Drive, Colombo 03',
        role: 'member',
        houseNumber: 'B-205',
        membershipDate: new Date('2024-02-01'),
        isActive: true
      },
      {
        id: 'user_3',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+94112345681',
        nicNumber: '198812345678',
        dateOfBirth: new Date('1988-12-05'),
        address: '789 Duplication Road, Colombo 03',
        role: 'member',
        houseNumber: 'C-302',
        membershipDate: new Date('2024-03-01'),
        isActive: true
      }
    ];
    
    setMembers(mockMembers);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      alert(`${type} file uploaded: ${file.name}`);
    }
  };

  const downloadTemplate = async (type: 'users' | 'payments') => {
    try {
      const response = await fetch(`/api/templates?type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`${type} template downloaded successfully!`);
      } else {
        alert('Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Failed to generate template');
    }
  };

  const handleEditMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setEditingMember(memberId);
      setEditForm({ ...member });
    }
  };

  const handleSaveMember = () => {
    if (editingMember && editForm) {
      setMembers(members.map(member => 
        member.id === editingMember 
          ? { ...member, ...editForm } as User 
          : member
      ));
      setEditingMember(null);
      setEditForm({});
      alert('Member details updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({});
  };

  const handleInputChange = (field: keyof User, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'dateOfBirth' || field === 'membershipDate' 
        ? new Date(value as string) 
        : value
    }));
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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Hambrian Glory</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <Home className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <CreditCard className="w-5 h-5" />
              </Link>
              <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Community Management Dashboard
          </h1>
          <p className="text-gray-600">Manage members, payments, and community operations.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Members
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalMembers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      LKR {stats?.totalCollected.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-red-600">
                      LKR {stats?.pendingPayments.toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-orange-600">
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
                    <span className="text-sm text-gray-600">Upload Users Excel</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'Users')}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Payments Excel</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, 'Payments')}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span>Export Data</span>
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm">
                    Export Users Data
                  </button>
                  <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    Export Payments Data
                  </button>
                  <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                    Export Financial Report
                  </button>
                  <hr className="my-2" />
                  <p className="text-xs text-gray-500 mb-2">Excel Templates:</p>
                  <button 
                    onClick={() => downloadTemplate('users')}
                    className="w-full bg-orange-50 text-orange-700 py-2 px-4 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                  >
                    Download Users Template
                  </button>
                  <button 
                    onClick={() => downloadTemplate('payments')}
                    className="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Download Payments Template
                  </button>
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
              <h2 className="text-lg font-semibold text-gray-900">All Members</h2>
              <p className="text-sm text-gray-600">View and edit member details</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Full Name"
                            />
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Email"
                            />
                          </div>
                        ) : (
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
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="tel"
                              value={editForm.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Phone"
                            />
                            <textarea
                              value={editForm.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Address"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-900">{member.phone}</div>
                            <div className="text-sm text-gray-500">{member.address}</div>
                            {member.houseNumber && (
                              <div className="text-xs text-gray-400">House: {member.houseNumber}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.nicNumber || ''}
                              onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="NIC Number"
                            />
                            <input
                              type="date"
                              value={editForm.dateOfBirth?.toISOString().split('T')[0] || ''}
                              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-900">NIC: {member.nicNumber}</div>
                            <div className="text-sm text-gray-500">DOB: {member.dateOfBirth.toLocaleDateString()}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={editForm.membershipDate?.toISOString().split('T')[0] || ''}
                              onChange={(e) => handleInputChange('membershipDate', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <input
                              type="text"
                              value={editForm.houseNumber || ''}
                              onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="House Number"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-900">Since: {member.membershipDate.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">
                              Status: <span className={member.isActive ? 'text-green-600' : 'text-red-600'}>
                                {member.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingMember === member.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveMember}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditMember(member.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
