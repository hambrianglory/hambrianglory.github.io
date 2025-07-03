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
  role: 'admin' | 'member';
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
      role: 'admin',
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
        role: 'member',
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
        role: 'member',
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
}

// Export singleton instance
export const localDB = new EncryptedLocalStorage();
