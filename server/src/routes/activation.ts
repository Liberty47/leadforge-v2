import { Router } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { createActivationSession, isDemoMode } from '../middleware/activation.js';
import { successResponse, errorResponse } from '../lib/response.js';

const router = Router();

const verifySchema = z.object({
  key: z.string().min(1),
});

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Demo activation for development
function demoActivation(key: string): { valid: boolean; error?: string } {
  if (key === 'DEMO-LEADFORGE-2026' || key.length > 5) {
    return { valid: true };
  }
  return { valid: false, error: 'Invalid activation key' };
}

router.post('/verify', async (req, res) => {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorResponse('INVALID_REQUEST', 'Key is required'));
    }

    const { key } = parsed.data;

    // Demo mode check - fallback if Supabase not configured
    if (isDemoMode() || !isSupabaseConfigured) {
      const result = demoActivation(key);
      if (!result.valid) {
        return res.status(400).json(errorResponse('INVALID_KEY', result.error || 'Invalid key'));
      }
      const token = createActivationSession();
      return res.json(successResponse({ token, demoMode: true }));
    }

    // Production: verify against Supabase
    const supabase = await getSupabase();
    const keyHash = hashKey(key);
    const { data: activationKey, error } = await supabase
      .from('activation_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .single();

    if (error || !activationKey) {
      return res.status(400).json(errorResponse('INVALID_KEY', 'Invalid activation key'));
    }

    // Check status
    if (activationKey.status === 'revoked') {
      return res.status(400).json(errorResponse('REVOKED_KEY', 'Activation key has been revoked'));
    }

    if (activationKey.status === 'expired' || (activationKey.expires_at && new Date(activationKey.expires_at) < new Date())) {
      return res.status(400).json(errorResponse('EXPIRED_KEY', 'Activation key has expired'));
    }

    if (activationKey.status === 'inactive') {
      return res.status(400).json(errorResponse('INACTIVE_KEY', 'Activation key is not active'));
    }

    // Update last verified timestamp
    await supabase
      .from('activation_keys')
      .update({ last_verified_at: new Date().toISOString(), activated_at: activationKey.activated_at || new Date().toISOString() })
      .eq('id', activationKey.id);

    const token = createActivationSession();
    res.json(successResponse({ token }));
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Activation failed'));
  }
});

export default router;
