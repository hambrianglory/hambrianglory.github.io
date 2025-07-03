import { User, Payment, Expense, CommunityBalance, CommitteeMember, BlogPost, DashboardData } from '@/types';
import { PasswordService } from '@/lib/passwordService';
import fs from 'fs';
import path from 'path';

// Data storage directory
const DATA_DIR = path.join(process.cwd(), 'private', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class DataService {
  private static users: User[] = [];
  private static payments: Payment[] = [];
  private static expenses: Expense[] = [];
  private static committeeMembers: CommitteeMember[] = [];
  private static blogPosts: BlogPost[] = [];
  private static isInitialized = false;

  // Persistent storage file paths
  private static getUsersFilePath(): string {
    return path.join(DATA_DIR, 'users.json');
  }

  private static getPaymentsFilePath(): string {
    return path.join(DATA_DIR, 'payments.json');
  }

  private static getExpensesFilePath(): string {
    return path.join(DATA_DIR, 'expenses.json');
  }

  private static getCommitteeMembersFilePath(): string {
    return path.join(DATA_DIR, 'committee.json');
  }

  private static getBlogPostsFilePath(): string {
    return path.join(DATA_DIR, 'blogs.json');
  }

  // Load data from files
  private static loadFromFile<T>(filePath: string): T[] {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`Error loading data from ${filePath}:`, error);
      return [];
    }
  }

  // Save data to files
  private static saveToFile<T>(filePath: string, data: T[]): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error saving data to ${filePath}:`, error);
    }
  }

  // Initialize data from persistent storage
  private static initialize(): void {
    if (!this.isInitialized) {
      this.users = this.loadFromFile<User>(this.getUsersFilePath());
      this.payments = this.loadFromFile<Payment>(this.getPaymentsFilePath());
      this.expenses = this.loadFromFile<Expense>(this.getExpensesFilePath());
      this.committeeMembers = this.loadFromFile<CommitteeMember>(this.getCommitteeMembersFilePath());
      this.blogPosts = this.loadFromFile<BlogPost>(this.getBlogPostsFilePath());
      this.isInitialized = true;
    }
  }

  // User Management
  static getUsers(): User[] {
    this.initialize();
    return this.users;
  }

  static getUserById(id: string): User | undefined {
    this.initialize();
    return this.users.find(user => user.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    this.initialize();
    return this.users.find(user => user.email === email);
  }

  static async addUser(user: User): Promise<void> {
    this.initialize();
    this.users.push(user);
    this.saveToFile(this.getUsersFilePath(), this.users);
    // Initialize password with NIC number as temporary password
    await PasswordService.initializeUserPassword(user.id, user.nicNumber);
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    this.initialize();
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveToFile(this.getUsersFilePath(), this.users);
      return this.users[userIndex];
    }
    return null;
  }

  static deleteUser(id: string): boolean {
    this.initialize();
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
      this.saveToFile(this.getUsersFilePath(), this.users);
      return true;
    }
    return false;
  }

  static importUsers(users: User[]): void {
    this.initialize();
    this.users = users;
    this.saveToFile(this.getUsersFilePath(), this.users);
  }

  // Payment Management
  static getPayments(): Payment[] {
    this.initialize();
    return this.payments;
  }

  static getPaymentsByUserId(userId: string): Payment[] {
    this.initialize();
    return this.payments.filter(payment => payment.userId === userId);
  }

  static getPendingPaymentsByUserId(userId: string): Payment[] {
    this.initialize();
    return this.payments.filter(payment => 
      payment.userId === userId && payment.status === 'pending'
    );
  }

  static addPayment(payment: Payment): void {
    this.initialize();
    this.payments.push(payment);
    this.saveToFile(this.getPaymentsFilePath(), this.payments);
  }

  static updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    this.initialize();
    const paymentIndex = this.payments.findIndex(payment => payment.id === id);
    if (paymentIndex !== -1) {
      this.payments[paymentIndex] = { ...this.payments[paymentIndex], ...updates };
      this.saveToFile(this.getPaymentsFilePath(), this.payments);
      return this.payments[paymentIndex];
    }
    return null;
  }

  static importPayments(payments: Payment[]): void {
    this.initialize();
    this.payments = payments;
    this.saveToFile(this.getPaymentsFilePath(), this.payments);
  }

  // Expense Management
  static getExpenses(): Expense[] {
    this.initialize();
    return this.expenses;
  }

  static addExpense(expense: Expense): void {
    this.initialize();
    this.expenses.push(expense);
    this.saveToFile(this.getExpensesFilePath(), this.expenses);
  }

  static updateExpense(id: string, updates: Partial<Expense>): Expense | null {
    this.initialize();
    const expenseIndex = this.expenses.findIndex(expense => expense.id === id);
    if (expenseIndex !== -1) {
      this.expenses[expenseIndex] = { ...this.expenses[expenseIndex], ...updates };
      this.saveToFile(this.getExpensesFilePath(), this.expenses);
      return this.expenses[expenseIndex];
    }
    return null;
  }

  static deleteExpense(id: string): boolean {
    this.initialize();
    const expenseIndex = this.expenses.findIndex(expense => expense.id === id);
    if (expenseIndex !== -1) {
      this.expenses.splice(expenseIndex, 1);
      this.saveToFile(this.getExpensesFilePath(), this.expenses);
      return true;
    }
    return false;
  }

  // Community Balance Calculation
  static getCommunityBalance(): CommunityBalance {
    this.initialize();
    const totalCollected = this.payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalExpenses = this.expenses
      .reduce((sum, expense) => sum + expense.amount, 0);

    const pendingPayments = this.payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalBalance = totalCollected - totalExpenses;

    return {
      totalBalance,
      totalCollected,
      totalExpenses,
      pendingPayments,
      lastUpdated: new Date()
    };
  }

  // Committee Management
  static getCommitteeMembers(): CommitteeMember[] {
    this.initialize();
    return this.committeeMembers;
  }

  static addCommitteeMember(member: CommitteeMember): void {
    this.initialize();
    this.committeeMembers.push(member);
    this.saveToFile(this.getCommitteeMembersFilePath(), this.committeeMembers);
  }

  static updateCommitteeMember(id: string, updates: Partial<CommitteeMember>): CommitteeMember | null {
    this.initialize();
    const memberIndex = this.committeeMembers.findIndex(member => member.id === id);
    if (memberIndex !== -1) {
      this.committeeMembers[memberIndex] = { ...this.committeeMembers[memberIndex], ...updates };
      this.saveToFile(this.getCommitteeMembersFilePath(), this.committeeMembers);
      return this.committeeMembers[memberIndex];
    }
    return null;
  }

  static deleteCommitteeMember(id: string): boolean {
    this.initialize();
    const memberIndex = this.committeeMembers.findIndex(member => member.id === id);
    if (memberIndex !== -1) {
      this.committeeMembers.splice(memberIndex, 1);
      this.saveToFile(this.getCommitteeMembersFilePath(), this.committeeMembers);
      return true;
    }
    return false;
  }

  // Blog Management
  static getBlogPosts(): BlogPost[] {
    this.initialize();
    return this.blogPosts.filter(post => post.isPublished);
  }

  static getAllBlogPosts(): BlogPost[] {
    this.initialize();
    return this.blogPosts;
  }

  static getBlogPostById(id: string): BlogPost | undefined {
    this.initialize();
    return this.blogPosts.find(post => post.id === id);
  }

  static addBlogPost(post: BlogPost): void {
    this.initialize();
    this.blogPosts.push(post);
    this.saveToFile(this.getBlogPostsFilePath(), this.blogPosts);
  }

  static updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    this.initialize();
    const postIndex = this.blogPosts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      this.blogPosts[postIndex] = { 
        ...this.blogPosts[postIndex], 
        ...updates,
        updatedAt: new Date()
      };
      this.saveToFile(this.getBlogPostsFilePath(), this.blogPosts);
      return this.blogPosts[postIndex];
    }
    return null;
  }

  static deleteBlogPost(id: string): boolean {
    this.initialize();
    const postIndex = this.blogPosts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      this.blogPosts.splice(postIndex, 1);
      this.saveToFile(this.getBlogPostsFilePath(), this.blogPosts);
      return true;
    }
    return false;
  }

  // Dashboard Data
  static getDashboardData(userId: string): DashboardData | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const pendingPayments = this.getPendingPaymentsByUserId(userId);
    const recentPayments = this.getPaymentsByUserId(userId)
      .filter(payment => payment.status === 'completed')
      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
      .slice(0, 5);

    const communityBalance = this.getCommunityBalance();
    const announcements = this.getBlogPosts()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    return {
      user,
      pendingPayments,
      recentPayments,
      communityBalance,
      announcements
    };
  }

  // Initialize with minimal admin data
  static async initializeSampleData(): Promise<void> {
    // Only one admin user
    const adminUser: User = {
      id: 'admin_1',
      name: 'Community Admin',
      email: 'admin@hambrianglory.lk',
      phone: '+94112345678',
      nicNumber: '198512345678',
      dateOfBirth: new Date('1985-06-15'),
      address: 'Hambrian Glory Community Office',
      role: 'admin' as 'admin',
      membershipDate: new Date('2024-01-01'),
      isActive: true
    };

    this.users = [adminUser];

    // Initialize admin password with NIC number as temporary password
    await PasswordService.initializeUserPassword(adminUser.id, adminUser.nicNumber);

    // No sample payments
    this.payments = [];

    // No sample expenses
    this.expenses = [];

    // No sample committee members
    this.committeeMembers = [];

    // No sample blog posts
    this.blogPosts = [];
  }
}
