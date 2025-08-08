// Server-side data storage for imported users
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

const DATA_DIR = path.join(process.cwd(), 'server-data');
const USERS_FILE = path.join(DATA_DIR, 'imported-users.json');
const ENCRYPTION_KEY = 'HambrianGlory2025CommunityFeeManagement';

interface ServerUser {
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

export class ServerUserStorage {
  private static ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  private static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static getImportedUsers(): ServerUser[] {
    try {
      this.ensureDataDirectory();
      
      if (!fs.existsSync(USERS_FILE)) {
        return [];
      }

      const encryptedData = fs.readFileSync(USERS_FILE, 'utf8');
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error reading imported users:', error);
      return [];
    }
  }

  static saveImportedUsers(users: ServerUser[]): void {
    try {
      this.ensureDataDirectory();
      
      const jsonData = JSON.stringify(users, null, 2);
      const encryptedData = this.encrypt(jsonData);
      fs.writeFileSync(USERS_FILE, encryptedData, 'utf8');
    } catch (error) {
      console.error('Error saving imported users:', error);
      throw error;
    }
  }

  static addImportedUser(user: ServerUser): void {
    const users = this.getImportedUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.saveImportedUsers(users);
  }

  static removeImportedUser(email: string): void {
    const users = this.getImportedUsers();
    const filteredUsers = users.filter(u => u.email !== email);
    this.saveImportedUsers(filteredUsers);
  }

  static clearAllImportedUsers(): void {
    try {
      if (fs.existsSync(USERS_FILE)) {
        fs.unlinkSync(USERS_FILE);
      }
    } catch (error) {
      console.error('Error clearing imported users:', error);
    }
  }
}
