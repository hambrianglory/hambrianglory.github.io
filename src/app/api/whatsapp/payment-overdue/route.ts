import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { DataService } from '@/lib/data';
import { Payment, User, WhatsAppNotification } from '@/types';

// Interface for unpaid member details
interface UnpaidMemberDetails {
  user: User;
  unpaidPayments: {
    payment: Payment;
    monthsOverdue: number;
    quarterName: string;
    amountDue: number;
  }[];
  totalAmountDue: number;
  totalPaymentsDue: number;
}

// Interface for request body
interface PaymentReminderRequest {
  targetQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  targetYear?: number;
  includeAllOverdue?: boolean;
  userIds?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentReminderRequest = await request.json();
    const { 
      targetQuarter, 
      targetYear = new Date().getFullYear(),
      includeAllOverdue = true,
      userIds 
    } = body;

    // Get all users and payments
    const allUsers = DataService.getUsers();
    const allPayments = DataService.getPayments();

    // Filter users if specific userIds provided
    const targetUsers = userIds && userIds.length > 0 
      ? allUsers.filter(user => userIds.includes(user.id))
      : allUsers.filter(user => user.isActive);

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No active users found' },
        { status: 400 }
      );
    }

    // Find unpaid members with detailed payment information
    const unpaidMembers: UnpaidMemberDetails[] = [];

    for (const user of targetUsers) {
      const userPayments = DataService.getPaymentsByUserId(user.id);
      const unpaidPayments: UnpaidMemberDetails['unpaidPayments'] = [];

      // Check for pending/overdue payments
      const pendingPayments = userPayments.filter(payment => 
        payment.status === 'pending' || payment.status === 'overdue'
      );

      // If includeAllOverdue is true, check all overdue payments
      // If targetQuarter is specified, check specific quarter
      for (const payment of pendingPayments) {
        let shouldInclude = false;

        if (targetQuarter && payment.quarter === targetQuarter && payment.year === targetYear) {
          shouldInclude = true;
        } else if (includeAllOverdue) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          // Calculate months overdue
          const paymentDueDate = new Date(payment.paymentDate);
          const currentDate = new Date();
          const monthsOverdue = Math.floor((currentDate.getTime() - paymentDueDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

          // Format quarter name
          const quarterName = `${payment.quarter || 'N/A'} ${payment.year || targetYear}`;

          unpaidPayments.push({
            payment,
            monthsOverdue: Math.max(0, monthsOverdue),
            quarterName,
            amountDue: payment.amount
          });
        }
      }

      // If user has unpaid payments, add to list
      if (unpaidPayments.length > 0) {
        const totalAmountDue = unpaidPayments.reduce((sum, up) => sum + up.amountDue, 0);
        
        unpaidMembers.push({
          user,
          unpaidPayments,
          totalAmountDue,
          totalPaymentsDue: unpaidPayments.length
        });
      }
    }

    if (unpaidMembers.length === 0) {
      return NextResponse.json({
        message: 'No unpaid members found',
        unpaidCount: 0,
        totalAmountDue: 0
      });
    }

    // Send detailed WhatsApp reminders
    const messagingResults = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const memberDetails of unpaidMembers) {
      try {
        // Create detailed payment reminder message
        const detailedMessage = createDetailedPaymentMessage(memberDetails);
        
        // Send via WhatsApp
        const notification: WhatsAppNotification = {
          userId: memberDetails.user.id,
          message: detailedMessage,
          type: 'payment_reminder',
          recipientPhone: memberDetails.user.phone,
          status: 'pending'
        };

        const result = await WhatsAppService.sendNotification(notification, memberDetails.user);

        messagingResults.push({
          userId: memberDetails.user.id,
          userName: memberDetails.user.name,
          phone: memberDetails.user.phone,
          totalAmountDue: memberDetails.totalAmountDue,
          paymentsCount: memberDetails.totalPaymentsDue,
          status: result ? 'sent' : 'failed',
          messageId: result ? 'sent_' + Date.now() : undefined,
          error: result ? undefined : 'Failed to send message'
        });

        if (result) {
          totalSent++;
        } else {
          totalFailed++;
        }

      } catch (error) {
        console.error(`Error sending reminder to ${memberDetails.user.name}:`, error);
        messagingResults.push({
          userId: memberDetails.user.id,
          userName: memberDetails.user.name,
          phone: memberDetails.user.phone,
          totalAmountDue: memberDetails.totalAmountDue,
          paymentsCount: memberDetails.totalPaymentsDue,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        totalFailed++;
      }
    }

    // Calculate summary statistics
    const totalAmountDue = unpaidMembers.reduce((sum, member) => sum + member.totalAmountDue, 0);
    const totalPaymentsDue = unpaidMembers.reduce((sum, member) => sum + member.totalPaymentsDue, 0);

    return NextResponse.json({
      message: `Payment reminders sent to ${totalSent} members successfully`,
      summary: {
        totalUnpaidMembers: unpaidMembers.length,
        totalAmountDue,
        totalPaymentsDue,
        totalSent,
        totalFailed,
        targetQuarter,
        targetYear,
        includeAllOverdue
      },
      unpaidMembers: unpaidMembers.map(member => ({
        userId: member.user.id,
        userName: member.user.name,
        houseNumber: member.user.houseNumber,
        phone: member.user.phone,
        totalAmountDue: member.totalAmountDue,
        totalPaymentsDue: member.totalPaymentsDue,
        unpaidDetails: member.unpaidPayments.map(up => ({
          quarter: up.quarterName,
          amount: up.amountDue,
          monthsOverdue: up.monthsOverdue,
          description: up.payment.description,
          dueDate: up.payment.paymentDate
        }))
      })),
      messagingResults
    });

  } catch (error) {
    console.error('Error processing payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process payment reminders' },
      { status: 500 }
    );
  }
}

// Helper function to create detailed payment message
function createDetailedPaymentMessage(memberDetails: UnpaidMemberDetails): string {
  const { user, unpaidPayments, totalAmountDue } = memberDetails;
  
  let message = `🏠 *Hambrian Glory Community*\n`;
  message += `📋 *Payment Reminder*\n\n`;
  message += `Dear ${user.name},\n\n`;
  message += `We hope this message finds you well. This is a friendly reminder regarding your outstanding community fees:\n\n`;
  
  message += `🏡 *House Number:* ${user.houseNumber}\n`;
  message += `📞 *Contact:* ${user.phone}\n\n`;
  
  message += `*📊 Outstanding Payments Summary:*\n`;
  message += `💰 *Total Amount Due:* LKR ${totalAmountDue.toLocaleString()}\n`;
  message += `📅 *Number of Payments:* ${unpaidPayments.length}\n\n`;
  
  message += `*📋 Detailed Breakdown:*\n`;
  unpaidPayments.forEach((up, index) => {
    message += `${index + 1}. *${up.quarterName}*\n`;
    message += `   💵 Amount: LKR ${up.amountDue.toLocaleString()}\n`;
    message += `   📅 Due Date: ${new Date(up.payment.paymentDate).toLocaleDateString()}\n`;
    message += `   ⏰ Overdue: ${up.monthsOverdue} month(s)\n`;
    message += `   📝 Description: ${up.payment.description}\n\n`;
  });
  
  message += `*💳 Payment Instructions:*\n`;
  message += `• Bank Transfer: [Bank Details Here]\n`;
  message += `• Cash Payment: Contact Committee\n`;
  message += `• Online Payment: [Payment Portal]\n\n`;
  
  message += `*📞 Contact Information:*\n`;
  message += `• Committee Chair: [Name] - [Phone]\n`;
  message += `• Treasurer: [Name] - [Phone]\n\n`;
  
  message += `Please arrange payment at your earliest convenience. If you have any questions or need to discuss a payment plan, please don't hesitate to contact us.\n\n`;
  message += `Thank you for your cooperation!\n\n`;
  message += `*Hambrian Glory Management Committee*`;
  
  return message;
}

// Helper function to get next due date
function getNextDueDate(unpaidPayments: UnpaidMemberDetails['unpaidPayments']): string {
  if (unpaidPayments.length === 0) return new Date().toISOString().split('T')[0];
  
  // Find the earliest due date
  const earliestPayment = unpaidPayments.reduce((earliest, current) => {
    return new Date(current.payment.paymentDate) < new Date(earliest.payment.paymentDate) 
      ? current : earliest;
  });
  
  return new Date(earliestPayment.payment.paymentDate).toISOString().split('T')[0];
}

// GET endpoint to check unpaid members without sending messages
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const targetQuarter = url.searchParams.get('quarter') as 'Q1' | 'Q2' | 'Q3' | 'Q4' | null;
    const targetYear = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const includeAllOverdue = url.searchParams.get('includeAllOverdue') !== 'false';

    const allUsers = DataService.getUsers().filter(user => user.isActive);
    const unpaidMembers: UnpaidMemberDetails[] = [];

    for (const user of allUsers) {
      const userPayments = DataService.getPaymentsByUserId(user.id);
      const unpaidPayments: UnpaidMemberDetails['unpaidPayments'] = [];

      const pendingPayments = userPayments.filter(payment => 
        payment.status === 'pending' || payment.status === 'overdue'
      );

      for (const payment of pendingPayments) {
        let shouldInclude = false;

        if (targetQuarter && payment.quarter === targetQuarter && payment.year === targetYear) {
          shouldInclude = true;
        } else if (includeAllOverdue) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          const paymentDueDate = new Date(payment.paymentDate);
          const currentDate = new Date();
          const monthsOverdue = Math.floor((currentDate.getTime() - paymentDueDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const quarterName = `${payment.quarter || 'N/A'} ${payment.year || targetYear}`;

          unpaidPayments.push({
            payment,
            monthsOverdue: Math.max(0, monthsOverdue),
            quarterName,
            amountDue: payment.amount
          });
        }
      }

      if (unpaidPayments.length > 0) {
        const totalAmountDue = unpaidPayments.reduce((sum, up) => sum + up.amountDue, 0);
        
        unpaidMembers.push({
          user,
          unpaidPayments,
          totalAmountDue,
          totalPaymentsDue: unpaidPayments.length
        });
      }
    }

    const totalAmountDue = unpaidMembers.reduce((sum, member) => sum + member.totalAmountDue, 0);
    const totalPaymentsDue = unpaidMembers.reduce((sum, member) => sum + member.totalPaymentsDue, 0);

    return NextResponse.json({
      summary: {
        totalUnpaidMembers: unpaidMembers.length,
        totalAmountDue,
        totalPaymentsDue,
        targetQuarter,
        targetYear,
        includeAllOverdue
      },
      unpaidMembers: unpaidMembers.map(member => ({
        userId: member.user.id,
        userName: member.user.name,
        houseNumber: member.user.houseNumber,
        phone: member.user.phone,
        email: member.user.email,
        totalAmountDue: member.totalAmountDue,
        totalPaymentsDue: member.totalPaymentsDue,
        unpaidDetails: member.unpaidPayments.map(up => ({
          quarter: up.quarterName,
          amount: up.amountDue,
          monthsOverdue: up.monthsOverdue,
          description: up.payment.description,
          dueDate: up.payment.paymentDate,
          status: up.payment.status
        }))
      }))
    });

  } catch (error) {
    console.error('Error fetching unpaid members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unpaid members' },
      { status: 500 }
    );
  }
}
