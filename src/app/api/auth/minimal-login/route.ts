import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

// Simple hardcoded authentication without complex dependencies
export async function POST(request: NextRequest) {
  try {
    console.log('=== MINIMAL LOGIN ATTEMPT ===');
    
    const { email, password } = await request.json();
    console.log('Login request received for:', email);
    
    // Check environment variables
    console.log('Environment variables check:', {
      hasJWT_SECRET: !!process.env.JWT_SECRET,
      hasADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      hasADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Simple admin authentication
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hambrianglory.lk';
    const adminPassword = process.env.ADMIN_PASSWORD || 'HambrianGlory@2025!Admin';
    
    console.log('Authentication comparison:', {
      requestEmail: email,
      adminEmail: adminEmail,
      emailMatch: email === adminEmail,
      requestPassword: password,
      adminPassword: adminPassword,
      passwordMatch: password === adminPassword,
      requestPasswordLength: password ? password.length : 0,
      adminPasswordLength: adminPassword ? adminPassword.length : 0
    });
    
    if (email === adminEmail && password === adminPassword) {
      console.log('✅ Admin authentication successful');
      
      // Simple token (not JWT for now)
      const simpleToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      return NextResponse.json({
        success: true,
        token: simpleToken,
        user: {
          id: 'admin',
          email: email,
          role: 'admin',
          name: 'Administrator'
        },
        message: 'Login successful with minimal authentication'
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid credentials',
      debug: {
        requestEmail: email,
        adminEmailSet: !!process.env.ADMIN_EMAIL,
        adminPasswordSet: !!process.env.ADMIN_PASSWORD,
        emailMatch: email === adminEmail,
        passwordMatch: password === adminPassword,
        adminEmailFallback: adminEmail,
        adminPasswordLength: adminPassword ? adminPassword.length : 0
      }
    }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Minimal login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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
