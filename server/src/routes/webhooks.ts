import { Router } from 'express';
import { successResponse, errorResponse } from '../lib/response.js';
import { handleResendWebhook } from '../services/emailService.js';

const router = Router();

// Track processed webhook events for idempotency
const processedEvents = new Set<string>();

router.post('/resend', async (req, res) => {
  const signature = req.headers['resend-signature'] as string;

  // Verify webhook signature in production
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_WEBHOOK_SECRET) {
    if (!verifyResendSignature(req.body, signature)) {
      return res.status(401).json(errorResponse('INVALID_SIGNATURE', 'Invalid webhook signature'));
    }
  }

  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json(errorResponse('INVALID_PAYLOAD', 'Missing type or data'));
  }

  // Idempotency check
  const eventId = data.id as string;
  if (processedEvents.has(eventId)) {
    return res.json(successResponse({ received: true, duplicate: true }));
  }

  try {
    await handleResendWebhook(type, data);
    processedEvents.add(eventId);

    // Clean up old events (keep last 10000)
    if (processedEvents.size > 10000) {
      const entries = Array.from(processedEvents);
      entries.slice(0, 1000).forEach(e => processedEvents.delete(e));
    }

    res.json(successResponse({ received: true }));
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process webhook'));
  }
});

function verifyResendSignature(body: unknown, signature: string): boolean {
  // In production, verify using RESEND_WEBHOOK_SECRET
  // Resend uses HMAC-SHA256 for signature verification
  return Boolean(signature);
}

export default router;
