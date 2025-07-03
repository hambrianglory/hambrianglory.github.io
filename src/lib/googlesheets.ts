import { User, Payment, Expense } from '@/types';

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  apiKey?: string;
  clientEmail?: string;
  privateKey?: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig = {}) {
    this.config = config;
  }

  // Parse CSV data (Google Sheets export format)
  static parseCSVData(csvText: string): Record<string, any>[] {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(value => value.trim().replace(/"/g, ''));
      const rowObject: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        rowObject[header] = values[index] || '';
      });
      
      return rowObject;
    });
  }

  // Parse CSV file from Google Sheets
  static async parseCSVFile(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const data = this.parseCSVData(csvText);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  }

  // Parse users from CSV data
  static async parseUsersFromCSV(file: File): Promise<User[]> {
    const rows = await this.parseCSVFile(file);
    return rows.map((row, index) => ({
      id: row.id?.toString() || `user_${index + 1}`,
      name: row.name?.toString() || '',
      email: row.email?.toString() || '',
      phone: row.phone?.toString() || '',
      nicNumber: row.nicNumber?.toString() || '',
      dateOfBirth: new Date(row.dateOfBirth?.toString() || '1990-01-01'),
      address: row.address?.toString() || '',
      role: (row.role?.toString() === 'admin' ? 'admin' : 'member') as 'admin' | 'member',
      houseNumber: row.houseNumber?.toString() || '',
      membershipDate: new Date(row.membershipDate?.toString() || Date.now()),
      isActive: row.isActive?.toString().toLowerCase() === 'true' || true,
    }));
  }

  // Parse payments from CSV data
  static async parsePaymentsFromCSV(file: File): Promise<Payment[]> {
    const rows = await this.parseCSVFile(file);
    return rows.map((row, index) => ({
      id: row.id?.toString() || `payment_${index + 1}`,
      userId: row.userId?.toString() || '',
      amount: parseFloat(row.amount?.toString() || '0'),
      paymentDate: new Date(row.paymentDate?.toString() || Date.now()),
      paymentType: 'quarterly_sanda_fee' as const,
      description: row.description?.toString() || 'Quarterly Sanda Fee',
      status: (row.status?.toString() as 'pending' | 'completed' | 'overdue') || 'pending',
      quarter: (row.quarter?.toString() as 'Q1' | 'Q2' | 'Q3' | 'Q4') || 'Q1',
      year: parseInt(row.year?.toString() || new Date().getFullYear().toString()),
      method: row.method?.toString() || 'cash',
      receiptNumber: row.receiptNumber?.toString() || '',
    }));
  }

  // Generate CSV content for users template
  static generateUsersCSV(): string {
    const headers = [
      'id', 'name', 'email', 'phone', 'nicNumber', 'dateOfBirth', 
      'address', 'role', 'houseNumber', 'membershipDate', 'isActive'
    ];
    
    const sampleData = [
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

    const csvRows = [
      headers.join(','),
      ...sampleData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  // Generate CSV content for payments template
  static generatePaymentsCSV(): string {
    const headers = [
      'id', 'userId', 'amount', 'paymentDate', 'paymentType', 
      'description', 'status', 'quarter', 'year', 'method', 'receiptNumber'
    ];
    
    const currentYear = new Date().getFullYear();
    const sampleData = [
      {
        id: 'payment_001',
        userId: 'user_001',
        amount: '50000',
        paymentDate: `${currentYear}-03-31`,
        paymentType: 'quarterly_sanda_fee',
        description: 'Q1 2025 Annual Sanda Fee',
        status: 'completed',
        quarter: 'Q1',
        year: currentYear.toString(),
        method: 'cash',
        receiptNumber: 'RCP001'
      },
      {
        id: 'payment_002',
        userId: 'user_001',
        amount: '50000',
        paymentDate: `${currentYear}-06-30`,
        paymentType: 'quarterly_sanda_fee',
        description: 'Q2 2025 Annual Sanda Fee',
        status: 'pending',
        quarter: 'Q2',
        year: currentYear.toString(),
        method: 'bank_transfer',
        receiptNumber: ''
      }
    ];

    const csvRows = [
      headers.join(','),
      ...sampleData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  // Google Sheets API integration methods
  async connectToSheet(spreadsheetId: string): Promise<boolean> {
    try {
      // This would integrate with Google Sheets API
      // For now, we'll return true to indicate successful connection
      this.config.spreadsheetId = spreadsheetId;
      return true;
    } catch (error) {
      console.error('Failed to connect to Google Sheet:', error);
      return false;
    }
  }

  async readSheetData(range: string): Promise<any[][]> {
    // This would use Google Sheets API to read data
    // Implementation would depend on authentication method
    throw new Error('Google Sheets API integration not implemented yet');
  }

  async writeSheetData(range: string, values: any[][]): Promise<boolean> {
    // This would use Google Sheets API to write data
    // Implementation would depend on authentication method
    throw new Error('Google Sheets API integration not implemented yet');
  }

  // Generate Google Sheets URLs for templates
  static generateTemplateLinks() {
    return {
      users: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0',
      payments: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=1'
    };
  }

  // Instructions for Google Sheets setup
  static getSetupInstructions(): string {
    return `
To use Google Sheets with this system:

1. Create a new Google Sheet
2. For Users Sheet:
   - Create columns: id, name, email, phone, nicNumber, dateOfBirth, address, role, houseNumber, membershipDate, isActive
   
3. For Payments Sheet:
   - Create columns: id, userId, amount, paymentDate, paymentType, description, status, quarter, year, method
   
4. To import data:
   - Export your Google Sheet as CSV
   - Upload the CSV file using the import function
   
5. To export data:
   - Download the CSV template
   - Import it into your Google Sheet
`;
  }
}
