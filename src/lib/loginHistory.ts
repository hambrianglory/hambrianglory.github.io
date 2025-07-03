import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const HISTORY_DIR = path.join(process.cwd(), 'private', 'login-history');
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.PASSWORD_ENCRYPTION_KEY ? 
  Buffer.from(process.env.PASSWORD_ENCRYPTION_KEY, 'hex') : 
  crypto.randomBytes(32);
const IV_LENGTH = 12;

// Ensure history directory exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  sessionDuration?: number; // in minutes
  logoutTime?: Date;
}

export class LoginHistoryService {
  private static getHistoryFilePath(): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(HISTORY_DIR, `login-history-${today}.json`);
  }

  private static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  private static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private static loadHistoryFromFile(filePath: string): LoginHistoryEntry[] {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      
      const encryptedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const decryptedData = this.decrypt(encryptedData.encrypted, encryptedData.iv, encryptedData.tag);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error loading login history:', error);
      return [];
    }
  }

  private static saveHistoryToFile(filePath: string, history: LoginHistoryEntry[]): void {
    try {
      const data = JSON.stringify(history);
      const encrypted = this.encrypt(data);
      
      fs.writeFileSync(filePath, JSON.stringify(encrypted), 'utf8');
    } catch (error) {
      console.error('Error saving login history:', error);
      throw new Error('Failed to save login history');
    }
  }

  // Record a login attempt
  static recordLoginAttempt(
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string
  ): string {
    const entry: LoginHistoryEntry = {
      id: crypto.randomUUID(),
      userId,
      userEmail,
      userName,
      userRole,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success,
      failureReason
    };

    const filePath = this.getHistoryFilePath();
    const history = this.loadHistoryFromFile(filePath);
    
    history.push(entry);
    
    // Keep only last 1000 entries per file
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.saveHistoryToFile(filePath, history);
    
    return entry.id;
  }

  // Record logout (update session duration)
  static recordLogout(loginId: string): void {
    try {
      // Search through recent files to find the login entry
      const today = new Date();
      const filesToSearch = [];
      
      // Check today and yesterday's files
      for (let i = 0; i < 2; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const filePath = path.join(HISTORY_DIR, `login-history-${dateStr}.json`);
        if (fs.existsSync(filePath)) {
          filesToSearch.push(filePath);
        }
      }

      for (const filePath of filesToSearch) {
        const history = this.loadHistoryFromFile(filePath);
        const entryIndex = history.findIndex(entry => entry.id === loginId);
        
        if (entryIndex !== -1) {
          const entry = history[entryIndex];
          const logoutTime = new Date();
          entry.logoutTime = logoutTime;
          entry.sessionDuration = Math.round((logoutTime.getTime() - new Date(entry.timestamp).getTime()) / (1000 * 60));
          
          this.saveHistoryToFile(filePath, history);
          break;
        }
      }
    } catch (error) {
      console.error('Error recording logout:', error);
    }
  }

  // Get login history for admin panel (with pagination)
  static getLoginHistory(
    days: number = 7,
    limit: number = 100,
    offset: number = 0,
    roleFilter?: string
  ): {
    entries: LoginHistoryEntry[];
    totalCount: number;
    hasMore: boolean;
  } {
    try {
      const allEntries: LoginHistoryEntry[] = [];
      const endDate = new Date();
      
      // Collect entries from multiple days
      for (let i = 0; i < days; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const filePath = path.join(HISTORY_DIR, `login-history-${dateStr}.json`);
        
        if (fs.existsSync(filePath)) {
          const dayHistory = this.loadHistoryFromFile(filePath);
          allEntries.push(...dayHistory);
        }
      }

      // Filter by role if specified
      let filteredEntries = allEntries;
      if (roleFilter && roleFilter !== 'all') {
        filteredEntries = allEntries.filter(entry => entry.userRole === roleFilter);
      }

      // Sort by timestamp (newest first)
      filteredEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const totalCount = filteredEntries.length;
      const paginatedEntries = filteredEntries.slice(offset, offset + limit);
      const hasMore = offset + limit < totalCount;

      return {
        entries: paginatedEntries,
        totalCount,
        hasMore
      };
    } catch (error) {
      console.error('Error getting login history:', error);
      return {
        entries: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  // Get login statistics
  static getLoginStats(days: number = 7): {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueUsers: number;
    adminLogins: number;
    memberLogins: number;
    averageSessionDuration: number;
  } {
    try {
      const { entries } = this.getLoginHistory(days, 10000); // Get all entries for stats
      
      const totalLogins = entries.length;
      const successfulLogins = entries.filter(e => e.success).length;
      const failedLogins = entries.filter(e => !e.success).length;
      const uniqueUsers = new Set(entries.map(e => e.userId)).size;
      const adminLogins = entries.filter(e => e.userRole === 'admin').length;
      const memberLogins = entries.filter(e => e.userRole === 'member').length;
      
      const sessionsWithDuration = entries.filter(e => e.sessionDuration && e.sessionDuration > 0);
      const averageSessionDuration = sessionsWithDuration.length > 0
        ? Math.round(sessionsWithDuration.reduce((sum, e) => sum + (e.sessionDuration || 0), 0) / sessionsWithDuration.length)
        : 0;

      return {
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueUsers,
        adminLogins,
        memberLogins,
        averageSessionDuration
      };
    } catch (error) {
      console.error('Error getting login stats:', error);
      return {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueUsers: 0,
        adminLogins: 0,
        memberLogins: 0,
        averageSessionDuration: 0
      };
    }
  }

  // Clean up old history files (keep only last 30 days)
  static cleanupOldHistory(): void {
    try {
      const files = fs.readdirSync(HISTORY_DIR);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      files.forEach(file => {
        if (file.startsWith('login-history-') && file.endsWith('.json')) {
          const dateStr = file.replace('login-history-', '').replace('.json', '');
          const fileDate = new Date(dateStr);
          
          if (fileDate < cutoffDate) {
            fs.unlinkSync(path.join(HISTORY_DIR, file));
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up old history:', error);
    }
  }
}
