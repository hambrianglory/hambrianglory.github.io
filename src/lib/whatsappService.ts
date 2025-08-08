import axios from 'axios';

export interface WhatsAppConfig {
  baseUrl: string;
  sessionName: string;
  apiKey?: string;
}

export interface WhatsAppMessage {
  chatId: string;
  text: string;
  session?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Format phone number for WhatsApp (Sri Lankan format)
  private formatPhoneNumber(phone: string | number): string {
    // Convert to string if it's a number
    const phoneStr = String(phone || '');
    
    // Remove all non-numeric characters
    let cleanPhone = phoneStr.replace(/\D/g, '');
    
    // Handle Sri Lankan numbers
    if (cleanPhone.startsWith('94')) {
      // Already has country code
      return `${cleanPhone}@c.us`;
    } else if (cleanPhone.startsWith('0')) {
      // Local number starting with 0, replace with 94
      return `94${cleanPhone.substring(1)}@c.us`;
    } else if (cleanPhone.length === 9) {
      // 9 digit number without country code or leading 0
      return `94${cleanPhone}@c.us`;
    } else {
      // Assume it needs 94 prefix
      return `94${cleanPhone}@c.us`;
    }
  }

  // Send a text message
  async sendMessage(phone: string | number, message: string): Promise<SendMessageResponse> {
    try {
      const chatId = this.formatPhoneNumber(phone);
      
      const payload: WhatsAppMessage = {
        chatId,
        text: message,
        session: this.config.sessionName
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await axios.post(
        `${this.config.baseUrl}/api/sendText`,
        payload,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          messageId: response.data.id || response.data.messageId
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error: any) {
      console.error('WhatsApp send message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message'
      };
    }
  }

  // Send payment reminder message
  async sendPaymentReminder(phone: string | number, memberName: string, amount: number, dueDate: string): Promise<SendMessageResponse> {
    const message = `🏠 *Hambrian Glory Community*

Dear ${memberName},

📋 *Payment Reminder*
💰 Outstanding Amount: Rs. ${amount.toLocaleString()}
📅 Due Date: ${dueDate}

Please settle your community fee payment at your earliest convenience.

For any queries, please contact the community office.

Thank you! 🙏

*This is an automated message*`;

    return this.sendMessage(phone, message);
  }

  // Send bulk payment reminders
  async sendBulkPaymentReminders(members: Array<{
    phone: string;
    name: string;
    amount: number;
    dueDate: string;
  }>): Promise<Array<{ phone: string; name: string; success: boolean; error?: string }>> {
    const results = [];
    
    for (const member of members) {
      try {
        const result = await this.sendPaymentReminder(
          member.phone,
          member.name,
          member.amount,
          member.dueDate
        );
        
        results.push({
          phone: member.phone,
          name: member.name,
          success: result.success,
          error: result.error
        });

        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        results.push({
          phone: member.phone,
          name: member.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Check session status
  async checkSessionStatus(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/sessions/${this.config.sessionName}`,
        {
          headers: this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}
        }
      );

      return {
        success: true,
        status: response.data.status || 'unknown'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check session status'
      };
    }
  }

  // Start WhatsApp session
  async startSession(): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/sessions/start`,
        {
          name: this.config.sessionName,
          config: {
            webhooks: []
          }
        },
        {
          headers: this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}
        }
      );

      return {
        success: true,
        qrCode: response.data.qrCode
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to start session'
      };
    }
  }
}

// Default configuration - can be overridden via environment variables
export const defaultWhatsAppConfig: WhatsAppConfig = {
  baseUrl: process.env.WAHA_BASE_URL || 'http://localhost:3001',
  sessionName: process.env.WAHA_SESSION_NAME || 'default',
  apiKey: process.env.WAHA_API_KEY
};

// Create default instance
export const whatsAppService = new WhatsAppService(defaultWhatsAppConfig);
