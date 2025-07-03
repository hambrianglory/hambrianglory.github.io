'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  AlertTriangle, 
  Settings,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface WhatsAppComponentProps {
  onClose?: () => void;
}

interface SendResult {
  type: 'announcement' | 'payment_reminder' | 'emergency';
  successful: number;
  failed: number;
  total: number;
  timestamp: Date;
}

export default function WhatsAppComponent({ onClose }: WhatsAppComponentProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'config' | 'history'>('send');
  const [messageType, setMessageType] = useState<'announcement' | 'payment_reminder' | 'emergency' | 'overdue_payments'>('announcement');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);
  const [unpaidMembers, setUnpaidMembers] = useState<any[]>([]);
  const [showUnpaidMembers, setShowUnpaidMembers] = useState(false);
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    sendToAll: true,
    selectedUsers: [] as string[]
  });

  const [emergencyForm, setEmergencyForm] = useState({
    emergencyType: '',
    details: '',
    actionRequired: '',
    sendToAll: true
  });

  const [overdueForm, setOverdueForm] = useState({
    targetQuarter: '',
    targetYear: new Date().getFullYear(),
    includeAllOverdue: true,
    selectedUsers: [] as string[]
  });

  const [config, setConfig] = useState({
    isEnabled: true,
    apiKey: '',
    phoneNumberId: '',
    accessToken: ''
  });

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementForm.title,
          content: announcementForm.content,
          userIds: announcementForm.sendToAll ? null : announcementForm.selectedUsers
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => [{
          type: 'announcement',
          successful: data.result.totalSent,
          failed: data.result.totalFailed,
          total: data.result.totalUsers,
          timestamp: new Date()
        }, ...prev]);
        
        setAnnouncementForm({ title: '', content: '', sendToAll: true, selectedUsers: [] });
        alert(`Announcement sent successfully! ${data.result.totalSent} sent, ${data.result.totalFailed} failed.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/payment-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => [{
          type: 'payment_reminder',
          successful: data.result.totalSent,
          failed: data.result.totalFailed,
          total: data.result.totalUsers,
          timestamp: new Date()
        }, ...prev]);
        
        alert(`Payment reminders sent! ${data.result.totalSent} sent, ${data.result.totalFailed} failed.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      alert('Failed to send payment reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmergencyAlert = async () => {
    if (!emergencyForm.emergencyType || !emergencyForm.details || !emergencyForm.actionRequired) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyType: emergencyForm.emergencyType,
          details: emergencyForm.details,
          actionRequired: emergencyForm.actionRequired,
          userIds: emergencyForm.sendToAll ? null : []
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => [{
          type: 'emergency',
          successful: data.result.totalSent,
          failed: data.result.totalFailed,
          total: data.result.totalUsers,
          timestamp: new Date()
        }, ...prev]);
        
        setEmergencyForm({ emergencyType: '', details: '', actionRequired: '', sendToAll: true });
        alert(`Emergency alert sent! ${data.result.totalSent} sent, ${data.result.totalFailed} failed.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOverduePayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (overdueForm.targetQuarter) params.append('quarter', overdueForm.targetQuarter);
      params.append('year', overdueForm.targetYear.toString());
      params.append('includeAllOverdue', overdueForm.includeAllOverdue.toString());

      const response = await fetch(`/api/whatsapp/payment-overdue?${params}`, {
        method: 'GET',
      });

      const data = await response.json();
      
      if (response.ok) {
        setUnpaidMembers(data.unpaidMembers);
        setShowUnpaidMembers(true);
        alert(`Found ${data.summary.totalUnpaidMembers} members with overdue payments totaling LKR ${data.summary.totalAmountDue.toLocaleString()}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error checking overdue payments:', error);
      alert('Failed to check overdue payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOverdueReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/payment-overdue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetQuarter: overdueForm.targetQuarter || undefined,
          targetYear: overdueForm.targetYear,
          includeAllOverdue: overdueForm.includeAllOverdue,
          userIds: overdueForm.selectedUsers.length > 0 ? overdueForm.selectedUsers : undefined
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => [{
          type: 'payment_reminder' as any,
          successful: data.summary.totalSent,
          failed: data.summary.totalFailed,
          total: data.summary.totalUnpaidMembers,
          timestamp: new Date()
        }, ...prev]);
        
        alert(`Overdue payment reminders sent! ${data.summary.totalSent} sent, ${data.summary.totalFailed} failed. Total amount: LKR ${data.summary.totalAmountDue.toLocaleString()}`);
        setShowUnpaidMembers(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending overdue reminders:', error);
      alert('Failed to send overdue reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">WhatsApp Integration</h2>
            <p className="text-sm text-gray-500">Send messages and manage communication</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
          {[
            { id: 'send', label: 'Send Messages', icon: Send },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'config', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'send' && (
          <div className="space-y-6">
            {/* Message Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setMessageType('announcement')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  messageType === 'announcement'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-6 h-6 mb-2" />
                <div className="font-medium">Announcement</div>
                <div className="text-sm text-gray-500">General community news</div>
              </button>

              <button
                onClick={() => setMessageType('payment_reminder')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  messageType === 'payment_reminder'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-6 h-6 mb-2" />
                <div className="font-medium">Payment Reminder</div>
                <div className="text-sm text-gray-500">Send to pending payments</div>
              </button>

              <button
                onClick={() => setMessageType('overdue_payments')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  messageType === 'overdue_payments'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="w-6 h-6 mb-2" />
                <div className="font-medium">Overdue Payments</div>
                <div className="text-sm text-gray-500">Detailed overdue reminders</div>
              </button>

              <button
                onClick={() => setMessageType('emergency')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  messageType === 'emergency'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="w-6 h-6 mb-2" />
                <div className="font-medium">Emergency Alert</div>
                <div className="text-sm text-gray-500">Urgent community alert</div>
              </button>
            </div>

            {/* Forms */}
            {messageType === 'announcement' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your announcement message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    checked={announcementForm.sendToAll}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, sendToAll: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sendToAll" className="text-sm text-gray-700">
                    Send to all community members
                  </label>
                </div>

                <button
                  onClick={handleSendAnnouncement}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Announcement</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {messageType === 'payment_reminder' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      This will send payment reminders to all members with pending payments.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendPaymentReminders}
                  disabled={loading}
                  className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Payment Reminders</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {messageType === 'emergency' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Type *
                  </label>
                  <select
                    value={emergencyForm.emergencyType}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, emergencyType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select emergency type</option>
                    <option value="Fire Emergency">Fire Emergency</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Security Alert">Security Alert</option>
                    <option value="Utility Outage">Utility Outage</option>
                    <option value="Severe Weather">Severe Weather</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Details *
                  </label>
                  <textarea
                    value={emergencyForm.details}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="Describe the emergency situation"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Required *
                  </label>
                  <textarea
                    value={emergencyForm.actionRequired}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, actionRequired: e.target.value }))}
                    placeholder="What should residents do?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={handleSendEmergencyAlert}
                  disabled={loading}
                  className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Send Emergency Alert</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {messageType === 'overdue_payments' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Overdue Payment Management</h4>
                  <p className="text-sm text-orange-700">
                    Check and send detailed payment reminders to members with overdue payments.
                    This includes comprehensive payment history and amounts due.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Quarter (Optional)
                    </label>
                    <select
                      value={overdueForm.targetQuarter}
                      onChange={(e) => setOverdueForm(prev => ({ ...prev, targetQuarter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Quarters</option>
                      <option value="Q1">Q1 (January - March)</option>
                      <option value="Q2">Q2 (April - June)</option>
                      <option value="Q3">Q3 (July - September)</option>
                      <option value="Q4">Q4 (October - December)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Year
                    </label>
                    <select
                      value={overdueForm.targetYear}
                      onChange={(e) => setOverdueForm(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeAllOverdue"
                    checked={overdueForm.includeAllOverdue}
                    onChange={(e) => setOverdueForm(prev => ({ ...prev, includeAllOverdue: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="includeAllOverdue" className="text-sm text-gray-700">
                    Include all overdue payments (not just selected quarter)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCheckOverduePayments}
                    disabled={loading}
                    className="flex-1 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-orange-300"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Check Overdue Members</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendOverdueReminders}
                    disabled={loading || unpaidMembers.length === 0}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Detailed Reminders</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Unpaid Members Display */}
                {showUnpaidMembers && unpaidMembers.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-3">
                      Found {unpaidMembers.length} Members with Overdue Payments
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {unpaidMembers.map((member, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{member.userName}</p>
                              <p className="text-sm text-gray-600">House: {member.houseNumber}</p>
                              <p className="text-sm text-gray-600">Phone: {member.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">
                                LKR {member.totalAmountDue.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {member.totalPaymentsDue} payment(s)
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Overdue Details:</p>
                            {member.unpaidDetails.map((detail: any, idx: number) => (
                              <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                <span>{detail.quarter}</span>
                                <span>LKR {detail.amount.toLocaleString()} ({detail.monthsOverdue} months overdue)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Messages</h3>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages sent yet
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          result.type === 'announcement' ? 'bg-blue-100' :
                          result.type === 'payment_reminder' ? 'bg-green-100' :
                          'bg-red-100'
                        }`}>
                          {result.type === 'announcement' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                          {result.type === 'payment_reminder' && <Phone className="w-4 h-4 text-green-600" />}
                          {result.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {result.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{result.successful}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span>{result.failed}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{result.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">WhatsApp Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableWhatsApp"
                  checked={config.isEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="enableWhatsApp" className="text-sm text-gray-700">
                  Enable WhatsApp integration
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  placeholder="Enter phone number ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="Enter access token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Configuration
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Create a WhatsApp Business Account</li>
                <li>2. Set up WhatsApp Business API</li>
                <li>3. Get your API credentials from Meta Business</li>
                <li>4. Enter credentials above and save</li>
                <li>5. Test with a small group first</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
