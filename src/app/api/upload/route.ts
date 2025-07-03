import { NextRequest, NextResponse } from 'next/server';
import { ExcelService } from '@/lib/excel';
import { DataService } from '@/lib/data';
import { User, Payment } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'users' && type !== 'payments')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "users" or "payments"' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidFile) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.' },
        { status: 400 }
      );
    }

    let uploadResults;

    if (type === 'users') {
      // Process users file
      const users = await ExcelService.parseUsersFromExcel(file);
      
      // Validate users data
      const validationErrors = validateUsersData(users);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Data validation failed',
            validationErrors,
            totalRows: users.length
          },
          { status: 400 }
        );
      }

      // Update existing users or add new ones
      let updatedCount = 0;
      let addedCount = 0;
      const errors: string[] = [];

      for (const user of users) {
        try {
          const existingUser = DataService.getUserById(user.id) || DataService.getUserByEmail(user.email);
          
          if (existingUser) {
            // Update existing user
            const updated = DataService.updateUser(existingUser.id, user);
            if (updated) {
              updatedCount++;
            } else {
              errors.push(`Failed to update user: ${user.name} (${user.email})`);
            }
          } else {
            // Add new user
            await DataService.addUser(user);
            addedCount++;
          }
        } catch (error) {
          errors.push(`Error processing user ${user.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      uploadResults = {
        type: 'users',
        totalProcessed: users.length,
        added: addedCount,
        updated: updatedCount,
        errors: errors,
        success: errors.length === 0
      };

    } else if (type === 'payments') {
      // Process payments file
      const payments = await ExcelService.parsePaymentsFromExcel(file);
      
      // Validate payments data
      const validationErrors = validatePaymentsData(payments);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Data validation failed',
            validationErrors,
            totalRows: payments.length
          },
          { status: 400 }
        );
      }

      // Add payments
      let addedCount = 0;
      let updatedCount = 0;
      const errors: string[] = [];

      for (const payment of payments) {
        try {
          // Check if payment already exists
          const existingPayments = DataService.getPayments();
          const existingPayment = existingPayments.find(p => 
            p.id === payment.id || 
            (p.userId === payment.userId && p.quarter === payment.quarter && p.year === payment.year)
          );

          if (existingPayment) {
            // Update existing payment
            const updated = DataService.updatePayment(existingPayment.id, payment);
            if (updated) {
              updatedCount++;
            } else {
              errors.push(`Failed to update payment: ${payment.id}`);
            }
          } else {
            // Add new payment
            DataService.addPayment(payment);
            addedCount++;
          }
        } catch (error) {
          errors.push(`Error processing payment ${payment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      uploadResults = {
        type: 'payments',
        totalProcessed: payments.length,
        added: addedCount,
        updated: updatedCount,
        errors: errors,
        success: errors.length === 0
      };
    }

    return NextResponse.json({
      message: `${type} file processed successfully`,
      results: uploadResults
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process file. Please check the file format and try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Validation functions
function validateUsersData(users: User[]): string[] {
  const errors: string[] = [];
  
  users.forEach((user, index) => {
    const rowNum = index + 1;
    
    // Required fields validation
    if (!user.name || user.name.trim() === '') {
      errors.push(`Row ${rowNum}: Name is required`);
    }
    
    if (!user.email || user.email.trim() === '') {
      errors.push(`Row ${rowNum}: Email is required`);
    } else if (!isValidEmail(user.email)) {
      errors.push(`Row ${rowNum}: Invalid email format`);
    }
    
    if (!user.phone || user.phone.trim() === '') {
      errors.push(`Row ${rowNum}: Phone number is required`);
    } else if (!isValidSriLankanPhone(user.phone)) {
      errors.push(`Row ${rowNum}: Invalid phone number format. Phone was normalized to: ${user.phone}. Please check if this is correct.`);
    }
    
    if (!user.nicNumber || user.nicNumber.trim() === '') {
      errors.push(`Row ${rowNum}: NIC number is required`);
    } else if (!isValidNIC(user.nicNumber)) {
      errors.push(`Row ${rowNum}: Invalid NIC number format`);
    }
    
    if (!user.address || user.address.trim() === '') {
      errors.push(`Row ${rowNum}: Address is required`);
    }
    
    if (!user.houseNumber || user.houseNumber.trim() === '') {
      errors.push(`Row ${rowNum}: House number is required`);
    }
    
    // Role validation
    if (user.role && !['admin', 'member'].includes(user.role)) {
      errors.push(`Row ${rowNum}: Role must be either 'admin' or 'member'`);
    }
  });
  
  // Check for duplicate emails
  const emails = users.map(u => u.email.toLowerCase());
  const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
  if (duplicateEmails.length > 0) {
    errors.push(`Duplicate emails found: ${[...new Set(duplicateEmails)].join(', ')}`);
  }
  
  return errors;
}

function validatePaymentsData(payments: Payment[]): string[] {
  const errors: string[] = [];
  
  payments.forEach((payment, index) => {
    const rowNum = index + 1;
    
    // Required fields validation
    if (!payment.userId || payment.userId.trim() === '') {
      errors.push(`Row ${rowNum}: User ID is required`);
    }
    
    if (!payment.amount || payment.amount <= 0) {
      errors.push(`Row ${rowNum}: Valid amount is required (must be greater than 0)`);
    }
    
    if (!payment.paymentType) {
      errors.push(`Row ${rowNum}: Payment type is required`);
    } else if (!['quarterly_sanda_fee', 'maintenance', 'special_assessment', 'fine'].includes(payment.paymentType)) {
      errors.push(`Row ${rowNum}: Invalid payment type`);
    }
    
    if (!payment.description || payment.description.trim() === '') {
      errors.push(`Row ${rowNum}: Description is required`);
    }
    
    // Status validation
    if (payment.status && !['pending', 'completed', 'overdue'].includes(payment.status)) {
      errors.push(`Row ${rowNum}: Status must be 'pending', 'completed', or 'overdue'`);
    }
    
    // Quarter validation for quarterly payments
    if (payment.paymentType === 'quarterly_sanda_fee') {
      if (!payment.quarter || !['Q1', 'Q2', 'Q3', 'Q4'].includes(payment.quarter)) {
        errors.push(`Row ${rowNum}: Valid quarter (Q1, Q2, Q3, Q4) is required for quarterly payments`);
      }
      
      if (!payment.year || payment.year < 2020 || payment.year > 2030) {
        errors.push(`Row ${rowNum}: Valid year (2020-2030) is required for quarterly payments`);
      }
    }
  });
  
  return errors;
}

// Helper validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidSriLankanPhone(phone: string): boolean {
  // Sri Lankan phone number format: +94xxxxxxxxx (9 digits after +94)
  // More flexible validation since we auto-normalize
  const phoneRegex = /^\+94[0-9]{9}$/;
  return phoneRegex.test(phone);
}

function isValidNIC(nic: string): boolean {
  // Sri Lankan NIC format: old (9 digits + V) or new (12 digits)
  const oldNICRegex = /^[0-9]{9}[vVxX]$/;
  const newNICRegex = /^[0-9]{12}$/;
  return oldNICRegex.test(nic) || newNICRegex.test(nic);
}
