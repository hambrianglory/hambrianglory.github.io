import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE LOGIN TEST ===');
    
    // Basic request parsing
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    const { email, password } = body;
    console.log('Email:', email);
    console.log('Password length:', password ? password.length : 0);
    
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasJWT_SECRET: !!process.env.JWT_SECRET,
      hasADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      hasADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      ADMIN_EMAIL_value: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD_length: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.length : 0,
    };
    
    console.log('Environment check:', envCheck);
    
    // Simple hardcoded admin check
    const isAdmin = email === 'admin@hambrianglory.lk' && password === 'HambrianGlory@2025!Admin';
    const isAdminEnv = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
    
    console.log('Authentication checks:', {
      isAdmin,
      isAdminEnv,
      emailMatch: email === process.env.ADMIN_EMAIL,
      passwordMatch: password === process.env.ADMIN_PASSWORD
    });
    
    if (isAdmin || isAdminEnv) {
      return NextResponse.json({
        success: true,
        message: 'Simple admin authentication successful',
        method: isAdmin ? 'hardcoded' : 'environment',
        envCheck
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Authentication failed',
      envCheck
    }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('=== SIMPLE LOGIN ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      error: 'Server error in simple login',
      details: error instanceof Error ? error.message : String(error),
      type: typeof error
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
