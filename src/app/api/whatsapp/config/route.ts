import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';

export async function GET() {
  try {
    const templates = WhatsAppService.getTemplates();
    const config = WhatsAppService.getConfig();

    return NextResponse.json({
      templates,
      config: {
        isEnabled: config.isEnabled,
        hasApiKey: !!config.apiKey,
        hasPhoneNumberId: !!config.phoneNumberId,
        hasAccessToken: !!config.accessToken
      }
    });
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isEnabled, apiKey, phoneNumberId, accessToken } = body;

    // Update configuration
    WhatsAppService.updateConfig({
      isEnabled: isEnabled ?? true,
      apiKey: apiKey || undefined,
      phoneNumberId: phoneNumberId || undefined,
      accessToken: accessToken || undefined
    });

    return NextResponse.json({
      message: 'WhatsApp configuration updated successfully',
      config: WhatsAppService.getConfig()
    });
  } catch (error) {
    console.error('Error updating WhatsApp config:', error);
    return NextResponse.json(
      { error: 'Failed to update WhatsApp configuration' },
      { status: 500 }
    );
  }
}
