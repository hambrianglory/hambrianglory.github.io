import * as XLSX from 'xlsx';
import { User, Payment, Expense, ExcelRow } from '@/types';

export class ExcelService {
  /**
   * Helper function to normalize Sri Lankan phone numbers
   * Automatically adds +94 prefix when missing
   * 
   * Supported input formats:
   * - 0771234567 → +94771234567 (replace 0 with +94)
   * - 771234567 → +94771234567 (add +94 prefix)
   * - 94771234567 → +94771234567 (add + sign)
   * - +94771234567 → +94771234567 (already correct)
   * 
   * @param phone - Raw phone number from upload
   * @returns Normalized phone number with +94 prefix
   */
  static normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except the + sign
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // If it already starts with +94, return as is
    if (cleanPhone.startsWith('+94')) {
      return cleanPhone;
    }
    
    // If it starts with 94, add the + prefix
    if (cleanPhone.startsWith('94')) {
      return '+' + cleanPhone;
    }
    
    // If it starts with 0, replace with +94
    if (cleanPhone.startsWith('0')) {
      return '+94' + cleanPhone.substring(1);
    }
    
    // If it's a 9-digit number (typical Sri Lankan mobile without 0), add +94
    if (cleanPhone.length === 9 && /^[17]\d{8}$/.test(cleanPhone)) {
      return '+94' + cleanPhone;
    }
    
    // If it's a 10-digit number starting with 0, replace 0 with +94
    if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
      return '+94' + cleanPhone.substring(1);
    }
    
    // For any other case, try to add +94 if it looks like a valid Sri Lankan number
    if (cleanPhone.length >= 9 && cleanPhone.length <= 10) {
      // Remove leading 0 if present and add +94
      const withoutLeadingZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      return '+94' + withoutLeadingZero;
    }
    
    // Return original if we can't determine the format
    return phone;
  }

  static async parseExcelFile(file: File): Promise<ExcelRow[]> {
    try {
      let buffer: ArrayBuffer;
      
      // Check if we're in a browser or server environment
      if (typeof window !== 'undefined' && window.FileReader) {
        // Browser environment - use FileReader
        buffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(file);
        });
      } else {
        // Server environment - use file.arrayBuffer()
        buffer = await file.arrayBuffer();
      }

      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      return jsonData as ExcelRow[];
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to parse CSV files specifically
  static async parseCSVFile(file: File): Promise<ExcelRow[]> {
    try {
      let text: string;
      
      // Check if we're in a browser or server environment
      if (typeof window !== 'undefined' && window.FileReader) {
        // Browser environment - use FileReader
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read CSV file'));
          reader.readAsText(file);
        });
      } else {
        // Server environment - use file.text()
        text = await file.text();
      }

      // Parse CSV using XLSX library
      const workbook = XLSX.read(text, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      return jsonData as ExcelRow[];
    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced method that handles both Excel and CSV files
  static async parseFile(file: File): Promise<ExcelRow[]> {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return this.parseCSVFile(file);
    } else {
      return this.parseExcelFile(file);
    }
  }

  static async parseUsersFromExcel(file: File): Promise<User[]> {
    try {
      const rows = await this.parseFile(file);
      
      const users = rows.map((row, index) => {
        // Better data validation and type conversion
        const dateOfBirth = row.dateOfBirth ? new Date(row.dateOfBirth.toString()) : new Date('1990-01-01');
        const membershipDate = row.membershipDate ? new Date(row.membershipDate.toString()) : new Date();
        
        // Normalize phone number to include +94 prefix
        const rawPhone = row.phone?.toString() || '';
        const normalizedPhone = this.normalizePhoneNumber(rawPhone);
        
        const user = {
          id: row.id?.toString() || `user_${index + 1}`,
          name: row.name?.toString() || '',
          email: row.email?.toString() || '',
          phone: normalizedPhone,
          nicNumber: row.nicNumber?.toString() || '',
          dateOfBirth: isNaN(dateOfBirth.getTime()) ? new Date('1990-01-01') : dateOfBirth,
          address: row.address?.toString() || '',
          role: (row.role?.toString().toLowerCase() === 'admin' ? 'admin' : 'member') as 'admin' | 'member',
          houseNumber: row.houseNumber?.toString() || '',
          membershipDate: isNaN(membershipDate.getTime()) ? new Date() : membershipDate,
          isActive: row.isActive?.toString().toLowerCase() === 'true' || row.isActive === 'true' || true,
        };
        
        return user;
      });
      
      return users;
    } catch (error) {
      throw new Error(`Failed to parse users from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async parsePaymentsFromExcel(file: File): Promise<Payment[]> {
    try {
      const rows = await this.parseFile(file);
      return rows.map((row, index) => {
        // Better data validation and type conversion
        const paymentDate = row.paymentDate ? new Date(row.paymentDate.toString()) : new Date();
        const amount = Number(row.amount) || 0;
        const year = row.year ? Number(row.year) : undefined;
        
        return {
          id: row.id?.toString() || `payment_${index + 1}`,
          userId: row.userId?.toString() || '',
          amount: amount,
          paymentDate: isNaN(paymentDate.getTime()) ? new Date() : paymentDate,
          paymentType: (row.paymentType?.toString() || 'quarterly_sanda_fee') as Payment['paymentType'],
          description: row.description?.toString() || '',
          receiptNumber: row.receiptNumber?.toString() || '',
          status: (row.status?.toString() || 'pending') as Payment['status'],
          quarter: (row.quarter?.toString() || undefined) as Payment['quarter'],
          year: year && !isNaN(year) ? year : undefined,
        };
      });
    } catch (error) {
      throw new Error(`Failed to parse payments from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static exportUsersToExcel(users: User[]): void {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'community_users.xlsx');
  }

  static exportPaymentsToExcel(payments: Payment[]): void {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    XLSX.writeFile(workbook, 'community_payments.xlsx');
  }

  static exportExpensesToExcel(expenses: Expense[]): void {
    const worksheet = XLSX.utils.json_to_sheet(expenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, 'community_expenses.xlsx');
  }

  static generateUserTemplate(): void {
    const template = [
      {
        id: 'user_001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+94112345678',
        nicNumber: '199012345678',
        dateOfBirth: '1990-03-22',
        address: '123 Galle Road, Colombo 03',
        role: 'member',
        houseNumber: 'A-101',
        membershipDate: '2024-01-01',
        isActive: 'true'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template');
    XLSX.writeFile(workbook, 'users_template.xlsx');
  }

  static generatePaymentTemplate(): void {
    const template = [
      {
        id: 'payment_001',
        userId: 'user_001',
        amount: 500,
        paymentDate: '2024-03-31',
        paymentType: 'quarterly_sanda_fee',
        quarter: 'Q1',
        year: 2024,
        description: 'Annual Sanda Fee Q1 2024',
        receiptNumber: 'RCP001',
        status: 'completed'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments Template');
    XLSX.writeFile(workbook, 'payments_template.xlsx');
  }
}
