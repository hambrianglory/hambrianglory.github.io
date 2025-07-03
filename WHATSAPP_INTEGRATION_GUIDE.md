# WhatsApp Integration Guide

## Overview
The Hambrian Glory community fee management system now includes full WhatsApp integration for automated messaging, payment reminders, announcements, and emergency alerts.

## Features

### 🚀 **Core WhatsApp Functionality**
- **Payment Reminders**: Automated quarterly payment reminders
- **Community Announcements**: Broadcast important news to all members
- **Emergency Alerts**: Instant emergency notifications
- **Welcome Messages**: Automated onboarding for new members
- **Message Templates**: Customizable message templates
- **Bulk Messaging**: Send messages to multiple recipients
- **Delivery Tracking**: Monitor message delivery status
- **Webhook Integration**: Receive message status updates

### 📱 **Available Message Types**
1. **Payment Reminders** - Quarterly Sanda Fee reminders
2. **General Announcements** - Community news and updates
3. **Emergency Alerts** - Fire, security, weather, utility outages
4. **Welcome Messages** - New member onboarding
5. **Event Reminders** - Community events and meetings

## Setup Instructions

### 1. WhatsApp Business API Setup

#### Option A: Meta Business (Official)
1. **Create Meta Business Account**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Create or use existing business account
   - Verify your business

2. **Set up WhatsApp Business API**
   - Go to Meta for Developers
   - Create a new app with WhatsApp Business API
   - Add WhatsApp Business API product
   - Get your Phone Number ID and Access Token

3. **Configure Webhook**
   - Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
   - Set verify token: `hambrian_glory_webhook_token_2024`
   - Subscribe to messages and message_status events

#### Option B: Third-Party Providers
Popular WhatsApp Business API providers:
- **Twilio**: Easy setup, good documentation
- **360Dialog**: WhatsApp official partner
- **Vonage**: Reliable service with global reach
- **MessageBird**: Comprehensive communication platform

### 2. Environment Configuration

Create `.env.local` file in your project root:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_API_KEY=your_api_key_here
WHATSAPP_VERIFY_TOKEN=hambrian_glory_webhook_token_2024
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook

# Community Contact Information
NEXT_PUBLIC_COMMUNITY_PHONE=+94112345678
NEXT_PUBLIC_EMERGENCY_PHONE=+94112345679
NEXT_PUBLIC_WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/hambrian-glory-community
```

### 3. Application Configuration

1. **Navigate to Admin Dashboard**
   - Log in as admin
   - Go to WhatsApp tab
   - Click on "Settings"

2. **Configure WhatsApp Settings**
   - Enable WhatsApp integration
   - Enter your API credentials
   - Test connection
   - Save configuration

## API Endpoints

### Send Announcement
```http
POST /api/whatsapp/announcement
Content-Type: application/json

{
  "title": "Community Meeting",
  "content": "Monthly meeting scheduled for Saturday 10 AM",
  "userIds": ["user_1", "user_2"] // Optional, sends to all if omitted
}
```

### Send Payment Reminders
```http
POST /api/whatsapp/payment-reminder
Content-Type: application/json

{
  "userIds": ["user_1", "user_2"] // Optional, sends to all pending if omitted
}
```

### Send Emergency Alert
```http
POST /api/whatsapp/emergency
Content-Type: application/json

{
  "emergencyType": "Fire Emergency",
  "details": "Fire detected in Building A",
  "actionRequired": "Evacuate immediately via stairwell B",
  "userIds": [] // Optional, sends to all if omitted
}
```

### Get Configuration
```http
GET /api/whatsapp/config
```

### Update Configuration
```http
POST /api/whatsapp/config
Content-Type: application/json

{
  "isEnabled": true,
  "apiKey": "your_api_key",
  "phoneNumberId": "your_phone_number_id",
  "accessToken": "your_access_token"
}
```

## Message Templates

### Payment Reminder Template
```
Hello {{name}},

This is a friendly reminder that your {{payment_type}} payment of LKR {{amount}} is due.

Payment Details:
- Amount: LKR {{amount}}
- Due Date: {{due_date}}
- Quarter: {{quarter}}
- Year: {{year}}

Please make the payment at your earliest convenience to avoid any late fees.

For payment assistance, contact: {{contact_number}}

Thank you!
Hambrian Glory Management Team
```

### Emergency Alert Template
```
🚨 EMERGENCY ALERT

{{emergency_type}}

{{details}}

Action Required: {{action_required}}

Contact Emergency Services: 119
Community Emergency Contact: {{emergency_contact}}

Stay safe!
Hambrian Glory Management Team
```

### Welcome Message Template
```
🏠 Welcome to Hambrian Glory Community!

Hello {{name}},

Welcome to our community! We're excited to have you as part of the Hambrian Glory family.

Your house number: {{house_number}}
Community WhatsApp Group: {{group_link}}

Important contacts:
- Management Office: {{office_contact}}
- Emergency: {{emergency_contact}}

We hope you enjoy your stay with us!

Hambrian Glory Management Team
```

## Usage Examples

### Admin Dashboard Integration

1. **Access WhatsApp Features**
   - Admin Dashboard → WhatsApp tab
   - Choose message type (Announcement, Payment Reminder, Emergency)
   - Fill in details and send

2. **Send Payment Reminders**
   - Navigate to WhatsApp tab
   - Select "Payment Reminder"
   - Click "Send Payment Reminders" (sends to all pending)

3. **Broadcast Announcements**
   - Navigate to WhatsApp tab
   - Select "Announcement"
   - Enter title and content
   - Choose recipients (all or specific users)
   - Send announcement

4. **Emergency Alerts**
   - Navigate to WhatsApp tab
   - Select "Emergency Alert"
   - Choose emergency type
   - Enter details and required action
   - Send immediate alert to all residents

### Programmatic Usage

```javascript
import { WhatsAppService } from '@/lib/whatsapp';

// Send payment reminder to specific user
const user = { id: 'user_1', name: 'John Doe', phone: '+94712345678' };
const payment = { amount: 500, paymentDate: new Date(), quarter: 'Q1', year: 2024 };
const message = WhatsAppService.generatePaymentReminderMessage(user, payment);
await WhatsAppService.sendNotification({ userId: user.id, message, type: 'payment_reminder', status: 'pending', recipientPhone: user.phone }, user);

// Broadcast announcement
await WhatsAppService.broadcastAnnouncement('Community Meeting', 'Meeting this Saturday at 10 AM', users);

// Send emergency alert
await WhatsAppService.sendEmergencyAlert('Fire Emergency', 'Fire in Building A', 'Evacuate immediately', users);
```

## Testing

### Test WhatsApp Integration

1. **Test in Demo Mode**
   - WhatsApp service works in demo mode without API credentials
   - Messages are logged to console instead of being sent
   - Perfect for development and testing

2. **Test with Real API**
   - Configure environment variables
   - Start with a small test group
   - Send test messages to verify delivery
   - Check webhook for delivery confirmations

3. **Test Different Message Types**
   - Payment reminders
   - Announcements
   - Emergency alerts
   - Welcome messages

## Phone Number Format

The system automatically formats phone numbers for Sri Lankan numbers:
- Input: `0712345678` → Output: `+94712345678`
- Input: `94712345678` → Output: `+94712345678`
- Input: `+94712345678` → Output: `+94712345678`

## Security Considerations

1. **API Key Security**
   - Store API keys in environment variables
   - Never commit API keys to version control
   - Rotate API keys regularly

2. **Webhook Security**
   - Use webhook verification token
   - Validate incoming webhook requests
   - Implement rate limiting

3. **Phone Number Privacy**
   - Hash or encrypt phone numbers in logs
   - Implement consent management
   - Follow GDPR/privacy regulations

## Monitoring and Analytics

### Message Delivery Tracking
- Monitor delivery rates
- Track read receipts
- Handle failed deliveries
- Retry mechanisms for failed messages

### Usage Analytics
- Message volume tracking
- Popular message types
- Response rates
- User engagement metrics

## Troubleshooting

### Common Issues

1. **Messages Not Sending**
   - Check API credentials
   - Verify phone number format
   - Check WhatsApp Business API limits
   - Review webhook configuration

2. **Webhook Not Working**
   - Verify webhook URL is accessible
   - Check verify token matches
   - Ensure HTTPS is enabled
   - Review webhook logs

3. **Phone Number Issues**
   - Ensure numbers are in international format
   - Check if numbers are WhatsApp verified
   - Validate number with WhatsApp API

### Debug Mode

Enable debug logging by setting:
```env
WHATSAPP_DEBUG=true
```

This will log all WhatsApp API requests and responses.

## Cost Considerations

### WhatsApp Business API Pricing
- **Session Messages**: Messages in response to user messages (free for 24 hours)
- **Template Messages**: Proactive messages (charged per message)
- **Authentication Messages**: OTP and verification (lower cost)

### Cost Optimization Tips
1. Use session messages when possible
2. Batch announcements efficiently
3. Monitor usage to avoid unexpected charges
4. Use appropriate message templates

## Best Practices

### Message Content
1. Keep messages concise and clear
2. Include call-to-action when needed
3. Use emojis sparingly for better readability
4. Maintain consistent tone and branding

### Timing
1. Send messages during appropriate hours
2. Avoid sending during holidays/weekends unless urgent
3. Space out bulk messages to avoid overwhelming users

### Compliance
1. Obtain explicit consent for marketing messages
2. Provide easy opt-out mechanisms
3. Follow local telecommunications regulations
4. Respect user preferences and privacy

## Future Enhancements

### Planned Features
1. **Two-way Communication**: Handle incoming messages and responses
2. **Message Scheduling**: Schedule announcements and reminders
3. **Rich Media**: Send images, documents, and location
4. **Chatbot Integration**: Automated responses for common queries
5. **Analytics Dashboard**: Detailed messaging analytics
6. **Template Management**: Dynamic template creation and editing

### Integration Opportunities
1. **Payment Gateway**: Direct payment links in messages
2. **Calendar Integration**: Automated event reminders
3. **Maintenance Requests**: WhatsApp-based service requests
4. **Voting System**: Community voting via WhatsApp

---

## Support

For technical support with WhatsApp integration:
- Check the [WhatsApp Business API documentation](https://developers.facebook.com/docs/whatsapp)
- Review application logs for error details
- Contact the development team for assistance

**Note**: This integration follows WhatsApp Business API best practices and complies with their terms of service. Always test thoroughly before deploying to production.
