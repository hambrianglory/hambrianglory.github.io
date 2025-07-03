import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as argon2 from 'argon2';

// NIST SP 800-63B Compliant Encryption Configuration + Argon2
const ALGORITHM = 'aes-256-gcm'; // Using GCM mode for authenticated encryption
const ENCRYPTION_KEY = process.env.PASSWORD_ENCRYPTION_KEY ? 
  Buffer.from(process.env.PASSWORD_ENCRYPTION_KEY, 'hex') : 
  crypto.randomBytes(32);
const IV_LENGTH = 12; // 96-bit IV for GCM as per NIST recommendation
const TAG_LENGTH = 16; // 128-bit authentication tag

// Argon2 Configuration (OWASP recommended settings)
const ARGON2_OPTIONS = {
  type: argon2.argon2id, // Most secure variant
  memoryCost: 2 ** 16,   // 64 MB memory usage
  timeCost: 3,           // 3 iterations
  parallelism: 1,        // Single thread
};

// Password storage directory
const PASSWORD_DIR = path.join(process.cwd(), 'private', 'passwords');

// Ensure password directory exists
if (!fs.existsSync(PASSWORD_DIR)) {
  fs.mkdirSync(PASSWORD_DIR, { recursive: true });
}

export interface UserPassword {
  userId: string;
  hashedPassword: string;
  isTemporary: boolean;
  lastChanged: Date;
  failedAttempts: number;
  lockedUntil?: Date;
}

export class PasswordService {
  private static getPasswordFilePath(userId: string): string {
    return path.join(PASSWORD_DIR, `${userId}.pwd`);
  }

  // Argon2 Password Hashing (OWASP Recommended)
  static async hashPassword(password: string): Promise<string> {
    try {
      // Argon2id automatically handles salt generation internally
      const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Verify password against Argon2 hash
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // NIST SP 800-63B Compliant Authenticated Encryption (AES-256-GCM)
  private static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag for integrity verification
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // NIST SP 800-63B Compliant Authenticated Decryption
  private static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    
    // Set the authentication tag for integrity verification
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Store encrypted password data
  static storePassword(userPassword: UserPassword): void {
    try {
      const data = JSON.stringify(userPassword);
      const encrypted = this.encrypt(data);
      const filePath = this.getPasswordFilePath(userPassword.userId);
      
      fs.writeFileSync(filePath, JSON.stringify(encrypted), 'utf8');
    } catch (error) {
      console.error('Error storing password:', error);
      throw new Error('Failed to store password');
    }
  }

  // Retrieve and decrypt password data
  static getPassword(userId: string): UserPassword | null {
    try {
      const filePath = this.getPasswordFilePath(userId);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const encryptedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const decryptedData = this.decrypt(encryptedData.encrypted, encryptedData.iv, encryptedData.tag);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error retrieving password:', error);
      return null;
    }
  }

  // Create temporary password (NIC number)
  static async createTemporaryPassword(userId: string, nicNumber: string): Promise<void> {
    const hashedPassword = await this.hashPassword(nicNumber);
    
    const userPassword: UserPassword = {
      userId,
      hashedPassword,
      isTemporary: true,
      lastChanged: new Date(),
      failedAttempts: 0
    };
    
    this.storePassword(userPassword);
  }

  // Verify password
  static async verifyUserPassword(userId: string, password: string): Promise<{ valid: boolean; isTemporary: boolean; isLocked: boolean }> {
    const userPassword = this.getPassword(userId);
    
    if (!userPassword) {
      return { valid: false, isTemporary: false, isLocked: false };
    }

    // Check if account is locked
    if (userPassword.lockedUntil && new Date() < new Date(userPassword.lockedUntil)) {
      return { valid: false, isTemporary: userPassword.isTemporary, isLocked: true };
    }

    // Verify password using Argon2
    const isValid = await this.verifyPassword(password, userPassword.hashedPassword);

    if (!isValid) {
      // Increment failed attempts
      userPassword.failedAttempts++;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (userPassword.failedAttempts >= 5) {
        userPassword.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      this.storePassword(userPassword);
      return { valid: false, isTemporary: userPassword.isTemporary, isLocked: userPassword.failedAttempts >= 5 };
    }

    // Reset failed attempts on successful login
    if (userPassword.failedAttempts > 0) {
      userPassword.failedAttempts = 0;
      delete userPassword.lockedUntil;
      this.storePassword(userPassword);
    }

    return { valid: true, isTemporary: userPassword.isTemporary, isLocked: false };
  }

  // Change password
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const userPassword = this.getPassword(userId);
    
    if (!userPassword) {
      return { success: false, message: 'User not found' };
    }

    // For temporary passwords, we can skip old password verification
    if (!userPassword.isTemporary) {
      const isValidOldPassword = await this.verifyPassword(oldPassword, userPassword.hashedPassword);
      if (!isValidOldPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return { success: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
    }

    // Hash new password with Argon2
    const hashedPassword = await this.hashPassword(newPassword);
    
    // Update password
    userPassword.hashedPassword = hashedPassword;
    userPassword.isTemporary = false;
    userPassword.lastChanged = new Date();
    userPassword.failedAttempts = 0;
    delete userPassword.lockedUntil;
    
    this.storePassword(userPassword);
    
    return { success: true, message: 'Password changed successfully' };
  }

  // Initialize user password (when user is created)
  static async initializeUserPassword(userId: string, nicNumber: string): Promise<void> {
    // Check if password already exists
    if (this.getPassword(userId)) {
      return; // Password already exists
    }
    
    await this.createTemporaryPassword(userId, nicNumber);
  }

  // Delete user password
  static deleteUserPassword(userId: string): void {
    try {
      const filePath = this.getPasswordFilePath(userId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  }

  // Get all users with temporary passwords
  static getUsersWithTemporaryPasswords(): string[] {
    try {
      const files = fs.readdirSync(PASSWORD_DIR);
      const tempPasswordUsers: string[] = [];
      
      for (const file of files) {
        if (file.endsWith('.pwd')) {
          const userId = file.replace('.pwd', '');
          const userPassword = this.getPassword(userId);
          if (userPassword && userPassword.isTemporary) {
            tempPasswordUsers.push(userId);
          }
        }
      }
      
      return tempPasswordUsers;
    } catch (error) {
      console.error('Error getting users with temporary passwords:', error);
      return [];
    }
  }

  // ADMIN ACCOUNT MANAGEMENT METHODS

  // Unlock a specific user account
  static unlockUserAccount(userId: string): { success: boolean; message: string } {
    try {
      const userPassword = this.getPassword(userId);
      
      if (!userPassword) {
        return { success: false, message: 'User password file not found' };
      }
      
      userPassword.failedAttempts = 0;
      delete userPassword.lockedUntil;
      this.storePassword(userPassword);
      
      return { success: true, message: 'Account unlocked successfully' };
    } catch (error) {
      console.error('Error unlocking user account:', error);
      return { success: false, message: 'Failed to unlock account' };
    }
  }

  // Reset user password to NIC number
  static async resetUserPasswordToNIC(userId: string, nicNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Delete existing password file
      this.deleteUserPassword(userId);
      
      // Create new temporary password with NIC number
      await this.createTemporaryPassword(userId, nicNumber);
      
      return { success: true, message: 'Password reset to NIC number successfully' };
    } catch (error) {
      console.error('Error resetting password to NIC:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  }

  // Get account status for a specific user
  static getAccountStatus(userId: string): {
    exists: boolean;
    isLocked: boolean;
    isTemporary: boolean;
    failedAttempts: number;
    lockedUntil?: Date;
  } {
    try {
      const userPassword = this.getPassword(userId);
      
      if (!userPassword) {
        return {
          exists: false,
          isLocked: false,
          isTemporary: false,
          failedAttempts: 0
        };
      }
      
      const isLocked = userPassword.lockedUntil && new Date() < new Date(userPassword.lockedUntil);
      
      return {
        exists: true,
        isLocked: Boolean(isLocked),
        isTemporary: userPassword.isTemporary,
        failedAttempts: userPassword.failedAttempts,
        lockedUntil: userPassword.lockedUntil ? new Date(userPassword.lockedUntil) : undefined
      };
    } catch (error) {
      console.error('Error getting account status:', error);
      return {
        exists: false,
        isLocked: false,
        isTemporary: false,
        failedAttempts: 0
      };
    }
  }

  // Get all users with account issues (locked, temporary passwords, etc.)
  static getUsersWithAccountIssues(): Array<{
    userId: string;
    isLocked: boolean;
    isTemporary: boolean;
    failedAttempts: number;
    lockedUntil?: Date;
  }> {
    try {
      const files = fs.readdirSync(PASSWORD_DIR);
      const usersWithIssues: Array<{
        userId: string;
        isLocked: boolean;
        isTemporary: boolean;
        failedAttempts: number;
        lockedUntil?: Date;
      }> = [];
      
      for (const file of files) {
        if (file.endsWith('.pwd')) {
          const userId = file.replace('.pwd', '');
          const status = this.getAccountStatus(userId);
          
          // Include users who have issues (locked or temporary passwords)
          if (status.exists && (status.isLocked || status.isTemporary || status.failedAttempts > 0)) {
            usersWithIssues.push({
              userId,
              isLocked: status.isLocked,
              isTemporary: status.isTemporary,
              failedAttempts: status.failedAttempts,
              lockedUntil: status.lockedUntil
            });
          }
        }
      }
      
      return usersWithIssues;
    } catch (error) {
      console.error('Error getting users with account issues:', error);
      return [];
    }
  }

  // Bulk unlock all accounts (Admin emergency function)
  static unlockAllAccounts(): { success: boolean; unlockedCount: number; message: string } {
    try {
      let unlockedCount = 0;
      const files = fs.readdirSync(PASSWORD_DIR);
      
      for (const file of files) {
        if (file.endsWith('.pwd')) {
          const userId = file.replace('.pwd', '');
          const userPassword = this.getPassword(userId);
          
          if (userPassword && (userPassword.lockedUntil || userPassword.failedAttempts > 0)) {
            userPassword.failedAttempts = 0;
            delete userPassword.lockedUntil;
            this.storePassword(userPassword);
            unlockedCount++;
          }
        }
      }
      
      return { 
        success: true, 
        unlockedCount, 
        message: `Unlocked ${unlockedCount} accounts successfully` 
      };
    } catch (error) {
      console.error('Error unlocking all accounts:', error);
      return { 
        success: false, 
        unlockedCount: 0, 
        message: 'Failed to unlock accounts' 
      };
    }
  }
}
