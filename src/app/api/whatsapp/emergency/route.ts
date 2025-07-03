import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { DataService } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emergencyType, details, actionRequired, userIds } = body;

    if (!emergencyType || !details || !actionRequired) {
      return NextResponse.json(
        { error: 'Emergency type, details, and action required are all required' },
        { status: 400 }
      );
    }

    // Get real users from database
    const allUsers = DataService.getUsers();
    const activeMembers = allUsers.filter(user => user.isActive && user.role === 'member');

    // Filter users if specific userIds provided, otherwise send to all active members
    const targetUsers = userIds && userIds.length > 0 
      ? activeMembers.filter(user => userIds.includes(user.id))
      : activeMembers;

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No valid active members found' },
        { status: 400 }
      );
    }

    // Log phone numbers for debugging
    console.log('🚨 Sending emergency alert to users:', targetUsers.map(u => ({ 
      name: u.name, 
      phone: u.phone,
      email: u.email 
    })));

    // Send emergency alert via WhatsApp
    const result = await WhatsAppService.sendEmergencyAlert(emergencyType, details, actionRequired, targetUsers);

    return NextResponse.json({
      message: 'Emergency alert sent successfully',
      result: {
        totalSent: result.successful,
        totalFailed: result.failed,
        totalUsers: result.total,
        details: result.results
      }
    });

  } catch (error) {
    console.error('Error sending WhatsApp emergency alert:', error);
    return NextResponse.json(
      { error: 'Failed to send emergency alert' },
      { status: 500 }
    );
  }
}
