import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

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

class CloudDatabase {
  private isOnline = true;
  private listeners: Array<() => void> = [];

  constructor() {
    // Monitor network status
    this.checkNetworkStatus();
  }

  private async checkNetworkStatus() {
    try {
      await enableNetwork(db);
      this.isOnline = true;
    } catch (error) {
      console.warn('Firebase offline:', error);
      this.isOnline = false;
    }
  }

  // Initialize database with default admin user if empty
  async initializeDatabase(): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      if (usersSnapshot.empty) {
        console.log('Database is empty, creating default admin user...');
        await this.createDefaultAdmin();
        await this.createSampleData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    const hashedPassword = await argon2.hash('admin123');
    const adminUser: Omit<User, 'id'> = {
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

    await addDoc(collection(db, 'users'), adminUser);
    console.log('Default admin user created');
  }

  private async createSampleData(): Promise<void> {
    // Create sample members
    const sampleMembers = [
      {
        email: 'john.doe@email.com',
        password: await argon2.hash('password123'),
        name: 'John Doe',
        phone: '0771234568',
        nicNumber: '987654321V',
        role: 'member' as const,
        houseNumber: 'A-101',
        amount: 5000,
        status: 'paid' as const,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        email: 'jane.smith@email.com',
        password: await argon2.hash('password123'),
        name: 'Jane Smith',
        phone: '0771234569',
        nicNumber: '456789123V',
        role: 'member' as const,
        houseNumber: 'B-202',
        amount: 5000,
        status: 'pending' as const,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        email: 'mike.wilson@email.com',
        password: await argon2.hash('password123'),
        name: 'Mike Wilson',
        phone: '0771234570',
        nicNumber: '321654987V',
        role: 'member' as const,
        houseNumber: 'C-303',
        amount: 5000,
        status: 'overdue' as const,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const batch = writeBatch(db);
    sampleMembers.forEach(member => {
      const docRef = doc(collection(db, 'users'));
      batch.set(docRef, member);
    });

    await batch.commit();
    console.log('Sample members created');
  }

  // User Management
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (!userDoc.exists()) return null;
      
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const hashedPassword = await argon2.hash(userData.password);
      const userDoc = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'users'), userDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', id);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      if (updates.password) {
        updateData.password = await argon2.hash(updates.password);
      }
      
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async deleteMultipleUsers(ids: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, 'users', id));
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      throw error;
    }
  }

  // Authentication
  async validateLogin(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;
      
      const isValidPassword = await argon2.verify(user.password, password);
      if (!isValidPassword) {
        // Increment failed login attempts
        await this.updateUser(user.id, {
          failedLoginAttempts: (user.failedLoginAttempts || 0) + 1,
          lockoutUntil: (user.failedLoginAttempts || 0) >= 4 ? 
            new Date(Date.now() + 30 * 60 * 1000).toISOString() : user.lockoutUntil // 30 minutes lockout
        });
        return null;
      }
      
      // Reset failed attempts on successful login
      await this.updateUser(user.id, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        lastLogin: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      console.error('Error validating login:', error);
      return null;
    }
  }

  // Payment Management
  async getAllPayments(): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Payment));
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const payment = {
        ...paymentData,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'payments'), payment);
      return docRef.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<void> {
    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, updates);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'payments', id));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Login History
  async addLoginHistory(historyData: Omit<LoginHistory, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'loginHistory'), historyData);
    } catch (error) {
      console.error('Error adding login history:', error);
    }
  }

  async getLoginHistory(): Promise<LoginHistory[]> {
    try {
      const historyRef = collection(db, 'loginHistory');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LoginHistory));
    } catch (error) {
      console.error('Error fetching login history:', error);
      return [];
    }
  }

  // Real-time data subscription
  subscribeToUsers(callback: (users: User[]) => void): () => void {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      callback(users);
    });
    
    return unsubscribe;
  }

  subscribeToPayments(callback: (payments: Payment[]) => void): () => void {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Payment));
      callback(payments);
    });
    
    return unsubscribe;
  }

  // CSV Import/Export
  async importUsersFromCSV(csvData: any[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    
    try {
      const batch = writeBatch(db);
      
      for (const row of csvData) {
        try {
          const userData = {
            email: row.email || '',
            password: await argon2.hash(row.password || 'defaultPassword123'),
            name: row.name || '',
            phone: row.phone || '',
            nicNumber: row.nicNumber || '',
            role: (row.role as 'admin' | 'member') || 'member',
            houseNumber: row.houseNumber || '',
            amount: parseFloat(row.amount) || 0,
            status: (row.status as 'paid' | 'pending' | 'overdue') || 'pending',
            isActive: row.isActive !== 'false',
            isLocked: row.isLocked === 'true',
            failedLoginAttempts: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const docRef = doc(collection(db, 'users'));
          batch.set(docRef, userData);
          success++;
        } catch (error) {
          errors.push(`Row ${csvData.indexOf(row) + 1}: ${error}`);
        }
      }
      
      await batch.commit();
    } catch (error) {
      errors.push(`Batch commit error: ${error}`);
    }
    
    return { success, errors };
  }

  async exportUsersToCSV(): Promise<string> {
    const users = await this.getAllUsers();
    
    const headers = [
      'email', 'name', 'phone', 'nicNumber', 'role', 'houseNumber', 
      'amount', 'status', 'isActive', 'createdAt'
    ];
    
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.email,
        user.name,
        user.phone,
        user.nicNumber || '',
        user.role,
        user.houseNumber || '',
        user.amount || 0,
        user.status || 'pending',
        user.isActive,
        user.createdAt
      ].map(field => `"${field}"`).join(','))
    ];
    
    return csvRows.join('\n');
  }

  // Database health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const historySnapshot = await getDocs(collection(db, 'loginHistory'));
      
      return {
        status: 'healthy',
        details: {
          connected: this.isOnline,
          users: usersSnapshot.size,
          payments: paymentsSnapshot.size,
          loginHistory: historySnapshot.size,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance
export const cloudDatabase = new CloudDatabase();
export default cloudDatabase;
