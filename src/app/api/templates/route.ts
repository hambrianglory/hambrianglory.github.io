import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { GoogleSheetsService } from '@/lib/googlesheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'excel'; // 'excel' or 'csv'

    if (format === 'csv') {
      // Generate CSV format for Google Sheets
      let csvContent: string;
      let filename: string;

      switch (type) {
        case 'users':
          csvContent = GoogleSheetsService.generateUsersCSV();
          filename = 'users_template.csv';
          break;
        case 'payments':
          csvContent = GoogleSheetsService.generatePaymentsCSV();
          filename = 'payments_template.csv';
          break;
        default:
          return NextResponse.json(
            { message: 'Invalid template type. Use "users" or "payments"' },
            { status: 400 }
          );
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Generate Excel format (existing functionality)
      let workbook: XLSX.WorkBook;
      let filename: string;

      switch (type) {
        case 'users':
          const userTemplate = [
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
          const userWorksheet = XLSX.utils.json_to_sheet(userTemplate);
          workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, userWorksheet, 'Users Template');
          filename = 'users_template.xlsx';
          break;
        
        case 'payments':
          const paymentTemplate = [
            {
              id: 'payment_001',
              userId: 'user_001',
              amount: 50000,
              paymentDate: '2025-03-31',
              paymentType: 'quarterly_sanda_fee',
              quarter: 'Q1',
              year: 2025,
              description: 'Annual Sanda Fee Q1 2025',
              status: 'completed',
              method: 'cash'
            },
            {
              id: 'payment_002',
              userId: 'user_001',
              amount: 50000,
              paymentDate: '2025-06-30',
              paymentType: 'quarterly_sanda_fee',
              quarter: 'Q2',
              year: 2025,
              description: 'Annual Sanda Fee Q2 2025',
              status: 'pending',
              method: 'bank_transfer'
            }
          ];
          const paymentWorksheet = XLSX.utils.json_to_sheet(paymentTemplate);
          workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, paymentWorksheet, 'Payments Template');
          filename = 'payments_template.xlsx';
          break;
        
        default:
          return NextResponse.json(
            { message: 'Invalid template type. Use "users" or "payments"' },
            { status: 400 }
          );
      }

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Return file as download
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
