import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// Enhanced storage with cloud backup capability
const STORAGE_KEY = 'cfms_encrypted_data';
const CLOUD_BACKUP_KEY = 'cfms_cloud_backup_url';
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
    cloudBackupUrl?: string;
    autoSync: boolean;
  };
}

class EnhancedDatabase {
  private encryptionKey = ENCRYPTION_KEY;
  private autoSyncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoSync();
  }

  private encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
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
        return this.createDefaultDatabase();
      }

      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        const defaultDb = this.createDefaultDatabase();
        this.saveDatabase(defaultDb);
        return defaultDb;
      }
      
      const decrypted = this.decrypt(encrypted);
      const data = JSON.parse(decrypted);
      
      // Validate database structure
      if (!data.users || !data.payments || !data.loginHistory || !data.settings) {
        const defaultDb = this.createDefaultDatabase();
        this.saveDatabase(defaultDb);
        return defaultDb;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading database:', error);
      const defaultDb = this.createDefaultDatabase();
      this.saveDatabase(defaultDb);
      return defaultDb;
    }
  }

  private saveDatabase(db: Database): void {
    try {
      if (typeof window === 'undefined') return;
      
      // Update timestamp
      db.settings.lastBackup = new Date().toISOString();
      
      const jsonData = JSON.stringify(db);
      const encrypted = this.encrypt(jsonData);
      localStorage.setItem(STORAGE_KEY, encrypted);
      
      // Auto-backup to cloud if enabled
      if (db.settings.autoSync) {
        this.cloudBackup(db);
      }
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error('Failed to save database');
    }
  }

  private createDefaultDatabase(): Database {
    return {
      users: [],
      payments: [],
      loginHistory: [],
      settings: {
        initialized: false,
        version: '2.0.0',
        lastBackup: new Date().toISOString(),
        autoSync: true
      }
    };
  }

  // Auto-sync functionality
  private startAutoSync(): void {
    if (typeof window === 'undefined') return;
    
    // Sync every 5 minutes
    this.autoSyncInterval = setInterval(() => {
      try {
        const db = this.getDatabase();
        if (db.settings.autoSync && db.settings.cloudBackupUrl) {
          this.cloudBackup(db);
        }
      } catch (error) {
        console.warn('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  // Cloud backup using GitHub Gist (free and simple)
  private async cloudBackup(db: Database): Promise<void> {
    try {
      // Create a public gist for data sharing
      const gistData = {
        description: `Community Fee Management Backup - ${new Date().toISOString()}`,
        public: false,
        files: {
          'community_fee_data.json': {
            content: JSON.stringify(db, null, 2)
          }
        }
      };

      // If we have an existing gist URL, update it
      let gistId = db.settings.cloudBackupUrl?.split('/').pop();
      
      if (gistId) {
        // Update existing gist
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData)
        });
        
        if (response.ok) {
          console.log('Cloud backup updated successfully');
        }
      } else {
        // Create new gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData)
        });
        
        if (response.ok) {
          const result = await response.json();
          db.settings.cloudBackupUrl = result.html_url;
          localStorage.setItem(CLOUD_BACKUP_KEY, result.html_url);
          console.log('Cloud backup created:', result.html_url);
        }
      }
    } catch (error) {
      console.warn('Cloud backup failed:', error);
    }
  }

  // Initialize database with default admin
  async initializeDatabase(): Promise<void> {
    const db = this.getDatabase();
    
    if (!db.settings.initialized || db.users.length === 0) {
      console.log('Initializing database with default admin...');
      
      // Import argon2 dynamically for browser compatibility
      const argon2 = await import('argon2');
      const hashedPassword = await argon2.hash('admin123');
      
      const adminUser: User = {
        id: uuidv4(),
        email: 'admin@community.com',
        password: hashedPassword,
        name: 'System Administrator',
        phone: '0771234567',
        nicNumber: '123456789V',
        role: 'admin',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.users = [adminUser];
      db.settings.initialized = true;
      
      // Add sample members for demo
      const sampleMembers = await this.createSampleMembers();
      db.users.push(...sampleMembers);
      
      this.saveDatabase(db);
      console.log('Database initialized successfully');
    }
  }

  private async createSampleMembers(): Promise<User[]> {
    const argon2 = await import('argon2');
    
    return [
      {
        id: uuidv4(),
        email: 'john.doe@email.com',
        password: await argon2.hash('password123'),
        name: 'John Doe',
        phone: '0771234568',
        nicNumber: '987654321V',
        role: 'member',
        houseNumber: 'A-101',
        amount: 5000,
        status: 'paid',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'jane.smith@email.com',
        password: await argon2.hash('password123'),
        name: 'Jane Smith',
        phone: '0771234569',
        nicNumber: '456789123V',
        role: 'member',
        houseNumber: 'B-202',
        amount: 5000,
        status: 'pending',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'mike.wilson@email.com',
        password: await argon2.hash('password123'),
        name: 'Mike Wilson',
        phone: '0771234570',
        nicNumber: '321654987V',
        role: 'member',
        houseNumber: 'C-303',
        amount: 5000,
        status: 'overdue',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Cloud sync methods
  async enableCloudSync(): Promise<string> {
    const db = this.getDatabase();
    db.settings.autoSync = true;
    
    try {
      await this.cloudBackup(db);
      this.saveDatabase(db);
      return db.settings.cloudBackupUrl || '';
    } catch (error) {
      throw new Error(`Failed to enable cloud sync: ${error}`);
    }
  }

  async importFromCloud(gistUrl: string): Promise<void> {
    try {
      // Extract gist ID from URL
      const gistId = gistUrl.split('/').pop();
      const apiUrl = `https://api.github.com/gists/${gistId}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch cloud data');
      }
      
      const gistData = await response.json();
      const fileContent = gistData.files['community_fee_data.json']?.content;
      
      if (!fileContent) {
        throw new Error('No data found in cloud backup');
      }
      
      const cloudDb = JSON.parse(fileContent);
      
      // Validate structure
      if (!cloudDb.users || !cloudDb.payments || !cloudDb.loginHistory) {
        throw new Error('Invalid cloud data structure');
      }
      
      // Merge with local data (prefer cloud data for conflicts)
      cloudDb.settings.cloudBackupUrl = gistUrl;
      cloudDb.settings.autoSync = true;
      
      this.saveDatabase(cloudDb);
      console.log('Successfully imported from cloud');
    } catch (error) {
      throw new Error(`Failed to import from cloud: ${error}`);
    }
  }

  getCloudBackupUrl(): string | null {
    const db = this.getDatabase();
    return db.settings.cloudBackupUrl || localStorage.getItem(CLOUD_BACKUP_KEY);
  }

  // All existing methods from localDatabase.ts but with enhanced functionality
  async getAllUsers(): Promise<User[]> {
    const db = this.getDatabase();
    return db.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.getDatabase();
    return db.users.find(user => user.email === email) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = this.getDatabase();
    
    // Import argon2 dynamically
    const argon2 = await import('argon2');
    const hashedPassword = await argon2.hash(userData.password);
    
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    this.saveDatabase(db);
    return newUser.id;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const db = this.getDatabase();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    if (updates.password) {
      const argon2 = await import('argon2');
      updates.password = await argon2.hash(updates.password);
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveDatabase(db);
  }

  async deleteUser(id: string): Promise<void> {
    const db = this.getDatabase();
    db.users = db.users.filter(user => user.id !== id);
    this.saveDatabase(db);
  }

  async deleteMultipleUsers(ids: string[]): Promise<void> {
    const db = this.getDatabase();
    db.users = db.users.filter(user => !ids.includes(user.id));
    this.saveDatabase(db);
  }

  // Authentication with automatic cloud sync
  async validateLogin(email: string, password: string): Promise<User | null> {
    const db = this.getDatabase();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      await this.addLoginHistory({
        userId: '',
        email,
        timestamp: new Date().toISOString(),
        ip: 'unknown',
        userAgent: navigator.userAgent || 'unknown',
        success: false,
        failureReason: 'User not found'
      });
      return null;
    }
    
    // Check if user is locked
    if (user.isLocked && user.lockoutUntil) {
      const lockoutTime = new Date(user.lockoutUntil);
      if (lockoutTime > new Date()) {
        await this.addLoginHistory({
          userId: user.id,
          email,
          timestamp: new Date().toISOString(),
          ip: 'unknown',
          userAgent: navigator.userAgent || 'unknown',
          success: false,
          failureReason: 'Account locked'
        });
        return null;
      } else {
        // Unlock user if lockout period has passed
        await this.updateUser(user.id, {
          isLocked: false,
          lockoutUntil: undefined,
          failedLoginAttempts: 0
        });
      }
    }
    
    try {
      const argon2 = await import('argon2');
      const isValidPassword = await argon2.verify(user.password, password);
      
      if (!isValidPassword) {
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const shouldLock = failedAttempts >= 5;
        
        await this.updateUser(user.id, {
          failedLoginAttempts: failedAttempts,
          isLocked: shouldLock,
          lockoutUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : user.lockoutUntil
        });
        
        await this.addLoginHistory({
          userId: user.id,
          email,
          timestamp: new Date().toISOString(),
          ip: 'unknown',
          userAgent: navigator.userAgent || 'unknown',
          success: false,
          failureReason: 'Invalid password'
        });
        return null;
      }
      
      // Successful login
      await this.updateUser(user.id, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        lastLogin: new Date().toISOString()
      });
      
      await this.addLoginHistory({
        userId: user.id,
        email,
        timestamp: new Date().toISOString(),
        ip: 'unknown',
        userAgent: navigator.userAgent || 'unknown',
        success: true
      });
      
      return user;
    } catch (error) {
      console.error('Login validation error:', error);
      return null;
    }
  }

  async addLoginHistory(historyData: Omit<LoginHistory, 'id'>): Promise<void> {
    const db = this.getDatabase();
    const loginRecord: LoginHistory = {
      ...historyData,
      id: uuidv4()
    };
    db.loginHistory.push(loginRecord);
    this.saveDatabase(db);
  }

  async getLoginHistory(): Promise<LoginHistory[]> {
    const db = this.getDatabase();
    return db.loginHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Data export with cloud backup information
  async exportFullDatabase(): Promise<string> {
    const db = this.getDatabase();
    return JSON.stringify({
      ...db,
      exportedAt: new Date().toISOString(),
      cloudBackupUrl: this.getCloudBackupUrl()
    }, null, 2);
  }

  async importFullDatabase(jsonData: string): Promise<void> {
    try {
      const importedDb = JSON.parse(jsonData);
      
      // Validate structure
      if (!importedDb.users || !importedDb.payments || !importedDb.loginHistory) {
        throw new Error('Invalid database structure');
      }
      
      // Preserve cloud settings
      importedDb.settings = {
        ...importedDb.settings,
        autoSync: true,
        lastBackup: new Date().toISOString()
      };
      
      this.saveDatabase(importedDb);
    } catch (error) {
      throw new Error(`Failed to import database: ${error}`);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const db = this.getDatabase();
      const cloudBackupUrl = this.getCloudBackupUrl();
      
      return {
        status: 'healthy',
        details: {
          users: db.users.length,
          payments: db.payments.length,
          loginHistory: db.loginHistory.length,
          lastBackup: db.settings.lastBackup,
          cloudSync: db.settings.autoSync,
          cloudBackupUrl: cloudBackupUrl,
          initialized: db.settings.initialized,
          version: db.settings.version
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  destroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}

// Export singleton instance
export const enhancedDB = new EnhancedDatabase();
export default enhancedDB;
