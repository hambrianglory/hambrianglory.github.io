import { NextRequest, NextResponse } from 'next/server';
import { PasswordService } from '@/lib/passwordService';
import { DataService } from '@/lib/data';
import { LoginHistoryService } from '@/lib/loginHistory';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isChangePassword, oldPassword, newPassword } = await request.json();

    // Handle password change request
    if (isChangePassword) {
      if (!email || !oldPassword || !newPassword) {
        return NextResponse.json(
          { message: 'Email, old password, and new password are required' },
          { status: 400 }
        );
      }

      const user = DataService.getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      const result = await PasswordService.changePassword(user.id, oldPassword, newPassword);
      
      if (result.success) {
        return NextResponse.json({ 
          message: result.message,
          requiresPasswordChange: false 
        });
      } else {
        return NextResponse.json(
          { message: result.message },
          { status: 400 }
        );
      }
    }

    // Handle login request
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Initialize sample data if no users exist
    const users = DataService.getUsers();
    if (users.length === 0) {
      await DataService.initializeSampleData();
    }

    // Find user by email
    const user = DataService.getUserByEmail(email);
    
    // Get client information for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    if (!user) {
      // Record failed login attempt
      LoginHistoryService.recordLoginAttempt(
        'unknown',
        email,
        'Unknown User',
        'unknown',
        false,
        ipAddress,
        userAgent,
        'Invalid email'
      );
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Initialize password if it doesn't exist (for existing users)
    await PasswordService.initializeUserPassword(user.id, user.nicNumber);

    // Verify password
    const passwordResult = await PasswordService.verifyUserPassword(user.id, password);

    if (passwordResult.isLocked) {
      // Record failed login attempt (account locked)
      LoginHistoryService.recordLoginAttempt(
        user.id,
        user.email,
        user.name,
        user.role,
        false,
        ipAddress,
        userAgent,
        'Account locked'
      );
      
      return NextResponse.json(
        { message: 'Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.' },
        { status: 423 }
      );
    }

    if (!passwordResult.valid) {
      // Record failed login attempt (invalid password)
      LoginHistoryService.recordLoginAttempt(
        user.id,
        user.email,
        user.name,
        user.role,
        false,
        ipAddress,
        userAgent,
        'Invalid password'
      );
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Record successful login
    const loginId = LoginHistoryService.recordLoginAttempt(
      user.id,
      user.email,
      user.name,
      user.role,
      true,
      ipAddress,
      userAgent
    );

    // Generate JWT token with login ID for session tracking
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        loginId: loginId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      requiresPasswordChange: passwordResult.isTemporary,
      loginId: loginId
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
