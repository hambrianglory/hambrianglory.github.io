import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Minimal API working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Minimal POST working',
    timestamp: new Date().toISOString()
  });
}
