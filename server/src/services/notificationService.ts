interface NotificationParams {
  type: 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'test';
  businessName?: string;
  campaignName?: string;
  timestamp?: string;
  message?: string;
}

// Check if Telegram is configured
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

// Mock Telegram notification
async function mockTelegramNotification(params: NotificationParams): Promise<void> {
  console.log('Mock Telegram notification:', params);
}

// Real Telegram notification
async function telegramNotify(params: NotificationParams): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram not configured');
    return;
  }

  let message: string;

  if (params.type === 'test') {
    message = params.message || 'Test notification from Lead Forge';
  } else {
    const typeLabels: Record<string, string> = {
      delivered: 'Email delivered',
      opened: 'Email opened',
      clicked: 'Link clicked',
      replied: 'Reply received',
      bounced: 'Email bounced',
    };

    message = `Lead Forge\n\n${typeLabels[params.type] || params.type}`;
    if (params.businessName) message += `\n\nBusiness: ${params.businessName}`;
    if (params.campaignName) message += `\nCampaign: ${params.campaignName}`;
    if (params.timestamp) message += `\n\nTime: ${params.timestamp}`;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
}

export async function sendTelegramNotification(params: NotificationParams): Promise<void> {
  if (!isTelegramConfigured()) {
    await mockTelegramNotification(params);
    return;
  }

  try {
    await telegramNotify(params);
  } catch (err) {
    console.error('Telegram notification failed:', err);
    // Fall back to mock silently
    await mockTelegramNotification(params);
  }
}

// WhatsApp notification (placeholder for future implementation)
export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppNotification(params: NotificationParams): Promise<void> {
  if (!isWhatsAppConfigured()) {
    console.log('WhatsApp not configured, skipping notification');
    return;
  }

  console.log('WhatsApp notification (not implemented):', params);
}

// TikTok notification (placeholder)
export function isTikTokConfigured(): boolean {
  return false;
}

export async function sendTikTokNotification(params: NotificationParams): Promise<void> {
  console.log('TikTok notification (not available):', params);
}
