'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import WhatsAppComponent from '@/components/WhatsAppComponent';
import ProfilePicture from '@/components/ProfilePicture';
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
  
  // Account Management State
  const [accountIssues, setAccountIssues] = useState<any[]>([]);
  const [filteredAccountIssues, setFilteredAccountIssues] = useState<any[]>([]);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  
  // Login History State
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginStats, setLoginStats] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [historyRoleFilter, setHistoryRoleFilter] = useState('all');
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  
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
        member.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.houseNumber && member.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [members, searchTerm]);

  // Filter account issues based on search term
  useEffect(() => {
    if (!accountSearchTerm.trim()) {
      setFilteredAccountIssues(accountIssues);
    } else {
      const filtered = accountIssues.filter(issue =>
        issue.userId.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        (issue.user && (
          issue.user.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
          issue.user.email.toLowerCase().includes(accountSearchTerm.toLowerCase())
        ))
      );
      setFilteredAccountIssues(filtered);
    }
  }, [accountIssues, accountSearchTerm]);

  const loadData = useCallback(async () => {
    try {
      // Fetch users from API
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const loadedMembers = data.users || [];
        setMembers(loadedMembers);
        setFilteredMembers(loadedMembers);
        
        // Update stats with actual member count
        const mockStats = {
          totalMembers: loadedMembers.length,
          totalCollected: 1200000,
          pendingPayments: 180000,
          totalExpenses: 750000,
          communityBalance: 450000
        };
        setStats(mockStats);
      } else {
        console.error('Failed to fetch users');
        setMembers([]);
        setFilteredMembers([]);
        // Keep stats with 0 members if API fails
        const mockStats = {
          totalMembers: 0,
          totalCollected: 1200000,
          pendingPayments: 180000,
          totalExpenses: 750000,
          communityBalance: 450000
        };
        setStats(mockStats);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setMembers([]);
      setFilteredMembers([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load initial data
    loadData();
  }, [router, loadData]);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const supportedFormats = ['xlsx', 'xls', 'csv'];
    
    if (!supportedFormats.includes(fileExtension || '')) {
      alert('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type.toLowerCase());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const { results } = result;
        const formatType = fileExtension === 'csv' ? 'Google Sheets (CSV)' : 'Excel';
        
        let successMessage = `${type} ${formatType} file processed successfully!\n\n`;
        successMessage += `📊 Processing Summary:\n`;
        successMessage += `• Total Processed: ${results.totalProcessed}\n`;
        successMessage += `• Added: ${results.added}\n`;
        successMessage += `• Updated: ${results.updated}\n`;
        
        if (results.errors && results.errors.length > 0) {
          successMessage += `• Errors: ${results.errors.length}\n\n`;
          successMessage += `⚠️ Error Details:\n${results.errors.join('\n')}`;
        }
        
        alert(successMessage);
        
        // Refresh the data if users were updated
        if (type.toLowerCase() === 'users' && results.success) {
          await loadData(); // Reload the data instead of full page refresh
        }
      } else {
        let errorMessage = `Failed to process ${type} file.\n\n`;
        
        if (result.validationErrors && result.validationErrors.length > 0) {
          errorMessage += `Validation Errors:\n${result.validationErrors.join('\n')}`;
        } else {
          errorMessage += `Error: ${result.error}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const downloadTemplate = async (type: 'users' | 'payments', format: 'excel' | 'csv' = 'excel') => {
    try {
      const response = await fetch(`/api/templates?type=${type}&format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'csv' ? 'csv' : 'xlsx';
        a.download = `${type}_template.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        const formatName = format === 'csv' ? 'Google Sheets (CSV)' : 'Excel';
        alert(`${type} template downloaded successfully as ${formatName}!`);
      } else {
        alert('Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Failed to generate template');
    }
  };

  const exportUsersData = async (format: 'excel' | 'csv' = 'excel') => {
    try {
      // Use current members data (including manually added ones)
      const exportData = members.map(member => ({
        'Full Name': member.name,
        'Email': member.email,
        'Phone': member.phone,
        'NIC Number': member.nicNumber,
        'Date of Birth': new Date(member.dateOfBirth).toISOString().split('T')[0],
        'Address': member.address,
        'House Number': member.houseNumber || '',
        'Role': member.role,
        'Membership Date': new Date(member.membershipDate).toISOString().split('T')[0],
        'Status': member.isActive ? 'Active' : 'Inactive'
      }));

      if (format === 'csv') {
        // Export as CSV
        const csvContent = [
          Object.keys(exportData[0]).join(','),
          ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hambrian_glory_members_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Export as Excel via API
        const response = await fetch('/api/export/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ users: exportData }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hambrian_glory_members_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          throw new Error('Failed to export Excel file');
        }
      }

      const formatName = format === 'csv' ? 'CSV' : 'Excel';
      alert(`Users data exported successfully as ${formatName}! (${members.length} members included)`);
    } catch (error) {
      console.error('Error exporting users data:', error);
      
      // Fallback to CSV if Excel export fails
      if (format === 'excel') {
        alert('Excel export failed. Falling back to CSV export...');
        exportUsersData('csv');
        return;
      }
      
      alert('Failed to export users data');
    }
  };

  const exportPaymentsData = async () => {
    // For now, export a sample structure since we don't have actual payment data
    try {
      const samplePaymentData = [
        {
          'Member Name': 'Sample Member',
          'Email': 'sample@example.com',
          'Amount': '5000',
          'Payment Date': new Date().toISOString().split('T')[0],
          'Payment Type': 'Monthly Fee',
          'Status': 'Paid',
          'Reference': 'REF001'
        }
      ];

      const csvContent = [
        Object.keys(samplePaymentData[0]).join(','),
        ...samplePaymentData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hambrian_glory_payments_template_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Payment data template exported successfully!');
    } catch (error) {
      console.error('Error exporting payment data:', error);
      alert('Failed to export payment data');
    }
  };

  const exportFinancialReport = async () => {
    try {
      const reportData = [
        {
          'Category': 'Total Members',
          'Value': members.length,
          'Details': 'Current active and inactive members'
        },
        {
          'Category': 'Total Collected',
          'Value': stats?.totalCollected || 0,
          'Details': 'LKR amount collected to date'
        },
        {
          'Category': 'Pending Payments', 
          'Value': stats?.pendingPayments || 0,
          'Details': 'LKR amount pending collection'
        },
        {
          'Category': 'Total Expenses',
          'Value': stats?.totalExpenses || 0,
          'Details': 'LKR amount spent on community'
        },
        {
          'Category': 'Community Balance',
          'Value': stats?.communityBalance || 0,
          'Details': 'Current available balance'
        }
      ];

      const csvContent = [
        Object.keys(reportData[0]).join(','),
        ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hambrian_glory_financial_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Financial report exported successfully!');
    } catch (error) {
      console.error('Error exporting financial report:', error);
      alert('Failed to export financial report');
    }
  };

  const handleEditMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setEditingMember(memberId);
      setEditForm({ ...member });
    }
  };

  const handleSaveMember = async () => {
    if (editingMember && editForm) {
      try {
        // Update member in backend
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingMember,
            ...editForm
          }),
        });

        if (response.ok) {
          // Update local state only if backend update was successful
          setMembers(members.map(member => 
            member.id === editingMember 
              ? { ...member, ...editForm } as User 
              : member
          ));
          setEditingMember(null);
          setEditForm({});
          alert('Member details updated successfully!');
          
          // Reload data to ensure consistency
          loadData();
        } else {
          const errorData = await response.json();
          alert(`Failed to update member: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error updating member:', error);
        alert('Failed to update member. Please try again.');
      }
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

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete member "${memberName}"? This action cannot be undone.`)) {
      try {
        // Delete member from backend
        const response = await fetch(`/api/users?id=${memberId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Update local state only if backend deletion was successful
          const updatedMembers = members.filter(member => member.id !== memberId);
          setMembers(updatedMembers);
          setFilteredMembers(updatedMembers.filter(member =>
            !searchTerm.trim() ||
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm) ||
            member.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.houseNumber && member.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase())
          ));
          
          // Update stats with new member count
          setStats(prev => prev ? {
            ...prev,
            totalMembers: updatedMembers.length
          } : null);
          
          // If we were editing this member, cancel the edit
          if (editingMember === memberId) {
            setEditingMember(null);
            setEditForm({});
          }
          
          alert(`Member "${memberName}" has been deleted successfully.`);
          
          // Reload data to ensure consistency
          loadData();
        } else {
          const errorData = await response.json();
          alert(`Failed to delete member: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
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
  };

  const handleAddMemberInputChange = (field: keyof User, value: string | boolean | Date) => {
    setAddMemberForm(prev => ({
      ...prev,
      [field]: field === 'dateOfBirth' && typeof value === 'string' 
        ? new Date(value) 
        : value
    }));
  };

  const handleSaveNewMember = async () => {
    // Validate required fields
    if (!addMemberForm.name || !addMemberForm.email || !addMemberForm.phone || !addMemberForm.nicNumber) {
      alert('Please fill in all required fields (Name, Email, Phone, NIC Number)');
      return;
    }

    // Check if email already exists
    if (members.some(member => member.email === addMemberForm.email)) {
      alert('A member with this email already exists');
      return;
    }

    // Generate new member ID
    const newId = 'user_' + Date.now();
    
    // Create new member object
    const newMember: User = {
      id: newId,
      name: addMemberForm.name!,
      email: addMemberForm.email!,
      phone: addMemberForm.phone!,
      nicNumber: addMemberForm.nicNumber!,
      dateOfBirth: addMemberForm.dateOfBirth || new Date(),
      address: addMemberForm.address || '',
      role: addMemberForm.role as 'member' | 'admin' || 'member',
      houseNumber: addMemberForm.houseNumber,
      membershipDate: new Date(), // Set to current date
      isActive: addMemberForm.isActive !== undefined ? addMemberForm.isActive : true
    };

    // Add to local state
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers.filter(member =>
      !searchTerm.trim() ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.houseNumber && member.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    ));

    // Add to DataService for persistence
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        alert(`Member "${newMember.name}" has been added successfully!`);
        setShowAddMemberModal(false);
        
        // Update stats
        setStats(prev => prev ? {
          ...prev,
          totalMembers: updatedMembers.length
        } : null);
      } else {
        throw new Error('Failed to save member');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Member added locally but failed to save to database. Please try refreshing.');
    }
  };

  const handleCancelAddMember = () => {
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
  };

  // Account Management Functions
  const loadAccountIssues = async () => {
    setAccountLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccountIssues(data.users || []);
        setFilteredAccountIssues(data.users || []);
      } else {
        console.error('Failed to load account issues');
        alert('Failed to load account information');
      }
    } catch (error) {
      console.error('Error loading account issues:', error);
      alert('Error loading account information');
    } finally {
      setAccountLoading(false);
    }
  };

  const unlockAccount = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'unlock',
          userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAccountIssues(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to unlock account: ${error.error}`);
      }
    } catch (error) {
      console.error('Error unlocking account:', error);
      alert('Error unlocking account');
    }
  };

  const resetPasswordToNIC = async (userId: string, nicNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'reset_password',
          userId,
          nicNumber
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAccountIssues(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to reset password: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  const unlockAllAccounts = async () => {
    if (!confirm('Are you sure you want to unlock ALL user accounts? This will reset all failed login attempts.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'unlock_all'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        loadAccountIssues(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to unlock accounts: ${error.error}`);
      }
    } catch (error) {
      console.error('Error unlocking all accounts:', error);
      alert('Error unlocking all accounts');
    }
  };

  // Login History Functions
  const loadLoginHistory = async (reset: boolean = false) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const offset = reset ? 0 : historyOffset;
      const response = await fetch(
        `/api/admin/login-history?days=${historyDays}&limit=50&offset=${offset}&role=${historyRoleFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setLoginHistory(data.history || []);
          setHistoryOffset(0);
        } else {
          setLoginHistory(prev => [...prev, ...(data.history || [])]);
        }
        setLoginStats(data.stats);
        setHistoryHasMore(data.hasMore);
        if (reset) {
          setHistoryOffset(data.history?.length || 0);
        } else {
          setHistoryOffset(prev => prev + (data.history?.length || 0));
        }
      } else {
        console.error('Failed to load login history');
        alert('Failed to load login history');
      }
    } catch (error) {
      console.error('Error loading login history:', error);
      alert('Error loading login history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadMoreHistory = () => {
    if (!historyLoading && historyHasMore) {
      loadLoginHistory(false);
    }
  };

  const refreshLoginHistory = () => {
    setHistoryOffset(0);
    loadLoginHistory(true);
  };

  const handleHistoryFilterChange = (days: number, role: string) => {
    setHistoryDays(days);
    setHistoryRoleFilter(role);
    setHistoryOffset(0);
    // Load will be triggered by useEffect
  };

  const downloadLoginHistory = async (format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('token');
      const timestamp = new Date().toISOString().split('T')[0];
      const roleFilterText = historyRoleFilter === 'all' ? 'all-users' : historyRoleFilter;
      const filename = `login-history-${timestamp}-${historyDays}days-${roleFilterText}`;
      
      const url = `/api/admin/login-history/download?days=${historyDays}&role=${historyRoleFilter}&format=${format}&filename=${filename}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        // Show success message
        alert(`Login history downloaded successfully as ${format.toUpperCase()} file!`);
      } else {
        const error = await response.json();
        alert(`Failed to download login history: ${error.error}`);
      }
    } catch (error) {
      console.error('Error downloading login history:', error);
      alert('Error downloading login history');
    }
  };

  // Load account issues when accounts tab is selected
  useEffect(() => {
    if (activeTab === 'accounts') {
      loadAccountIssues();
    }
  }, [activeTab]);

  // Load login history when login history tab is selected
  useEffect(() => {
    if (activeTab === 'loginHistory') {
      refreshLoginHistory();
    }
  }, [activeTab, historyDays, historyRoleFilter]);

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
                  src="/logo.png"
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
                onClick={() => setActiveTab('accounts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'accounts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Management
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
                    <span className="text-sm text-gray-600">Upload Users Data (Excel/CSV)</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e, 'Users')}
                      disabled={loading}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {loading ? 'Processing file...' : 'Supports Excel (.xlsx) and Google Sheets (.csv) formats'}
                    </p>
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Payments Data (Excel/CSV)</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e, 'Payments')}
                      disabled={loading}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {loading ? 'Processing file...' : 'Supports Excel (.xlsx) and Google Sheets (.csv) formats'}
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
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => exportUsersData('excel')}
                      className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      Export Users Excel
                    </button>
                    <button 
                      onClick={() => exportUsersData('csv')}
                      className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      Export Users CSV
                    </button>
                  </div>
                  <button 
                    onClick={exportPaymentsData}
                    className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Export Payments Data
                  </button>
                  <button 
                    onClick={exportFinancialReport}
                    className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                  >
                    Export Financial Report
                  </button>
                  <hr className="my-2" />
                  <p className="text-xs text-gray-500 mb-2">Template Downloads:</p>
                  
                  {/* Users Templates */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Users Templates:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => downloadTemplate('users', 'excel')}
                        className="bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-xs"
                      >
                        Excel (.xlsx)
                      </button>
                      <button 
                        onClick={() => downloadTemplate('users', 'csv')}
                        className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                      >
                        Google Sheets (.csv)
                      </button>
                    </div>
                  </div>
                  
                  {/* Payments Templates */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Payments Templates:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => downloadTemplate('payments', 'excel')}
                        className="bg-orange-50 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-100 transition-colors text-xs"
                      >
                        Excel (.xlsx)
                      </button>
                      <button 
                        onClick={() => downloadTemplate('payments', 'csv')}
                        className="bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-xs"
                      >
                        Google Sheets (.csv)
                      </button>
                    </div>
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
                  <button
                    onClick={handleAddMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                              placeholder="Full Name"
                            />
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                              placeholder="Email"
                            />
                            <select
                              value={editForm.role || 'member'}
                              onChange={(e) => handleInputChange('role', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editForm.isActive !== undefined ? editForm.isActive : true}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Active Member</span>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <ProfilePicture 
                              user={member} 
                              onUpdate={(updatedUser) => {
                                setMembers(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
                                setFilteredMembers(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
                              }}
                              size="small"
                            />
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
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="tel"
                              value={editForm.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                              placeholder="Phone"
                            />
                            <textarea
                              value={editForm.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
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
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                              placeholder="NIC Number"
                            />
                            <input
                              type="date"
                              value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-900">NIC: {member.nicNumber}</div>
                            <div className="text-sm text-gray-500">DOB: {new Date(member.dateOfBirth).toLocaleDateString()}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMember === member.id ? (
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={editForm.membershipDate ? new Date(editForm.membershipDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleInputChange('membershipDate', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                            />
                            <input
                              type="text"
                              value={editForm.houseNumber || ''}
                              onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                              placeholder="House Number"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-900">Since: {new Date(member.membershipDate).toLocaleDateString()}</div>
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditMember(member.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-md shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Member</h3>
                  <button
                    onClick={handleCancelAddMember}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Picture</h4>
                  <div className="flex justify-center">
                    <ProfilePicture 
                      user={{
                        id: 'temp',
                        name: addMemberForm.name || 'New Member',
                        email: addMemberForm.email || '',
                        phone: addMemberForm.phone || '',
                        nicNumber: addMemberForm.nicNumber || '',
                        dateOfBirth: addMemberForm.dateOfBirth || new Date(),
                        address: addMemberForm.address || '',
                        role: addMemberForm.role || 'member',
                        membershipDate: new Date(),
                        isActive: true,
                        profilePicture: addMemberForm.profilePicture
                      } as User}
                      onUpdate={(updatedUser) => {
                        setAddMemberForm(prev => ({
                          ...prev,
                          profilePicture: updatedUser.profilePicture
                        }));
                      }}
                      size="large"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={addMemberForm.name || ''}
                      onChange={(e) => handleAddMemberInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={addMemberForm.email || ''}
                      onChange={(e) => handleAddMemberInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={addMemberForm.phone || ''}
                      onChange={(e) => handleAddMemberInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="+94xxxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIC Number *
                    </label>
                    <input
                      type="text"
                      value={addMemberForm.nicNumber || ''}
                      onChange={(e) => handleAddMemberInputChange('nicNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="Enter NIC number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={addMemberForm.dateOfBirth ? new Date(addMemberForm.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleAddMemberInputChange('dateOfBirth', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Number
                    </label>
                    <input
                      type="text"
                      value={addMemberForm.houseNumber || ''}
                      onChange={(e) => handleAddMemberInputChange('houseNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="e.g., A-101"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={addMemberForm.address || ''}
                      onChange={(e) => handleAddMemberInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                      placeholder="Enter full address"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={addMemberForm.role || 'member'}
                      onChange={(e) => handleAddMemberInputChange('role', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 text-gray-900"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={addMemberForm.isActive !== undefined ? addMemberForm.isActive : true}
                        onChange={(e) => handleAddMemberInputChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active Member</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancelAddMember}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewMember}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="text-gray-900">
            <WhatsAppComponent />
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
              <div className="flex space-x-3">
                <button
                  onClick={loadAccountIssues}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={accountLoading}
                >
                  {accountLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={unlockAllAccounts}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Unlock All Accounts
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={accountSearchTerm}
                  onChange={(e) => setAccountSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search accounts by user ID, name, or email..."
                />
              </div>
            </div>

            {accountLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading account information...</span>
              </div>
            ) : (
              <>
                {filteredAccountIssues.length === 0 ? (
                  <div className="text-center py-8">
                    {accountIssues.length === 0 ? (
                      <>
                        <AlertCircle className="mx-auto h-12 w-12 text-green-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Account Issues</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          All user accounts are functioning normally. No locked accounts or password issues found.
                        </p>
                      </>
                    ) : (
                      <>
                        <Search className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Matching Accounts</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No accounts found matching your search criteria. Try a different search term.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed Attempts</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAccountIssues.map((issue) => (
                          <tr key={issue.userId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {issue.user ? issue.user.name : issue.userId}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {issue.userId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {issue.user ? issue.user.email : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                {issue.isLocked && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    🔒 Account Locked
                                  </span>
                                )}
                                {issue.isTemporary && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    🔑 Temporary Password
                                  </span>
                                )}
                                {issue.failedAttempts > 0 && !issue.isLocked && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    ⚠️ Login Attempts
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {issue.failedAttempts}
                                {issue.lockedUntil && (
                                  <div className="text-xs text-gray-500">
                                    Locked until: {new Date(issue.lockedUntil).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {issue.isLocked && (
                                  <button
                                    onClick={() => unlockAccount(issue.userId)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                  >
                                    Unlock
                                  </button>
                                )}
                                {issue.user && (
                                  <button
                                    onClick={() => resetPasswordToNIC(issue.userId, issue.user.nicNumber)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                  >
                                    Reset to NIC
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Account Management Information */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Account Management Guide</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Unlock Account:</strong> Removes account lockout and resets failed login attempts</p>
                <p>• <strong>Reset to NIC:</strong> Resets user password to their NIC number (temporary password)</p>
                <p>• <strong>Unlock All:</strong> Emergency function to unlock all locked accounts in the system</p>
                <p>• <strong>Temporary Password:</strong> Users with temporary passwords must change them on first login</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loginHistory' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Login History
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* Time Period Filter */}
                <select
                  value={historyDays}
                  onChange={(e) => handleHistoryFilterChange(parseInt(e.target.value), historyRoleFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>Last 24 hours</option>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                
                {/* Role Filter */}
                <select
                  value={historyRoleFilter}
                  onChange={(e) => handleHistoryFilterChange(historyDays, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                  <option value="member">Members Only</option>
                </select>
                
                {/* Refresh Button */}
                <button
                  onClick={refreshLoginHistory}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  disabled={historyLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                  {historyLoading ? 'Loading...' : 'Refresh'}
                </button>
                
                {/* Download Buttons */}
                <button
                  onClick={() => downloadLoginHistory('csv')}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                  disabled={historyLoading || loginHistory.length === 0}
                  title="Download as CSV file"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </button>
                
                <button
                  onClick={() => downloadLoginHistory('json')}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  disabled={historyLoading || loginHistory.length === 0}
                  title="Download as JSON file"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            {loginStats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600">Total Logins</p>
                      <p className="text-xl font-bold text-blue-700">{loginStats.totalLogins}</p>
                    </div>
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-600">Successful</p>
                      <p className="text-xl font-bold text-green-700">{loginStats.successfulLogins}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-red-600">Failed</p>
                      <p className="text-xl font-bold text-red-700">{loginStats.failedLogins}</p>
                    </div>
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-600">Unique Users</p>
                      <p className="text-xl font-bold text-purple-700">{loginStats.uniqueUsers}</p>
                    </div>
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-orange-600">Admin Logins</p>
                      <p className="text-xl font-bold text-orange-700">{loginStats.adminLogins}</p>
                    </div>
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Avg Session</p>
                      <p className="text-xl font-bold text-gray-700">{loginStats.averageSessionDuration}m</p>
                    </div>
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Login History Table */}
            {historyLoading && loginHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading login history...</span>
              </div>
            ) : (
              <>
                {loginHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Login History</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No login attempts found for the selected time period and filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loginHistory.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  {entry.userRole === 'admin' ? (
                                    <Shield className="w-8 h-8 text-orange-600" />
                                  ) : (
                                    <Users className="w-8 h-8 text-blue-600" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {entry.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {entry.userEmail}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {entry.userRole.toUpperCase()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {entry.success ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  ✅ Success
                                </span>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    ❌ Failed
                                  </span>
                                  {entry.failureReason && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      {entry.failureReason}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {entry.ipAddress || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {entry.sessionDuration ? (
                                  <span className="text-green-600">
                                    {entry.sessionDuration} minutes
                                  </span>
                                ) : entry.success ? (
                                  <span className="text-yellow-600">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </div>
                              {entry.logoutTime && (
                                <div className="text-xs text-gray-500">
                                  Logged out: {new Date(entry.logoutTime).toLocaleTimeString()}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Load More Button */}
                    {historyHasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={loadMoreHistory}
                          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={historyLoading}
                        >
                          {historyLoading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Login History Information */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Login History Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Session Duration:</strong> Time between login and logout (Active means still logged in)</p>
                <p>• <strong>Failed Attempts:</strong> Includes invalid email, wrong password, and locked accounts</p>
                <p>• <strong>IP Address:</strong> Client IP address where the login attempt originated</p>
                <p>• <strong>Data Retention:</strong> Login history is kept for 30 days and then automatically cleaned up</p>
                <p>• <strong>Download Options:</strong> Export current filtered data as CSV (Excel compatible) or JSON format</p>
                <p>• <strong>File Names:</strong> Downloads include date, time period, and role filter in filename</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
