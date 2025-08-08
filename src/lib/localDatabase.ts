import CryptoJS from 'crypto-js';

// Enhanced encryption key and cloud sync settings
const STORAGE_KEY = 'cfms_encrypted_data';
const CLOUD_SYNC_KEY = 'cfms_cloud_sync_url';
const ENCRYPTION_KEY = 'HambrianGlory2025CommunityFeeManagement';

// Import ServerPasswordStorage for server-side password management
let ServerPasswordStorage: any = null;
let ServerUserStorage: any = null;
if (typeof window === 'undefined') {
  // Only import on server-side
  try {
    ServerPasswordStorage = require('./serverPasswordStorage').ServerPasswordStorage;
    ServerUserStorage = require('./serverUserStorage').ServerUserStorage;
  } catch (error) {
    console.log('Server storage modules not available');
  }
}

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
  isLocked?: boolean;
  failedLoginAttempts?: number;
  lockoutUntil?: string;
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
    cloudSyncUrl?: string;
    autoSync: boolean;
    lastSync?: string;
  };
}

class EncryptedLocalStorage {
  private encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private getDatabase(): Database {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering - return empty database
        console.log('Server-side rendering detected, returning default database');
        return this.createDefaultDatabase();
      }

      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        console.log('No existing database found, creating default database');
        const defaultDb = this.createDefaultDatabase();
        this.saveDatabase(defaultDb);
        return defaultDb;
      }
      
      let decrypted;
      try {
        decrypted = this.decrypt(encrypted);
      } catch (decryptError) {
        console.error('Decryption failed, creating new database:', decryptError);
        localStorage.removeItem(STORAGE_KEY);
        const defaultDb = this.createDefaultDatabase();
        this.saveDatabase(defaultDb);
        return defaultDb;
      }
      
      const data = JSON.parse(decrypted);
      
      // Validate database structure
      if (!data.users || !data.payments || !data.loginHistory || !data.settings) {
        console.log('Invalid database structure, recreating database');
        const defaultDb = this.createDefaultDatabase();
        this.saveDatabase(defaultDb);
        return defaultDb;
      }
      
      console.log('Database loaded successfully');
      return data;
    } catch (error) {
      console.error('Error reading database:', error);
      console.log('Creating new database due to error');
      const defaultDb = this.createDefaultDatabase();
      this.saveDatabase(defaultDb);
      return defaultDb;
    }
  }

  private saveDatabase(db: Database): void {
    try {
      if (typeof window === 'undefined') {
        console.log('Server-side rendering, cannot save to localStorage');
        return;
      }
      
      // Update last backup timestamp
      db.settings.lastBackup = new Date().toISOString();
      
      const jsonData = JSON.stringify(db);
      const encrypted = this.encrypt(jsonData);
      localStorage.setItem(STORAGE_KEY, encrypted);
      console.log('Database saved successfully');
      
      // Auto-sync to cloud if enabled
      if (db.settings.autoSync) {
        this.cloudBackup(db).catch(error => {
          console.warn('Cloud backup failed:', error);
        });
      }
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error(`Failed to save database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cloud backup functionality for cross-device sync
  private async cloudBackup(db: Database): Promise<void> {
    try {
      const gistData = {
        description: `Community Fee Management Backup - ${new Date().toISOString()}`,
        public: false,
        files: {
          'cfm_data.json': {
            content: JSON.stringify(db, null, 2)
          }
        }
      };

      let gistId = db.settings.cloudSyncUrl?.split('/').pop();
      
      if (gistId) {
        // Update existing gist
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gistData)
        });
        
        if (response.ok) {
          db.settings.lastSync = new Date().toISOString();
          console.log('Cloud backup updated');
        }
      } else {
        // Create new gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gistData)
        });
        
        if (response.ok) {
          const result = await response.json();
          db.settings.cloudSyncUrl = result.html_url;
          db.settings.lastSync = new Date().toISOString();
          localStorage.setItem(CLOUD_SYNC_KEY, result.html_url);
          console.log('Cloud backup created:', result.html_url);
        }
      }
    } catch (error) {
      console.warn('Cloud backup failed:', error);
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

    const sampleLoginHistory: LoginHistory[] = [
      {
        id: 'login-001',
        userId: 'admin-001',
        email: 'admin@hambriangLory.com',
        timestamp: new Date().toISOString(),
        ip: 'localhost',
        userAgent: navigator.userAgent || 'Unknown',
        success: true
      },
      {
        id: 'login-002',
        userId: 'user-001',
        email: 'john.doe@email.com',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        ip: 'localhost',
        userAgent: navigator.userAgent || 'Unknown',
        success: true
      },
      {
        id: 'login-003',
        userId: 'unknown',
        email: 'wrong@email.com',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        ip: 'localhost',
        userAgent: navigator.userAgent || 'Unknown',
        success: false,
        failureReason: 'Invalid credentials'
      }
    ];

    const db: Database = {
      users: sampleUsers,
      payments: samplePayments,
      loginHistory: sampleLoginHistory,
      settings: {
        initialized: true,
        version: '2.0.0',
        lastBackup: new Date().toISOString(),
        autoSync: true
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
    const user = db.users.find(u => u.email === email && u.isActive);
    
    // Debug logging
    console.log('🔍 Authentication Debug:', {
      email,
      password,
      userFound: !!user,
      userRole: user?.role,
      userNIC: user?.nicNumber,
      userPassword: user?.password
    });
    
    // Check if user exists
    if (!user) {
      this.logLoginAttempt(db, email, 'unknown', false, 'User not found');
      return null;
    }
    
    // Check if account is locked
    if (user.isLocked || (user.lockoutUntil && new Date(user.lockoutUntil) > new Date())) {
      this.logLoginAttempt(db, email, user.id, false, 'Account locked');
      return null;
    }
    
    let isValidPassword = false;
    
    // Check server-side storage first (for password changes)
    if (typeof window === 'undefined' && ServerPasswordStorage) {
      try {
        isValidPassword = ServerPasswordStorage.validatePassword(user.id, password);
        console.log('🔐 Server-side validation result:', isValidPassword);
      } catch (error) {
        console.log('Server-side password validation failed, falling back to default');
      }
    }
    
    // If server-side validation failed or not available, check default passwords
    if (!isValidPassword) {
      // For members, allow login with NIC number as password
      if (user.role === 'member' && user.nicNumber && password === user.nicNumber) {
        console.log('✅ NIC password match for member');
        isValidPassword = true;
      } else {
        // Check hashed password for admin or changed passwords
        const hashedPassword = this.hashPassword(password);
        console.log('🔒 Checking hashed password:', {
          inputPassword: password,
          hashedInput: hashedPassword,
          storedPassword: user.password,
          matches: user.password === hashedPassword
        });
        isValidPassword = user.password === hashedPassword;
      }
    }
    
    console.log('🎯 Final authentication result:', isValidPassword);
    
    if (isValidPassword) {
      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.isLocked = false;
      user.lockoutUntil = undefined;
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      
      this.logLoginAttempt(db, email, user.id, true);
      this.saveDatabase(db);
      return user;
    } else {
      // Handle failed login attempt
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      }
      
      user.updatedAt = new Date().toISOString();
      this.logLoginAttempt(db, email, user.id, false, `Invalid password (${user.failedLoginAttempts} attempts)`);
      this.saveDatabase(db);
      return null;
    }
  }

  private logLoginAttempt(db: Database, email: string, userId: string, success: boolean, failureReason?: string): void {
    const loginRecord: LoginHistory = {
      id: this.generateId(),
      userId,
      email,
      timestamp: new Date().toISOString(),
      ip: 'localhost',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      success,
      failureReason
    };
    
    db.loginHistory.push(loginRecord);
  }

  async unlockUser(userId: string): Promise<boolean> {
    const db = this.getDatabase();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) return false;
    
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.updatedAt = new Date().toISOString();
    
    this.saveDatabase(db);
    return true;
  }

  async getLockedUsers(): Promise<User[]> {
    const db = this.getDatabase();
    return db.users.filter(u => 
      u.isActive && (
        u.isLocked || 
        (u.lockoutUntil && new Date(u.lockoutUntil) > new Date())
      )
    );
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

  async addUser(userData: User): Promise<User> {
    const db = this.getDatabase();
    
    // Check if user with same email already exists
    const existingUser = db.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // For members, if password equals NIC, store it as plain text for NIC authentication
    // For admins or custom passwords, hash the password
    let processedPassword = userData.password;
    if (userData.role === 'member' && userData.nicNumber && userData.password === userData.nicNumber) {
      // Keep NIC as plain text for member authentication
      processedPassword = userData.password;
    } else {
      // Hash other passwords (admin, custom passwords)
      processedPassword = this.hashPassword(userData.password);
    }
    
    const newUser: User = {
      ...userData,
      id: userData.id || this.generateId(),
      password: processedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    console.log('👤 Adding new user:', {
      email: newUser.email,
      role: newUser.role,
      nicNumber: newUser.nicNumber,
      passwordType: userData.password === userData.nicNumber ? 'NIC' : 'Custom'
    });
    
    db.users.push(newUser);
    this.saveDatabase(db);
    
    // Also save to server-side storage for persistence
    if (typeof window === 'undefined' && ServerUserStorage) {
      try {
        console.log('Saving new user to server storage...');
        ServerUserStorage.addImportedUser(newUser);
        console.log('New user saved to server storage successfully');
      } catch (error) {
        console.error('Failed to save user to server storage:', error);
      }
    }
    
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
    let userDeleted = false;
    
    if (userIndex !== -1) {
      // Store user email before deletion for server storage cleanup
      const userEmail = db.users[userIndex].email;
      
      // Soft delete from main database - mark as inactive
      db.users[userIndex].isActive = false;
      db.users[userIndex].updatedAt = new Date().toISOString();
      this.saveDatabase(db);
      userDeleted = true;
      
      // Also remove from server storage (imported users)
      if (typeof window === 'undefined' && ServerUserStorage) {
        try {
          console.log('Removing imported user from server storage:', userEmail);
          ServerUserStorage.removeImportedUser(userEmail);
        } catch (error) {
          console.error('Error removing imported user:', error);
        }
      }
    } else {
      // User not found in main database, check if it's in server storage only
      if (typeof window === 'undefined' && ServerUserStorage) {
        try {
          const importedUsers = ServerUserStorage.getImportedUsers();
          const importedUser = importedUsers.find((u: any) => u.id === userId);
          if (importedUser) {
            console.log('Removing user from server storage only:', importedUser.email);
            ServerUserStorage.removeImportedUser(importedUser.email);
            userDeleted = true;
          }
        } catch (error) {
          console.error('Error removing imported user:', error);
        }
      }
    }
    
    return userDeleted;
  }

  async getAllUsers(): Promise<User[]> {
    const db = this.getDatabase();
    let allUsers = db.users.filter(u => u.isActive);
    
    // Add imported users from server storage (server-side only)
    if (typeof window === 'undefined' && ServerUserStorage) {
      try {
        console.log('Loading imported users from server storage...');
        const importedUsers = ServerUserStorage.getImportedUsers();
        console.log('Found imported users:', importedUsers.length);
        
        // Filter imported users to only include active ones
        const activeImportedUsers = importedUsers.filter((u: any) => u.isActive !== false);
        
        // Merge imported users, avoiding duplicates by email
        const existingEmails = new Set(allUsers.map(u => u.email));
        const newImportedUsers = activeImportedUsers.filter((u: any) => !existingEmails.has(u.email));
        console.log('New imported users to add:', newImportedUsers.length);
        allUsers = [...allUsers, ...newImportedUsers];
        console.log('Total users after merge:', allUsers.length);
      } catch (error) {
        console.error('Could not load imported users:', error);
      }
    } else {
      console.log('ServerUserStorage not available or client-side');
    }
    
    return allUsers;
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
    console.log('🔄 Starting user import process...');
    console.log('📋 Server-side check:', typeof window === 'undefined' ? 'YES' : 'NO');
    console.log('📋 ServerUserStorage available:', ServerUserStorage ? 'YES' : 'NO');
    
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
            nicNumber: userRecord.nicNumber || '',
            dateOfBirth: userRecord.dateOfBirth ? new Date(userRecord.dateOfBirth) : new Date(),
            address: userRecord.address || '',
            role: (userRecord.role && ['admin', 'member'].includes(userRecord.role.toLowerCase())) ? userRecord.role.toLowerCase() : 'member',
            houseNumber: userRecord.houseNumber || '',
            membershipDate: userRecord.membershipDate ? new Date(userRecord.membershipDate) : new Date(),
            amount: parseFloat(userRecord.amount) || 0,
            status: userRecord.status || 'pending',
            paymentDate: userRecord.paymentDate || undefined,
            profilePicture: userRecord.profilePicture || undefined,
            lastLogin: userRecord.lastLogin || undefined,
            password: existingUserIndex >= 0 ? db.users[existingUserIndex].password : this.hashPassword(userRecord.password || userRecord.phone || '123456'),
            isActive: userRecord.isActive !== undefined ? Boolean(userRecord.isActive) : true,
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

          // Also save to server storage if available (for persistence)
          if (typeof window === 'undefined' && ServerUserStorage) {
            try {
              ServerUserStorage.addImportedUser(userData);
            } catch (error) {
              console.log('Could not save to server storage:', error);
            }
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

  // Cloud sync management methods
  async enableCloudSync(): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const db = this.getDatabase();
      db.settings.autoSync = true;
      
      await this.cloudBackup(db);
      this.saveDatabase(db);
      
      return {
        success: true,
        url: db.settings.cloudSyncUrl,
        message: 'Cloud sync enabled successfully. Your data will automatically sync across all devices.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to enable cloud sync: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async disableCloudSync(): Promise<void> {
    const db = this.getDatabase();
    db.settings.autoSync = false;
    delete db.settings.cloudSyncUrl;
    delete db.settings.lastSync;
    this.saveDatabase(db);
    localStorage.removeItem(CLOUD_SYNC_KEY);
  }

  getCloudSyncStatus(): { enabled: boolean; url?: string; lastSync?: string } {
    const db = this.getDatabase();
    return {
      enabled: db.settings.autoSync || false,
      url: db.settings.cloudSyncUrl,
      lastSync: db.settings.lastSync
    };
  }

  async importFromCloudUrl(cloudUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      const gistId = cloudUrl.split('/').pop();
      if (!gistId) {
        throw new Error('Invalid cloud URL');
      }

      const apiUrl = `https://api.github.com/gists/${gistId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cloud data. Please check the URL.');
      }
      
      const gistData = await response.json();
      const fileContent = gistData.files['cfm_data.json']?.content;
      
      if (!fileContent) {
        throw new Error('No data found in cloud backup');
      }
      
      const cloudDb = JSON.parse(fileContent);
      
      // Validate structure
      if (!cloudDb.users || !cloudDb.payments || !cloudDb.loginHistory || !cloudDb.settings) {
        throw new Error('Invalid cloud data structure');
      }
      
      // Set up cloud sync for this URL
      cloudDb.settings.cloudSyncUrl = cloudUrl;
      cloudDb.settings.autoSync = true;
      cloudDb.settings.lastSync = new Date().toISOString();
      
      this.saveDatabase(cloudDb);
      localStorage.setItem(CLOUD_SYNC_KEY, cloudUrl);
      
      return {
        success: true,
        message: `Successfully imported ${cloudDb.users.length} users and ${cloudDb.payments.length} payments from cloud. Auto-sync enabled.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async forceCloudSync(): Promise<{ success: boolean; message: string }> {
    try {
      const db = this.getDatabase();
      if (!db.settings.autoSync) {
        return {
          success: false,
          message: 'Cloud sync is not enabled. Enable it first.'
        };
      }
      
      await this.cloudBackup(db);
      this.saveDatabase(db);
      
      return {
        success: true,
        message: 'Data successfully synced to cloud'
      };
    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const localDB = new EncryptedLocalStorage();
