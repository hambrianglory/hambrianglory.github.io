import { NextRequest, NextResponse } from 'next/server';
import { LoginHistoryService } from '@/lib/loginHistory';
import jwt from 'jsonwebtoken';

// Required for static export
export const dynamic = 'force-static';

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

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = [
    'Date',
    'Time',
    'User Name',
    'Email',
    'Role',
    'Status',
    'Failure Reason',
    'IP Address',
    'User Agent',
    'Session Duration (min)',
    'Logout Time'
  ];

  const csvRows = [headers.join(',')];

  data.forEach(entry => {
    const loginDate = new Date(entry.timestamp);
    const logoutDate = entry.logoutTime ? new Date(entry.logoutTime) : null;
    
    const row = [
      loginDate.toLocaleDateString(),
      loginDate.toLocaleTimeString(),
      `"${entry.userName || 'Unknown'}"`,
      `"${entry.userEmail || 'Unknown'}"`,
      entry.userRole || 'unknown',
      entry.success ? 'Success' : 'Failed',
      `"${entry.failureReason || ''}"`,
      `"${entry.ipAddress || 'Unknown'}"`,
      `"${(entry.userAgent || 'Unknown').substring(0, 100)}"`, // Truncate user agent
      entry.sessionDuration || '',
      logoutDate ? logoutDate.toLocaleTimeString() : ''
    ];
    
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Helper function to convert data to JSON for Excel import
function convertToJSON(data: any[]): string {
  const formattedData = data.map(entry => {
    const loginDate = new Date(entry.timestamp);
    const logoutDate = entry.logoutTime ? new Date(entry.logoutTime) : null;
    
    return {
      'Date': loginDate.toLocaleDateString(),
      'Time': loginDate.toLocaleTimeString(),
      'User Name': entry.userName || 'Unknown',
      'Email': entry.userEmail || 'Unknown',
      'Role': entry.userRole || 'unknown',
      'Status': entry.success ? 'Success' : 'Failed',
      'Failure Reason': entry.failureReason || '',
      'IP Address': entry.ipAddress || 'Unknown',
      'User Agent': (entry.userAgent || 'Unknown').substring(0, 200),
      'Session Duration (min)': entry.sessionDuration || '',
      'Logout Time': logoutDate ? logoutDate.toLocaleTimeString() : '',
      'Login ID': entry.id
    };
  });

  return JSON.stringify(formattedData, null, 2);
}

// GET - Download login history
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
    const roleFilter = searchParams.get('role') || 'all';
    const format = searchParams.get('format') || 'csv'; // csv or json
    const filename = searchParams.get('filename') || `login-history-${new Date().toISOString().split('T')[0]}`;

    // Get all login history for the specified period
    const historyData = LoginHistoryService.getLoginHistory(days, 10000, 0, roleFilter);
    const stats = LoginHistoryService.getLoginStats(days);

    if (historyData.entries.length === 0) {
      return NextResponse.json(
        { error: 'No login history data found for the specified period' },
        { status: 404 }
      );
    }

    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'json') {
      content = convertToJSON(historyData.entries);
      contentType = 'application/json';
      fileExtension = 'json';
    } else {
      // Default to CSV
      content = convertToCSV(historyData.entries);
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    // Add BOM for proper UTF-8 encoding in Excel
    if (format === 'csv') {
      content = '\uFEFF' + content;
    }

    const response = new NextResponse(content);
    
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}.${fileExtension}"`);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Add custom headers with summary information
    response.headers.set('X-Total-Records', historyData.totalCount.toString());
    response.headers.set('X-Successful-Logins', stats.successfulLogins.toString());
    response.headers.set('X-Failed-Logins', stats.failedLogins.toString());
    response.headers.set('X-Date-Range', `${days} days`);

    return response;

  } catch (error) {
    console.error('Error downloading login history:', error);
    return NextResponse.json(
      { error: 'Failed to download login history' },
      { status: 500 }
    );
  }
}
