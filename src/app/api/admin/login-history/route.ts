import { NextRequest, NextResponse } from 'next/server';
import { LoginHistoryService } from '@/lib/loginHistory';
import jwt from 'jsonwebtoken';

// Verify admin token
function verifyAdminToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get login history and statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const roleFilter = searchParams.get('role') || 'all';
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      // Return only statistics
      const stats = LoginHistoryService.getLoginStats(days);
      return NextResponse.json({
        success: true,
        stats
      });
    }

    // Get login history with pagination
    const historyData = LoginHistoryService.getLoginHistory(days, limit, offset, roleFilter);
    const stats = LoginHistoryService.getLoginStats(days);

    return NextResponse.json({
      success: true,
      history: historyData.entries,
      totalCount: historyData.totalCount,
      hasMore: historyData.hasMore,
      stats,
      pagination: {
        limit,
        offset,
        days,
        roleFilter
      }
    });

  } catch (error) {
    console.error('Error getting login history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve login history' },
      { status: 500 }
    );
  }
}

// POST - Record logout (for session tracking)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { action } = await request.json();

    if (action === 'logout' && decoded.loginId) {
      LoginHistoryService.recordLogout(decoded.loginId);
      return NextResponse.json({
        success: true,
        message: 'Logout recorded successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing login ID' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error recording logout:', error);
    return NextResponse.json(
      { error: 'Failed to record logout' },
      { status: 500 }
    );
  }
}
