import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = AuthService.verifyToken(token);
    
    const dashboardData = DataService.getDashboardData(decoded.userId);
    if (!dashboardData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid token or server error' },
      { status: 401 }
    );
  }
}
