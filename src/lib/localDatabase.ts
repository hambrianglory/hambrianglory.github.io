import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be more secure
const STORAGE_KEY = 'cfms_encrypted_data';
const ENCRYPTION_KEY = 'HambrianGlory2025CommunityFeeManagement';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  nicNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  role: 'admin' | 'member';
  houseNumber?: string;
  membershipDate?: Date;
  amount?: number;
  status?: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  profilePicture?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  method: 'cash' | 'bank' | 'mobile';
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  email: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

interface Database {
  users: User[];
  payments: Payment[];
  loginHistory: LoginHistory[];
  settings: {
    initialized: boolean;
    version: string;
    lastBackup: string;
  };
}

class EncryptedLocalStorage {
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private getDatabase(): Database {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        return this.createDefaultDatabase();
      }
      
      const decrypted = this.decrypt(encrypted);
      const data = JSON.parse(decrypted);
      return data;
    } catch (error) {
      console.error('Error reading database:', error);
      return this.createDefaultDatabase();
    }
  }

  private saveDatabase(db: Database): void {
    try {
      const jsonData = JSON.stringify(db);
      const encrypted = this.encrypt(jsonData);
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  private createDefaultDatabase(): Database {
    const defaultAdmin: User = {
      id: 'admin-001',
      email: 'admin@hambriangLory.com',
      password: this.hashPassword('Admin@2025'),
      name: 'Administrator',
      phone: '+1234567890',
      nicNumber: '123456789V',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Admin Street, Colombo',
      role: 'admin',
      houseNumber: 'A1',
      membershipDate: new Date('2020-01-01'),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const sampleUsers: User[] = [
      defaultAdmin,
      {
        id: 'user-001',
        email: 'john.doe@email.com',
        password: this.hashPassword('password123'),
        name: 'John Doe',
        phone: '+1234567891',
        nicNumber: '987654321V',
        dateOfBirth: new Date('1985-03-15'),
        address: '456 Member Lane, Colombo',
        role: 'member',
        houseNumber: 'B2',
        membershipDate: new Date('2023-01-01'),
        amount: 150.00,
        status: 'paid',
        paymentDate: '2025-01-15',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: 'user-002',
        email: 'jane.smith@email.com',
        password: this.hashPassword('password123'),
        name: 'Jane Smith',
        phone: '+1234567892',
        nicNumber: '555666777V',
        dateOfBirth: new Date('1990-07-20'),
        address: '789 Community Road, Colombo',
        role: 'member',
        houseNumber: 'C3',
        membershipDate: new Date('2023-06-01'),
        amount: 150.00,
        status: 'pending',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    const samplePayments: Payment[] = [
      {
        id: 'pay-001',
        userId: 'user-001',
        amount: 150.00,
        date: '2025-01-15',
        status: 'paid',
        method: 'bank',
        reference: 'TXN123456',
        createdAt: '2025-01-15T00:00:00Z'
      }
    ];

    const db: Database = {
      users: sampleUsers,
      payments: samplePayments,
      loginHistory: [],
      settings: {
        initialized: true,
        version: '1.0.0',
        lastBackup: new Date().toISOString()
      }
    };

    this.saveDatabase(db);
    return db;
  }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // User methods
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const db = this.getDatabase();
    const hashedPassword = this.hashPassword(password);
    const user = db.users.find(u => u.email === email && u.password === hashedPassword && u.isActive);
    
    // Log login attempt
    const loginRecord: LoginHistory = {
      id: this.generateId(),
      userId: user?.id || 'unknown',
      email,
      timestamp: new Date().toISOString(),
      ip: 'localhost',
      userAgent: navigator.userAgent,
      success: !!user,
      failureReason: user ? undefined : 'Invalid credentials'
    };
    
    db.loginHistory.push(loginRecord);
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
    }
    
    this.saveDatabase(db);
    return user || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = this.getDatabase();
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      password: this.hashPassword(userData.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    this.saveDatabase(db);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const db = this.getDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return null;
    
    if (updates.password) {
      updates.password = this.hashPassword(updates.password);
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveDatabase(db);
    return db.users[userIndex];
  }

  async deleteUser(userId: string): Promise<boolean> {
    const db = this.getDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    // Soft delete - mark as inactive
    db.users[userIndex].isActive = false;
    db.users[userIndex].updatedAt = new Date().toISOString();
    
    this.saveDatabase(db);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    const db = this.getDatabase();
    return db.users.filter(u => u.isActive);
  }

  async getUserById(userId: string): Promise<User | null> {
    const db = this.getDatabase();
    return db.users.find(u => u.id === userId && u.isActive) || null;
  }

  // Payment methods
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const db = this.getDatabase();
    const newPayment: Payment = {
      ...paymentData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    db.payments.push(newPayment);
    
    // Update user status
    const user = db.users.find(u => u.id === paymentData.userId);
    if (user) {
      user.amount = paymentData.amount;
      user.status = paymentData.status;
      user.paymentDate = paymentData.date;
      user.updatedAt = new Date().toISOString();
    }
    
    this.saveDatabase(db);
    return newPayment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const db = this.getDatabase();
    return db.payments.filter(p => p.userId === userId);
  }

  async getAllPayments(): Promise<Payment[]> {
    const db = this.getDatabase();
    return db.payments;
  }

  // Login history methods
  async getLoginHistory(): Promise<LoginHistory[]> {
    const db = this.getDatabase();
    return db.loginHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Account management methods
  async getAccountIssues(): Promise<any[]> {
    const db = this.getDatabase();
    const issues: any[] = [];

    // Find users with issues
    db.users.forEach(user => {
      if (!user.isActive) {
        issues.push({
          id: this.generateId(),
          userId: user.id,
          email: user.email,
          name: user.name,
          type: 'account_inactive',
          description: 'Account is inactive',
          severity: 'medium',
          createdAt: user.updatedAt
        });
      }

      if (user.status === 'overdue') {
        issues.push({
          id: this.generateId(),
          userId: user.id,
          email: user.email,
          name: user.name,
          type: 'payment_overdue',
          description: 'Payment is overdue',
          severity: 'high',
          createdAt: user.paymentDate || user.updatedAt
        });
      }

      if (!user.phone || user.phone.trim() === '') {
        issues.push({
          id: this.generateId(),
          userId: user.id,
          email: user.email,
          name: user.name,
          type: 'missing_phone',
          description: 'Phone number is missing',
          severity: 'low',
          createdAt: user.createdAt
        });
      }
    });

    return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLoginHistoryWithStats(days: number = 7, roleFilter: string = 'all', limit: number = 50, offset: number = 0): Promise<{
    history: LoginHistory[];
    stats: any;
    hasMore: boolean;
  }> {
    const db = this.getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredHistory = db.loginHistory.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    if (roleFilter !== 'all') {
      filteredHistory = filteredHistory.filter(log => {
        const user = db.users.find(u => u.id === log.userId);
        return user && user.role === roleFilter;
      });
    }

    // Sort by timestamp descending
    filteredHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalCount = filteredHistory.length;
    const paginatedHistory = filteredHistory.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Calculate stats
    const successfulLogins = filteredHistory.filter(log => log.success).length;
    const failedLogins = filteredHistory.filter(log => !log.success).length;
    const uniqueUsers = new Set(filteredHistory.map(log => log.userId)).size;
    const adminLogins = filteredHistory.filter(log => {
      const user = db.users.find(u => u.id === log.userId);
      return user && user.role === 'admin';
    }).length;

    const stats = {
      totalLogins: filteredHistory.length,
      successfulLogins,
      failedLogins,
      uniqueUsers,
      adminLogins,
      successRate: filteredHistory.length > 0 ? (successfulLogins / filteredHistory.length) * 100 : 0
    };

    return {
      history: paginatedHistory,
      stats,
      hasMore
    };
  }

  async downloadLoginHistory(format: 'csv' | 'json', days: number = 7, roleFilter: string = 'all'): Promise<string> {
    const { history } = await this.getLoginHistoryWithStats(days, roleFilter, 1000, 0);
    
    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    } else {
      // CSV format
      const headers = ['Timestamp', 'Email', 'User ID', 'Success', 'IP', 'User Agent', 'Failure Reason'];
      const rows = history.map(log => [
        log.timestamp,
        log.email,
        log.userId,
        log.success ? 'Yes' : 'No',
        log.ip,
        log.userAgent,
        log.failureReason || ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      return csvContent;
    }
  }

  // Data import/export methods
  async importUsers(userData: any[]): Promise<{ success: boolean; added: number; updated: number; errors: string[] }> {
    const db = this.getDatabase();
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      for (const userRecord of userData) {
        try {
          // Validate required fields
          if (!userRecord.email || !userRecord.name) {
            errors.push(`Missing required fields for user: ${userRecord.name || userRecord.email || 'Unknown'}`);
            continue;
          }

          // Check if user already exists
          const existingUserIndex = db.users.findIndex(u => u.email === userRecord.email);

          const userData: User = {
            id: existingUserIndex >= 0 ? db.users[existingUserIndex].id : this.generateId(),
            email: userRecord.email,
            name: userRecord.name,
            phone: userRecord.phone || '',
            password: existingUserIndex >= 0 ? db.users[existingUserIndex].password : this.hashPassword(userRecord.password || userRecord.phone || '123456'),
            role: userRecord.role || 'member',
            amount: parseFloat(userRecord.amount) || 0,
            status: userRecord.status || 'pending',
            paymentDate: userRecord.paymentDate || undefined,
            profilePicture: userRecord.profilePicture || undefined,
            isActive: true,
            createdAt: existingUserIndex >= 0 ? db.users[existingUserIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          if (existingUserIndex >= 0) {
            // Update existing user
            db.users[existingUserIndex] = userData;
            updated++;
          } else {
            // Add new user
            db.users.push(userData);
            added++;
          }
        } catch (error) {
          errors.push(`Error processing user ${userRecord.name || userRecord.email}: ${error}`);
        }
      }

      this.saveDatabase(db);
      return { success: true, added, updated, errors };
    } catch (error) {
      console.error('Error importing users:', error);
      return { success: false, added, updated, errors: [`Import failed: ${error}`] };
    }
  }

  async importPayments(paymentData: any[]): Promise<{ success: boolean; added: number; updated: number; errors: string[] }> {
    const db = this.getDatabase();
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      for (const paymentRecord of paymentData) {
        try {
          // Validate required fields
          if (!paymentRecord.userId && !paymentRecord.email) {
            errors.push(`Missing userId or email for payment: ${paymentRecord.id || 'Unknown'}`);
            continue;
          }

          // Find user by email if userId not provided
          let userId = paymentRecord.userId;
          if (!userId && paymentRecord.email) {
            const user = db.users.find(u => u.email === paymentRecord.email);
            if (user) {
              userId = user.id;
            } else {
              errors.push(`User not found for email: ${paymentRecord.email}`);
              continue;
            }
          }

          const paymentData: Payment = {
            id: paymentRecord.id || this.generateId(),
            userId: userId,
            amount: parseFloat(paymentRecord.amount) || 0,
            date: paymentRecord.date || new Date().toISOString(),
            status: paymentRecord.status || 'pending',
            method: paymentRecord.method || 'cash',
            reference: paymentRecord.reference || undefined,
            notes: paymentRecord.notes || undefined,
            createdAt: paymentRecord.createdAt || new Date().toISOString()
          };

          // Check if payment already exists
          const existingPaymentIndex = db.payments.findIndex(p => p.id === paymentData.id);

          if (existingPaymentIndex >= 0) {
            // Update existing payment
            db.payments[existingPaymentIndex] = paymentData;
            updated++;
          } else {
            // Add new payment
            db.payments.push(paymentData);
            added++;
          }

          // Update user status if needed
          const user = db.users.find(u => u.id === userId);
          if (user) {
            user.amount = paymentData.amount;
            user.status = paymentData.status;
            user.paymentDate = paymentData.date;
            user.updatedAt = new Date().toISOString();
          }
        } catch (error) {
          errors.push(`Error processing payment ${paymentRecord.id}: ${error}`);
        }
      }

      this.saveDatabase(db);
      return { success: true, added, updated, errors };
    } catch (error) {
      console.error('Error importing payments:', error);
      return { success: false, added, updated, errors: [`Import failed: ${error}`] };
    }
  }

  // Utility methods
  async exportData(): Promise<string> {
    const db = this.getDatabase();
    // Remove passwords for export
    const exportData = {
      ...db,
      users: db.users.map(u => ({ ...u, password: '[ENCRYPTED]' }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPayments: number;
    paidUsers: number;
    pendingUsers: number;
    overdueUsers: number;
    totalAmount: number;
  }> {
    const db = this.getDatabase();
    const activeUsers = db.users.filter(u => u.isActive && u.role === 'member');
    
    return {
      totalUsers: activeUsers.length,
      activeUsers: activeUsers.length,
      totalPayments: db.payments.length,
      paidUsers: activeUsers.filter(u => u.status === 'paid').length,
      pendingUsers: activeUsers.filter(u => u.status === 'pending').length,
      overdueUsers: activeUsers.filter(u => u.status === 'overdue').length,
      totalAmount: db.payments.reduce((sum, p) => sum + p.amount, 0)
    };
  }

  // File parsing helper methods
  async parseCSV(csvText: string): Promise<any[]> {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  async parseExcel(file: File): Promise<any[]> {
    // For now, return empty array - this would need a proper Excel parser
    // In a real implementation, you'd use a library like xlsx
    console.warn('Excel parsing not implemented yet. Please use CSV format.');
    return [];
  }
}

// Export singleton instance
export const localDB = new EncryptedLocalStorage();
