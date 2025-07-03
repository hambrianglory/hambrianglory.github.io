import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('File received:', file ? file.name : 'No file');
    console.log('Type received:', type);

    if (!file) {
      console.log('No file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      console.log('No type in request');
      return NextResponse.json(
        { error: 'No type provided' },
        { status: 400 }
      );
    }

    // Try to read the file content
    const text = await file.text();
    console.log('File content preview:', text.substring(0, 200));

    return NextResponse.json({
      message: 'Test upload successful',
      fileName: file.name,
      fileSize: file.size,
      type: type,
      contentPreview: text.substring(0, 100)
    });

  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { 
        error: 'Test upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
