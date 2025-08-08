import { NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/lib/whatsappService';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const revalidate = 0

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.headers.get('x-auth-token') ||
                request.nextUrl.searchParams.get('token');

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// GET - Check session status
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionStatus = await whatsAppService.checkSessionStatus();
    
    return NextResponse.json({
      success: true,
      status: sessionStatus
    });

  } catch (error) {
    console.error('WhatsApp session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Start or manage session
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'start':
        const startResult = await whatsAppService.startSession();
        return NextResponse.json({
          success: startResult.success,
          qrCode: startResult.qrCode,
          error: startResult.error,
          message: startResult.success ? 'Session started. Please scan QR code.' : 'Failed to start session'
        });

      case 'status':
        const statusResult = await whatsAppService.checkSessionStatus();
        return NextResponse.json({
          success: statusResult.success,
          status: statusResult.status,
          error: statusResult.error
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('WhatsApp session management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
