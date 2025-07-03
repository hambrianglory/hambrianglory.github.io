export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  nicNumber: string;
  dateOfBirth: Date;
  address: string;
  role: 'admin' | 'member';
  houseNumber?: string;
  membershipDate: Date;
  isActive: boolean;
  profilePicture?: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  };
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentDate: Date;
  paymentType: 'quarterly_sanda_fee' | 'maintenance' | 'special_assessment' | 'fine';
  description: string;
  receiptNumber: string;
  status: 'pending' | 'completed' | 'overdue';
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // For quarterly payments
  year?: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  approvedBy: string;
  receiptUrl?: string;
}

export interface CommunityBalance {
  totalBalance: number;
  totalCollected: number;
  totalExpenses: number;
  pendingPayments: number;
  lastUpdated: Date;
}

export interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  nicNumber: string;
  dateOfBirth: Date;
  photo?: string;
  startDate: Date;
  endDate?: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  tags: string[];
}

export interface UserCredentials {
  email: string;
  password: string;
  tempPassword?: boolean;
}

export interface DashboardData {
  user: User;
  pendingPayments: Payment[];
  recentPayments: Payment[];
  communityBalance: CommunityBalance;
  announcements: BlogPost[];
}

export interface ExcelRow {
  [key: string]: string | number | Date;
}

export interface WhatsAppNotification {
  id?: string;
  userId: string;
  message: string;
  type: 'payment_reminder' | 'general_announcement' | 'emergency' | 'event_reminder' | 'welcome_message';
  scheduledDate?: Date;
  sentDate?: Date;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  recipientPhone: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  type: 'payment_reminder' | 'general_announcement' | 'emergency' | 'event_reminder' | 'welcome_message';
  isActive: boolean;
}

export interface WhatsAppConfig {
  apiKey?: string;
  webhookUrl?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  accessToken?: string;
  isEnabled: boolean;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  messageId?: string;
}

export interface WhatsAppBulkSendResult {
  successful: number;
  failed: number;
  total: number;
  results: Array<{
    userId: string;
    phone: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}
