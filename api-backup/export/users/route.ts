import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!users || !Array.isArray(users)) {
      return NextResponse.json(
        { message: 'Invalid users data provided' },
        { status: 400 }
      );
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet from users data
    const worksheet = XLSX.utils.json_to_sheet(users);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Return the Excel file as a response
    return new Response(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="hambrian_glory_members_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Failed to export users data' },
      { status: 500 }
    );
  }
}
