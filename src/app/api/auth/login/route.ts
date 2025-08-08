import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Handle CORS preflight requests
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

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN API CALLED ==='); // Debug log
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasJWT_SECRET: !!process.env.JWT_SECRET,
      hasADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      hasADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    });
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email); // Debug log

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Check if environment variables are set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validate user credentials
    console.log('Attempting to authenticate user...');
    
    // First check if this is admin login using environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hambrianglory.lk';
    const adminPassword = process.env.ADMIN_PASSWORD || 'HambrianGlory@2025!Admin';
    
    console.log('Admin credentials check:', {
      requestedEmail: email,
      adminEmail: adminEmail,
      isAdminEmail: email === adminEmail,
      hasAdminPassword: !!adminPassword
    });
    
    if (email === adminEmail && password === adminPassword) {
      console.log('✅ Environment variable admin authentication successful');
      // Create admin user object for token generation
      const adminUser = {
        id: 'admin-env',
        email: adminEmail,
        role: 'admin',
        name: 'Administrator',
        isActive: true,
        isLocked: false
      };
      
      // Generate JWT token
      console.log('Generating JWT token for admin...');
      let token;
      try {
        token = jwt.sign(
          { 
            userId: adminUser.id, 
            email: adminUser.email, 
            role: adminUser.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log('JWT token generated successfully');
      } catch (jwtError) {
        console.error('JWT generation error:', jwtError);
        return NextResponse.json(
          { error: 'Token generation error', details: jwtError instanceof Error ? jwtError.message : 'Unknown error' },
          { 
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name
        },
        requiresPasswordChange: false
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // If not admin, try database authentication
    console.log('Attempting database authentication...');
    let user;
    try {
      user = await localDB.authenticateUser(email, password);
      console.log('Database authentication result:', user ? 'success' : 'failed');
    } catch (authError) {
      console.error('Database authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication system error', details: authError instanceof Error ? authError.message : 'Unknown error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Check if user is locked
    if (user.isLocked) {
      return NextResponse.json(
        { error: 'Account is locked. Please contact administrator.' },
        { 
          status: 423,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Check if user needs to change password (default passwords)
    const requiresPasswordChange = password === 'Admin@2025' || password === 'password123';

    // Generate JWT token
    console.log('Generating JWT token...');
    let token;
    try {
      token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('JWT token generated successfully');
    } catch (jwtError) {
      console.error('JWT generation error:', jwtError);
      return NextResponse.json(
        { error: 'Token generation error', details: jwtError instanceof Error ? jwtError.message : 'Unknown error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      requiresPasswordChange
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
