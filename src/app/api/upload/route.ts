import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!type || !['users', 'payments'].includes(type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "users" or "payments"' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let data: any[] = [];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'csv') {
        // Handle CSV files
        const csvContent = buffer.toString('utf-8');
        const workbook = XLSX.read(csvContent, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Handle Excel files
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        return NextResponse.json(
          { error: 'Unsupported file format. Please use CSV, XLSX, or XLS files.' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse file. Please ensure it\'s a valid CSV or Excel file.' },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the file' },
        { status: 400 }
      );
    }

    // Process the data based on type
    let results;
    console.log('📊 Processing import for type:', type.toLowerCase());
    console.log('📊 Data to import:', data.length, 'records');
    
    if (type.toLowerCase() === 'users') {
      results = await localDB.importUsers(data);
      console.log('📊 Import results:', JSON.stringify(results, null, 2));
    } else if (type.toLowerCase() === 'payments') {
      results = await localDB.importPayments(data);
      console.log('📊 Import results:', JSON.stringify(results, null, 2));
    } else {
      return NextResponse.json(
        { error: 'Invalid import type' },
        { status: 400 }
      );
    }

    // Format response
    const response = {
      success: results.success,
      results: {
        totalProcessed: results.added + results.updated,
        added: results.added,
        updated: results.updated,
        errors: results.errors || [],
        success: results.success
      }
    };

    if (results.errors && results.errors.length > 0) {
      response.results.errors = results.errors;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
