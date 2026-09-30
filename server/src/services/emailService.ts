interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

interface SendEmailResult {
  messageId: string;
}

// Mock email sending for demo mode
async function mockSendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  console.log('Mock email send:', params);
  return { messageId: `mock-${Date.now()}` };
}

// Real Resend email sending
async function resendSendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, using mock');
    return mockSendEmail(params);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lead Forge <onboarding@resend.dev>',
      to: params.to,
      subject: params.subject,
      html: params.body.replace(/\n/g, '<br>'),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  const data = await response.json();
  return { messageId: data.id };
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return mockSendEmail(params);
  }

  try {
    return await resendSendEmail(params);
  } catch (err) {
    console.error('Email send failed, using mock:', err);
    return mockSendEmail(params);
  }
}

// Webhook handling
interface ResendWebhookData {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
}

export async function handleResendWebhook(type: string, data: ResendWebhookData): Promise<void> {
  const { supabase } = await import('../lib/supabase.js');
  const { isSupabaseConfigured } = await import('../lib/supabase.js');

  console.log('Resend webhook:', type, data);

  if (!isSupabaseConfigured) {
    return;
  }

  // Find email by provider_message_id
  const { data: email } = await supabase
    .from('email_drafts')
    .select('id, lead_id, campaign_id, status')
    .eq('provider_message_id', data.id)
    .single();

  if (!email) {
    console.warn('Email not found for webhook:', data.id);
    return;
  }

  const occurredAt = data.created_at;
  let eventType: string;
  let updateData: Record<string, unknown> = {};

  switch (type) {
    case 'email.delivered':
      eventType = 'delivered';
      updateData = { delivered_at: occurredAt };
      break;
    case 'email.opened':
      eventType = 'opened';
      updateData = { opened_at: occurredAt };
      break;
    case 'email.clicked':
      eventType = 'clicked';
      updateData = { clicked_at: occurredAt };
      break;
    case 'email.bounced':
      eventType = 'bounced';
      updateData = { status: 'bounced' };
      break;
    case 'email.replied':
      eventType = 'replied';
      updateData = { replied_at: occurredAt };
      break;
    default:
      console.log('Unhandled webhook type:', type);
      return;
  }

  // Update email status if needed
  if (Object.keys(updateData).length > 0) {
    const currentEmail = await supabase
      .from('email_drafts')
      .select('status')
      .eq('id', email.id)
      .single();

    // Only update status if it's a status change (not timestamp update)
    if (updateData.status) {
      await supabase
        .from('email_drafts')
        .update(updateData)
        .eq('id', email.id);
    } else if (currentEmail.data?.status === 'sent') {
      // Upgrade status from sent to delivered/opened/clicked
      const statusMap: Record<string, string> = {
        delivered: 'delivered',
        opened: 'open_detected',
        clicked: 'clicked',
      };
      if (statusMap[eventType]) {
        await supabase
          .from('email_drafts')
          .update({ ...updateData, status: statusMap[eventType] })
          .eq('id', email.id);
      }
    }
  }

  // Create event record
  await supabase.from('email_events').insert({
    email_draft_id: email.id,
    lead_id: email.lead_id,
    campaign_id: email.campaign_id,
    event_type: eventType,
    provider_event_id: data.id,
    occurred_at: occurredAt,
  });
}

// Check if Resend is configured
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
