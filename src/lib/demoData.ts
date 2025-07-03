// Demo data for GitHub Pages deployment
// This replaces database functionality for the static demo

export const demoUsers = [
  {
    id: 1,
    name: "John Doe",
    phone: "+94771234567",
    email: "john.doe@example.com",
    status: "paid",
    amount: 2500.00,
    paymentDate: "2025-06-15",
    role: "member",
    profilePicture: null
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+94777654321",
    email: "jane.smith@example.com",
    status: "pending",
    amount: 2500.00,
    paymentDate: null,
    role: "member",
    profilePicture: null
  },
  {
    id: 3,
    name: "Mike Johnson",
    phone: "+94773456789",
    email: "mike.johnson@example.com",
    status: "overdue",
    amount: 2500.00,
    paymentDate: "2025-05-15",
    role: "member",
    profilePicture: null
  },
  {
    id: 4,
    name: "Sarah Wilson",
    phone: "+94779876543",
    email: "sarah.wilson@example.com",
    status: "paid",
    amount: 2500.00,
    paymentDate: "2025-06-20",
    role: "member",
    profilePicture: null
  },
  {
    id: 5,
    name: "Admin User",
    phone: "+94771111111",
    email: "admin@community.lk",
    status: "paid",
    amount: 0.00,
    paymentDate: "2025-06-01",
    role: "admin",
    profilePicture: null
  }
];

export const demoPayments = [
  {
    id: 1,
    userId: 1,
    amount: 2500.00,
    date: "2025-06-15",
    method: "Bank Transfer",
    status: "completed",
    reference: "PAY001"
  },
  {
    id: 2,
    userId: 4,
    amount: 2500.00,
    date: "2025-06-20",
    method: "Cash",
    status: "completed",
    reference: "PAY002"
  },
  {
    id: 3,
    userId: 3,
    amount: 2500.00,
    date: "2025-05-15",
    method: "Bank Transfer",
    status: "overdue",
    reference: "PAY003"
  }
];

export const demoStats = {
  totalMembers: 25,
  paidMembers: 18,
  pendingPayments: 4,
  overduePayments: 3,
  totalRevenue: 45000.00,
  thisMonthRevenue: 12500.00
};

export const demoAnnouncements = [
  {
    id: 1,
    title: "Monthly Meeting Reminder",
    message: "Don't forget about our monthly community meeting this Saturday at 3 PM.",
    date: "2025-06-25",
    type: "general"
  },
  {
    id: 2,
    title: "Payment Due Reminder",
    message: "Monthly fees are due by the end of this week. Please make your payment to avoid late charges.",
    date: "2025-06-20",
    type: "payment"
  }
];

export const demoLoginHistory = [
  {
    id: 1,
    userId: 5,
    userName: "Admin User",
    loginTime: "2025-07-04 09:30:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: true
  },
  {
    id: 2,
    userId: 1,
    userName: "John Doe",
    loginTime: "2025-07-03 14:15:00",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0",
    success: true
  },
  {
    id: 3,
    userId: null,
    userName: "Unknown",
    loginTime: "2025-07-03 10:45:00",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: false
  }
];

// Demo authentication function
export const demoAuth = {
  login: (email: string, password: string) => {
    // Demo login - accepts any email/password combination
    if (email && password) {
      const user = demoUsers.find(u => u.email === email) || demoUsers[0];
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: 'demo-jwt-token'
      };
    }
    return { success: false, message: 'Invalid credentials' };
  },
  
  isAdmin: (userRole: string) => userRole === 'admin',
  
  getCurrentUser: () => ({
    id: 1,
    name: "Demo User",
    email: "demo@community.lk",
    role: "member"
  })
};

// Demo WhatsApp functionality
export const demoWhatsApp = {
  sendMessage: (phone: string, message: string) => {
    console.log(`Demo WhatsApp: Sending to ${phone}: ${message}`);
    return Promise.resolve({
      success: true,
      messageId: `demo-msg-${Date.now()}`
    });
  },
  
  sendBulkMessages: (recipients: any[], message: string) => {
    console.log(`Demo WhatsApp: Bulk sending to ${recipients.length} recipients`);
    return Promise.resolve({
      success: true,
      sent: recipients.length,
      failed: 0
    });
  }
};

export default {
  users: demoUsers,
  payments: demoPayments,
  stats: demoStats,
  announcements: demoAnnouncements,
  loginHistory: demoLoginHistory,
  auth: demoAuth,
  whatsapp: demoWhatsApp
};
