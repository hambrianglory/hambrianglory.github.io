import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserCredentials } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static generateUserCredentials(users: User[]): UserCredentials[] {
    return users.map(user => {
      const tempPassword = this.generateTemporaryPassword();
      return {
        email: user.email,
        password: tempPassword,
        tempPassword: true
      };
    });
  }

  static async createUserWithCredentials(user: User, password: string): Promise<User & { hashedPassword: string }> {
    const hashedPassword = await this.hashPassword(password);
    return {
      ...user,
      hashedPassword
    };
  }
}

export class SessionManager {
  private static sessions = new Map<string, any>();

  static createSession(userId: string, userData: any): string {
    const sessionId = Math.random().toString(36).substring(2);
    this.sessions.set(sessionId, {
      userId,
      userData,
      createdAt: new Date(),
      lastAccessed: new Date()
    });
    return sessionId;
  }

  static getSession(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessed = new Date();
      return session;
    }
    return null;
  }

  static destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  static cleanupExpiredSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastAccessed.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
