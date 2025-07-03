import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// WhatsApp webhook for receiving message status updates and incoming messages
const WEBHOOK_DATA_DIR = join(process.cwd(), 'private', 'whatsapp-webhooks');
const WEBHOOK_LOG_FILE = join(WEBHOOK_DATA_DIR, 'webhook-log.json');
const DELIVERY_STATUS_FILE = join(WEBHOOK_DATA_DIR, 'delivery-status.json');

// Ensure webhook directory exists
if (!existsSync(WEBHOOK_DATA_DIR)) {
  mkdirSync(WEBHOOK_DATA_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  // Webhook verification for WhatsApp Business API
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook (you should set your own verify token)
  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'hambrian_glory_webhook_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    logWebhookActivity('webhook_verified', { mode, token, challenge });
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('❌ WhatsApp webhook verification failed');
    logWebhookActivity('webhook_verification_failed', { mode, token, challenge });
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 WhatsApp webhook received:', JSON.stringify(body, null, 2));
    
    // Log webhook activity
    logWebhookActivity('webhook_received', body);

    // Process incoming WhatsApp webhook data
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value.contacts?.[0]);
              }
            }
            
            // Handle message status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await handleMessageStatus(status);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    logWebhookActivity('webhook_error', { error: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleIncomingMessage(message: any, contact: any) {
  console.log('📥 Incoming WhatsApp message:', {
    from: message.from,
    type: message.type,
    timestamp: message.timestamp,
    text: message.text?.body,
    contact: contact?.profile?.name
  });

  // Log incoming message
  logWebhookActivity('incoming_message', {
    from: message.from,
    type: message.type,
    text: message.text?.body,
    timestamp: message.timestamp,
    contact: contact?.profile?.name
  });

  // Here you could implement auto-responses or ticket creation
  // For example, respond to specific keywords:
  
  if (message.text?.body?.toLowerCase().includes('payment')) {
    // Could send payment information or link
    console.log('💰 Payment inquiry detected - could auto-respond with payment info');
    logWebhookActivity('payment_inquiry', { from: message.from, message: message.text?.body });
  } else if (message.text?.body?.toLowerCase().includes('help')) {
    // Could send help information
    console.log('🆘 Help request detected - could auto-respond with contact info');
    logWebhookActivity('help_request', { from: message.from, message: message.text?.body });
  } else if (message.text?.body?.toLowerCase().includes('emergency')) {
    // Could escalate to emergency contacts
    console.log('🚨 Emergency message detected - could escalate to management');
    logWebhookActivity('emergency_message', { from: message.from, message: message.text?.body });
  } else if (message.text?.body?.toLowerCase().includes('received') || message.text?.body?.toLowerCase().includes('got it')) {
    // User confirmed message receipt
    console.log('✅ User confirmed message receipt');
    logWebhookActivity('message_confirmed', { from: message.from, message: message.text?.body });
  }
}

async function handleMessageStatus(status: any) {
  console.log('📊 Message status update:', {
    messageId: status.id,
    status: status.status,
    timestamp: status.timestamp,
    recipient: status.recipient_id
  });

  // Enhanced status logging with delivery tracking
  const statusData = {
    messageId: status.id,
    status: status.status,
    timestamp: status.timestamp,
    recipient: status.recipient_id,
    errors: status.errors || null,
    processedAt: new Date().toISOString()
  };

  // Log status update
  logWebhookActivity('message_status_update', statusData);
  
  // Save delivery status
  updateDeliveryStatus(statusData);

  // Handle different status types with detailed logging
  switch (status.status) {
    case 'sent':
      console.log('✅ Message sent successfully:', status.id);
      break;
      
    case 'delivered':
      console.log('📱 Message delivered to device:', status.id);
      break;
      
    case 'read':
      console.log('👀 Message read by user:', status.id);
      break;
      
    case 'failed':
      console.log('❌ Message failed to deliver:', status.id);
      if (status.errors && status.errors.length > 0) {
        console.log('   Errors:', status.errors);
      }
      break;
      
    default:
      console.log('ℹ️ Unknown message status:', status.status);
  }
}

// Helper function to log webhook activities
function logWebhookActivity(type: string, data: any) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: type,
      data: data
    };

    let logData = [];
    if (existsSync(WEBHOOK_LOG_FILE)) {
      logData = JSON.parse(readFileSync(WEBHOOK_LOG_FILE, 'utf-8'));
    }

    logData.push(logEntry);

    // Keep only last 1000 entries
    if (logData.length > 1000) {
      logData = logData.slice(-1000);
    }

    writeFileSync(WEBHOOK_LOG_FILE, JSON.stringify(logData, null, 2));
  } catch (error) {
    console.error('❌ Error logging webhook activity:', error);
  }
}

// Helper function to update delivery status
function updateDeliveryStatus(statusData: any) {
  try {
    let deliveryData = [];
    if (existsSync(DELIVERY_STATUS_FILE)) {
      deliveryData = JSON.parse(readFileSync(DELIVERY_STATUS_FILE, 'utf-8'));
    }

    // Update or add delivery status
    const existingIndex = deliveryData.findIndex((d: any) => d.messageId === statusData.messageId);
    
    if (existingIndex >= 0) {
      deliveryData[existingIndex] = { ...deliveryData[existingIndex], ...statusData };
    } else {
      deliveryData.push(statusData);
    }

    // Keep only last 1000 entries
    if (deliveryData.length > 1000) {
      deliveryData = deliveryData.slice(-1000);
    }

    writeFileSync(DELIVERY_STATUS_FILE, JSON.stringify(deliveryData, null, 2));
  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
  }
}
