import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { DataService } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, userIds } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
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
    console.log('📱 Sending WhatsApp to users:', targetUsers.map(u => ({ 
      name: u.name, 
      phone: u.phone,
      email: u.email 
    })));

    // Send announcement via WhatsApp
    const result = await WhatsAppService.broadcastAnnouncement(title, content, targetUsers);

    return NextResponse.json({
      message: 'Announcement sent successfully',
      result: {
        totalSent: result.successful,
        totalFailed: result.failed,
        totalUsers: result.total,
        details: result.results
      }
    });

  } catch (error) {
    console.error('Error sending WhatsApp announcement:', error);
    return NextResponse.json(
      { error: 'Failed to send announcement' },
      { status: 500 }
    );
  }
}
