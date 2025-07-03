import { NextRequest, NextResponse } from 'next/server';

let debugInfo: any = null;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    debugInfo = {
      timestamp: new Date().toISOString(),
      data: data
    };
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log debug info' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(debugInfo || { message: 'No debug info available' });
}
