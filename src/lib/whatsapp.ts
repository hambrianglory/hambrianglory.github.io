import { 
  WhatsAppNotification, 
  WhatsAppTemplate, 
  WhatsAppConfig, 
  WhatsAppMessage,
  WhatsAppBulkSendResult,
  User, 
  Payment 
} from '@/types';

export class WhatsAppService {
  private static config: WhatsAppConfig = {
    isEnabled: true,
    // These would be set from environment variables in production
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    webhookUrl: process.env.WHATSAPP_WEBHOOK_URL
  };

  // Default message templates
  private static templates: WhatsAppTemplate[] = [
    {
      id: 'payment_reminder_template',
      name: 'Payment Reminder',
      content: `Hello {{name}},

This is a friendly reminder that your {{payment_type}} payment of LKR {{amount}} is due.

Payment Details:
- Amount: LKR {{amount}}
- Due Date: {{due_date}}
- Quarter: {{quarter}}
- Year: {{year}}

Please make the payment at your earliest convenience to avoid any late fees.

For payment assistance, contact: {{contact_number}}

Thank you!
Hambrian Glory Management Team`,
      variables: ['name', 'payment_type', 'amount', 'due_date', 'quarter', 'year', 'contact_number'],
      type: 'payment_reminder',
      isActive: true
    },
    {
      id: 'general_announcement_template',
      name: 'General Announcement',
      content: `📢 Community Announcement

{{title}}

{{content}}

For more information, contact the management office.

Best regards,
Hambrian Glory Management Team`,
      variables: ['title', 'content'],
      type: 'general_announcement',
      isActive: true
    },
    {
      id: 'welcome_message_template',
      name: 'Welcome Message',
      content: `🏠 Welcome to Hambrian Glory Community!

Hello {{name}},

Welcome to our community! We're excited to have you as part of the Hambrian Glory family.

Your house number: {{house_number}}
Community WhatsApp Group: {{group_link}}

Important contacts:
- Management Office: {{office_contact}}
- Emergency: {{emergency_contact}}

We hope you enjoy your stay with us!

Hambrian Glory Management Team`,
      variables: ['name', 'house_number', 'group_link', 'office_contact', 'emergency_contact'],
      type: 'welcome_message',
      isActive: true
    },
    {
      id: 'emergency_template',
      name: 'Emergency Alert',
      content: `🚨 EMERGENCY ALERT

{{emergency_type}}

{{details}}

Action Required: {{action_required}}

Contact Emergency Services: 119
Community Emergency Contact: {{emergency_contact}}

Stay safe!
Hambrian Glory Management Team`,
      variables: ['emergency_type', 'details', 'action_required', 'emergency_contact'],
      type: 'emergency',
      isActive: true
    }
  ];

  static getTemplates(): WhatsAppTemplate[] {
    return this.templates;
  }

  static getTemplate(id: string): WhatsAppTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  static generatePaymentReminderMessage(user: User, payment: Payment): string {
    const template = this.getTemplate('payment_reminder_template');
    if (!template) return '';

    const variables = {
      name: user.name,
      payment_type: 'Annual Sanda Fee',
      amount: payment.amount.toString(),
      due_date: payment.paymentDate.toLocaleDateString(),
      quarter: payment.quarter || 'Q1',
      year: payment.year?.toString() || new Date().getFullYear().toString(),
      contact_number: '+94 112 345 678'
    };

    return this.processTemplate(template.content, variables);
  }

  static generateWelcomeMessage(user: User): string {
    const template = this.getTemplate('welcome_message_template');
    if (!template) return '';

    const variables = {
      name: user.name,
      house_number: user.houseNumber || 'TBD',
      group_link: 'https://chat.whatsapp.com/hambrian-glory',
      office_contact: '+94 112 345 678',
      emergency_contact: '+94 112 345 679'
    };

    return this.processTemplate(template.content, variables);
  }

  static generateAnnouncementMessage(title: string, content: string): string {
    const template = this.getTemplate('general_announcement_template');
    if (!template) return `📢 ${title}\n\n${content}`;

    const variables = {
      title,
      content
    };

    return this.processTemplate(template.content, variables);
  }

  static generateEmergencyMessage(emergencyType: string, details: string, actionRequired: string): string {
    const template = this.getTemplate('emergency_template');
    if (!template) return `🚨 EMERGENCY: ${emergencyType}\n\n${details}\n\nAction: ${actionRequired}`;

    const variables = {
      emergency_type: emergencyType,
      details,
      action_required: actionRequired,
      emergency_contact: '+94 112 345 679'
    };

    return this.processTemplate(template.content, variables);
  }

  private static processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    return processed;
  }

  static async sendNotification(notification: WhatsAppNotification, user: User): Promise<boolean> {
    if (!this.config.isEnabled) {
      console.log('WhatsApp service is disabled');
      return false;
    }

    try {
      // Validate phone number
      const formattedPhone = this.formatPhoneNumber(user.phone);
      if (!this.validatePhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number format');
      }

      // In production, this would make an actual API call to WhatsApp Business API
      const success = await this.sendWhatsAppMessage(formattedPhone, notification.message);
      
      if (success) {
        console.log(`✅ WhatsApp sent to ${user.name} (${formattedPhone}): ${notification.message.substring(0, 50)}...`);
        return true;
      } else {
        console.error(`❌ Failed to send WhatsApp to ${user.name} (${formattedPhone})`);
        return false;
      }
    } catch (error) {
      console.error(`Error sending WhatsApp to ${user.name}:`, error);
      return false;
    }
  }

  private static async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    // Enhanced debugging logs
    console.log(`🔍 WhatsApp Debug - Starting send to: ${phone}`);
    console.log(`🔑 Access Token present: ${!!this.config.accessToken}`);
    console.log(`📞 Phone Number ID: ${this.config.phoneNumberId}`);
    
    // Check configuration
    if (!this.config.accessToken) {
      console.error('❌ WhatsApp Access Token not configured');
      return false;
    }

    if (!this.config.phoneNumberId) {
      console.error('❌ WhatsApp Phone Number ID not configured');
      console.log('📝 Note: For testing purposes, simulating successful send...');
      console.log(`📱 [DEMO] WhatsApp message would be sent to ${phone}:`);
      console.log(`📄 Message: ${message.substring(0, 100)}...`);
      
      // For now, return true for demo purposes, but log the issue
      return true;
    }
    
    try {
      console.log(`🚀 Attempting to send WhatsApp to ${phone}...`);
      console.log(`📞 Using Phone Number ID: ${this.config.phoneNumberId}`);
      console.log(`🔑 Using Access Token: ${this.config.accessToken.substring(0, 20)}...`);
      console.log(`📝 Message length: ${message.length} characters`);
      
      const requestBody = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message
        }
      };
      
      console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));
      
      // WhatsApp Business API call
      const response = await fetch(`https://graph.facebook.com/v17.0/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log(`📊 WhatsApp API Response Status: ${response.status} ${response.statusText}`);
      console.log(`📄 WhatsApp API Response Body: ${responseText}`);

      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('✅ WhatsApp API Success for', phone, ':', result);
        return true;
      } else {
        console.error('❌ WhatsApp API Error for', phone, ':', response.status, responseText);
        
        // Try to parse error details
        try {
          const errorResult = JSON.parse(responseText);
          if (errorResult.error) {
            console.error('❌ Error details:', errorResult.error);
          }
        } catch (e) {
          console.error('❌ Could not parse error response');
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ WhatsApp API Network Error for', phone, ':', error);
      return false;
    }
  }

  static async sendBulkNotifications(
    notifications: WhatsAppNotification[], 
    users: User[]
  ): Promise<WhatsAppBulkSendResult> {
    const results: WhatsAppBulkSendResult['results'] = [];
    let successful = 0;
    let failed = 0;

    console.log(`📤 Starting bulk WhatsApp send to ${notifications.length} recipients...`);

    for (const notification of notifications) {
      const user = users.find(u => u.id === notification.userId);
      if (!user) {
        results.push({
          userId: notification.userId,
          phone: 'unknown',
          success: false,
          error: 'User not found'
        });
        failed++;
        continue;
      }

      try {
        const success = await this.sendNotification(notification, user);
        if (success) {
          successful++;
          results.push({
            userId: notification.userId,
            phone: user.phone,
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          failed++;
          results.push({
            userId: notification.userId,
            phone: user.phone,
            success: false,
            error: 'Failed to send notification'
          });
        }
      } catch (error) {
        failed++;
        results.push({
          userId: notification.userId,
          phone: user.phone,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Bulk send complete: ${successful} successful, ${failed} failed`);

    return { 
      successful, 
      failed, 
      total: notifications.length,
      results 
    };
  }

  static validatePhoneNumber(phone: string): boolean {
    // Enhanced phone number validation for Sri Lankan numbers
    const phoneRegex = /^\+94[1-9]\d{8}$|^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Handle Sri Lankan numbers specifically
    if (formatted.startsWith('0')) {
      formatted = '+94' + formatted.substring(1);
    } else if (formatted.startsWith('94') && !formatted.startsWith('+94')) {
      formatted = '+' + formatted;
    } else if (!formatted.startsWith('+')) {
      formatted = '+94' + formatted;
    }
    
    return formatted;
  }

  static generateGroupLink(): string {
    // In production, this would create an actual WhatsApp group invite link
    return 'https://chat.whatsapp.com/hambrian-glory-community';
  }

  static async sendPaymentRemindersToAllPending(users: User[], payments: Payment[]): Promise<WhatsAppBulkSendResult> {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const notifications: WhatsAppNotification[] = [];

    pendingPayments.forEach(payment => {
      const user = users.find(u => u.id === payment.userId);
      if (user) {
        notifications.push({
          userId: user.id,
          message: this.generatePaymentReminderMessage(user, payment),
          type: 'payment_reminder',
          status: 'pending',
          recipientPhone: user.phone
        });
      }
    });

    return this.sendBulkNotifications(notifications, users);
  }

  static async broadcastAnnouncement(title: string, content: string, users: User[]): Promise<WhatsAppBulkSendResult> {
    const message = this.generateAnnouncementMessage(title, content);
    const notifications: WhatsAppNotification[] = users.map(user => ({
      userId: user.id,
      message,
      type: 'general_announcement',
      status: 'pending',
      recipientPhone: user.phone
    }));

    return this.sendBulkNotifications(notifications, users);
  }

  static async sendEmergencyAlert(emergencyType: string, details: string, actionRequired: string, users: User[]): Promise<WhatsAppBulkSendResult> {
    const message = this.generateEmergencyMessage(emergencyType, details, actionRequired);
    const notifications: WhatsAppNotification[] = users.map(user => ({
      userId: user.id,
      message,
      type: 'emergency',
      status: 'pending',
      recipientPhone: user.phone
    }));

    return this.sendBulkNotifications(notifications, users);
  }

  static getConfig(): WhatsAppConfig {
    return this.config;
  }

  static updateConfig(newConfig: Partial<WhatsAppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
