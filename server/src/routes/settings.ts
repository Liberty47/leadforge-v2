import { Router } from 'express';
import { z } from 'zod';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';
import { sendTelegramNotification, isTelegramConfigured } from '../services/notificationService.js';

const router = Router();

const updateNotificationSettingsSchema = z.object({
  notify_on_delivered: z.boolean().optional(),
  notify_on_opened: z.boolean().optional(),
  notify_on_clicked: z.boolean().optional(),
  notify_on_replied: z.boolean().optional(),
  notify_on_bounced: z.boolean().optional(),
  telegram_enabled: z.boolean().optional(),
  whatsapp_enabled: z.boolean().optional(),
  tiktok_enabled: z.boolean().optional(),
});

// Default settings
const DEFAULT_SETTINGS = {
  notify_on_delivered: true,
  notify_on_opened: true,
  notify_on_clicked: true,
  notify_on_replied: true,
  notify_on_bounced: true,
  telegram_enabled: false,
  whatsapp_enabled: false,
  tiktok_enabled: false,
};

router.get('/', async (_req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse({
      ...DEFAULT_SETTINGS,
      connectionStatus: {
        serper: isSupabaseConfigured,
        openrouter: isSupabaseConfigured,
        resend: isSupabaseConfigured,
        telegram: isTelegramConfigured(),
        whatsapp: false,
      },
    }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return res.json(successResponse({
      ...DEFAULT_SETTINGS,
      connectionStatus: {
        serper: isSupabaseConfigured,
        openrouter: isSupabaseConfigured,
        resend: isSupabaseConfigured,
        telegram: isTelegramConfigured(),
        whatsapp: false,
      },
    }));
  }

  res.json(successResponse({
    ...data,
    connectionStatus: {
      serper: isSupabaseConfigured,
      openrouter: isSupabaseConfigured,
      resend: isSupabaseConfigured,
      telegram: isTelegramConfigured(),
      whatsapp: false,
    },
  }));
});

router.patch('/notifications', async (req, res) => {
  const parsed = updateNotificationSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid settings'));
  }

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ ...DEFAULT_SETTINGS, ...parsed.data }));
  }

  const supabase = await getSupabase();
  const settingsId = await getSettingsId(supabase);
  const { data, error } = await supabase
    .from('notification_settings')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', settingsId || '')
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.post('/test/telegram', async (req, res) => {
  try {
    await sendTelegramNotification({
      type: 'test',
      message: 'Lead Forge Telegram notification test',
    });
    res.json(successResponse({ sent: true }));
  } catch (err) {
    res.status(500).json(errorResponse('TELEGRAM_ERROR', 'Failed to send test notification'));
  }
});

async function getSettingsId(supabase: Awaited<ReturnType<typeof getSupabase>>): Promise<string | null> {
  const { data } = await supabase
    .from('notification_settings')
    .select('id')
    .limit(1)
    .single();
  return data?.id || null;
}

export default router;
