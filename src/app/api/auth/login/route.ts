import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Initialize database if needed
    await localDB.initializeDatabase();

    // Validate user credentials
    const user = await localDB.validateUser(email, password);
    
    if (!user) {
      // Log failed login attempt
      await localDB.addLoginHistory({
        userId: '',
        email: email,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'Invalid credentials'
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is locked
    if (user.isLocked) {
      return NextResponse.json(
        { error: 'Account is locked. Please contact administrator.' },
        { status: 423 }
      );
    }

    // Check if user needs to change password (default passwords)
    const requiresPasswordChange = password === 'Admin@2025' || password === 'password123';

    // Log successful login
    await localDB.addLoginHistory({
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    });

    // Update last login
    await localDB.updateUser(user.id, {
      lastLogin: new Date().toISOString()
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      requiresPasswordChange
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
