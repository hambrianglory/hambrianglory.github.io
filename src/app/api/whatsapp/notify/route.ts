import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/localDatabase';
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

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, memberIds, customMessage } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get all members
    const allMembers = await localDB.getAllUsers();
    const members = allMembers.filter(m => m.role === 'member' && m.isActive);

    let targetMembers = members;
    
    // Filter members if specific IDs provided
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      targetMembers = members.filter(m => memberIds.includes(m.id));
    }

    // Filter for overdue payments if action is payment reminder
    if (action === 'payment-reminder') {
      targetMembers = targetMembers.filter(member => {
        return member.status === 'overdue' || member.status === 'pending';
      });
    }

    if (targetMembers.length === 0) {
      return NextResponse.json({ 
        error: 'No eligible members found for WhatsApp notification' 
      }, { status: 400 });
    }

    // Check WhatsApp session status first
    const sessionStatus = await whatsAppService.checkSessionStatus();
    if (!sessionStatus.success) {
      return NextResponse.json({ 
        error: 'WhatsApp session not active. Please scan QR code first.',
        details: sessionStatus.error
      }, { status: 503 });
    }

    const results = [];

    switch (action) {
      case 'payment-reminder':
        // Send payment reminders
        const paymentReminders = targetMembers.map(member => ({
          phone: member.phone,
          name: member.name,
          amount: member.amount || 5000, // Default amount if not set
          dueDate: member.paymentDate || new Date().toLocaleDateString()
        }));

        const reminderResults = await whatsAppService.sendBulkPaymentReminders(paymentReminders);
        results.push(...reminderResults);
        break;

      case 'custom-message':
        if (!customMessage) {
          return NextResponse.json({ error: 'Custom message is required' }, { status: 400 });
        }

        for (const member of targetMembers) {
          const result = await whatsAppService.sendMessage(member.phone, customMessage);
          results.push({
            phone: member.phone,
            name: member.name,
            success: result.success,
            error: result.error
          });

          // Add delay between messages
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        break;

      case 'welcome-message':
        for (const member of targetMembers) {
          const welcomeMessage = `🏠 *Welcome to Hambrian Glory Community!*

Dear ${member.name},

Welcome to our community family! 🎉

Here are your account details:
📧 Email: ${member.email}
📱 Phone: ${member.phone}
🆔 Member ID: ${member.id}

📋 *Important Information:*
• Monthly Fee: Rs. 5,000
• Payment Due: 1st of every month
• Login: Use your email and NIC number

For any queries, please contact the community office.

Thank you for joining us! 🙏

*This is an automated message*`;

          const result = await whatsAppService.sendMessage(member.phone, welcomeMessage);
          results.push({
            phone: member.phone,
            name: member.name,
            success: result.success,
            error: result.error
          });

          // Add delay between messages
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Calculate statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `WhatsApp notifications sent successfully`,
      statistics: {
        total: results.length,
        successful,
        failed
      },
      results
    });

  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check WhatsApp session status
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionStatus = await whatsAppService.checkSessionStatus();
    
    return NextResponse.json({
      success: true,
      session: sessionStatus
    });

  } catch (error) {
    console.error('WhatsApp status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
