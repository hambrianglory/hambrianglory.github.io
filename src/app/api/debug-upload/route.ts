import { NextRequest, NextResponse } from 'next/server';
import { ExcelService } from '@/lib/excel';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Step 1: Try to parse the file
    let parsedData;
    try {
      parsedData = await ExcelService.parseUsersFromExcel(file);
    } catch (parseError) {
      return NextResponse.json({
        error: 'File parsing failed',
        details: parseError instanceof Error ? parseError.message : 'Unknown error',
        step: 'parsing'
      }, { status: 500 });
    }

    // Step 2: Check if we got data
    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json({
        error: 'No data found in file',
        step: 'data_check'
      }, { status: 400 });
    }

    // Step 3: Return basic info about the parsed data
    return NextResponse.json({
      success: true,
      message: 'File parsed successfully',
      userCount: parsedData.length,
      firstUser: parsedData[0],
      allUsers: parsedData
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
