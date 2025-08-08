// Server-side storage for password changes
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'user-passwords.json');
const ENCRYPTION_KEY = 'HambrianGlory2025CommunityFeeManagement';

interface UserPassword {
  userId: string;
  email: string;
  hashedPassword: string;
  updatedAt: string;
}

export class ServerPasswordStorage {
  private static ensureDataDirectory(): void {
    const dataDir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private static loadPasswords(): UserPassword[] {
    try {
      this.ensureDataDirectory();
      if (!fs.existsSync(STORAGE_FILE)) {
        return [];
      }
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading passwords:', error);
      return [];
    }
  }

  private static savePasswords(passwords: UserPassword[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(passwords, null, 2));
    } catch (error) {
      console.error('Error saving passwords:', error);
      throw error;
    }
  }

  static updatePassword(userId: string, email: string, newPassword: string): boolean {
    try {
      const hashedPassword = CryptoJS.SHA256(newPassword + ENCRYPTION_KEY).toString();
      const passwords = this.loadPasswords();
      
      const existingIndex = passwords.findIndex(p => p.userId === userId);
      const updatedPassword: UserPassword = {
        userId,
        email,
        hashedPassword,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        passwords[existingIndex] = updatedPassword;
      } else {
        passwords.push(updatedPassword);
      }

      this.savePasswords(passwords);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  static getPassword(userId: string): UserPassword | null {
    try {
      const passwords = this.loadPasswords();
      return passwords.find(p => p.userId === userId) || null;
    } catch (error) {
      console.error('Error getting password:', error);
      return null;
    }
  }

  static validatePassword(userId: string, password: string): boolean {
    try {
      const storedPassword = this.getPassword(userId);
      if (!storedPassword) {
        return false;
      }

      const hashedPassword = CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
      return storedPassword.hashedPassword === hashedPassword;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }
}
