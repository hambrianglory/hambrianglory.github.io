import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'API Health Check OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    netlifyContext: process.env.CONTEXT,
    // Check environment variables without exposing values
    envCheck: {
      hasJWT_SECRET: !!process.env.JWT_SECRET,
      hasADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      hasADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      hasNEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      ADMIN_EMAIL_value: process.env.ADMIN_EMAIL || 'not_set',
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
