import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { DataService } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds } = body;

    // Get real users and payments from database
    const allUsers = DataService.getUsers();
    const allPayments = DataService.getPayments();
    
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

    // Create notifications for each user
    const notifications = targetUsers.map(user => {
      // Find pending payments for this user
      const userPayments = allPayments.filter(p => 
        p.userId === user.id && p.status === 'pending'
      );
      
      // If no pending payments, create a general reminder
      const payment = userPayments.length > 0 ? userPayments[0] : {
        id: 'general_reminder',
        userId: user.id,
        amount: 500,
        paymentDate: new Date(),
        status: 'pending' as const,
        paymentType: 'quarterly_sanda_fee' as const,
        description: 'Annual Sanda Fee',
        quarter: 'Q1' as const,
        year: new Date().getFullYear(),
        receiptNumber: '',
        paidDate: null,
        notes: ''
      };

      const message = WhatsAppService.generatePaymentReminderMessage(user, payment);
      
      return {
        userId: user.id,
        message,
        type: 'payment_reminder' as const,
        status: 'pending' as const,
        recipientPhone: user.phone
      };
    });

    // Log phone numbers for debugging
    console.log('💰 Sending payment reminders to users:', targetUsers.map(u => ({ 
      name: u.name, 
      phone: u.phone,
      email: u.email 
    })));

    // Send notifications
    const result = await WhatsAppService.sendBulkNotifications(notifications, targetUsers);

    return NextResponse.json({
      message: 'Payment reminders sent successfully',
      result: {
        totalSent: result.successful,
        totalFailed: result.failed,
        totalUsers: result.total,
        details: result.results
      }
    });

  } catch (error) {
    console.error('Error sending payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send payment reminders' },
      { status: 500 }
    );
  }
}
