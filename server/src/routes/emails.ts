import { Router } from 'express';
import { z } from 'zod';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';
import { sendEmail } from '../services/emailService.js';

const router = Router();

const updateEmailSchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

// Mock emails
const MOCK_EMAILS = [
  { id: 'e1', leadId: '1', campaignId: '1', to: 'hello@royalstitch.com', subject: 'A quick idea for Royal Stitch', body: 'Hi Royal Stitch team...', status: 'delivered', personalizationSummary: 'Mentioned tailoring', createdAt: '2024-01-15T15:42:00' },
];

router.get('/:id', async (req, res) => {
  if (!isSupabaseConfigured) {
    const email = MOCK_EMAILS.find(e => e.id === req.params.id);
    if (!email) return res.status(404).json(errorResponse('NOT_FOUND', 'Email not found'));
    return res.json(successResponse(email));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('email_drafts')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Email not found'));
  }

  res.json(successResponse(data));
});

router.patch('/:id', async (req, res) => {
  const parsed = updateEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid update data'));
  }

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, ...parsed.data }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('email_drafts')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.post('/:id/approve', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, status: 'approved' }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('email_drafts')
    .update({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('status', 'pending_review')
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  if (!data) {
    return res.status(400).json(errorResponse('INVALID_STATUS', 'Email cannot be approved'));
  }

  res.json(successResponse(data));
});

router.post('/:id/reject', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, status: 'rejected' }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('email_drafts')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('status', 'pending_review')
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  if (!data) {
    return res.status(400).json(errorResponse('INVALID_STATUS', 'Email cannot be rejected'));
  }

  res.json(successResponse(data));
});

router.post('/:id/regenerate', async (req, res) => {
  const emailId = req.params.id;

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: emailId, regenerated: true }));
  }

  const supabase = await getSupabase();
  // Get the existing email draft
  const { data: existingEmail, error: fetchError } = await supabase
    .from('email_drafts')
    .select('*, campaigns(*), leads(*)')
    .eq('id', emailId)
    .single();

  if (fetchError || !existingEmail) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Email not found'));
  }

  res.json(successResponse({ id: emailId, regenerated: true }));
});

router.post('/:id/send', async (req, res) => {
  const emailId = req.params.id;

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: emailId, sent: true }));
  }

  const supabase = await getSupabase();
  // Get email draft with lead info
  const { data: email, error: fetchError } = await supabase
    .from('email_drafts')
    .select('*, leads(*)')
    .eq('id', emailId)
    .single();

  if (fetchError || !email) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Email not found'));
  }

  // CRITICAL: Only approved emails can be sent
  if (email.status !== 'approved') {
    return res.status(400).json(errorResponse('NOT_APPROVED', 'Only approved emails can be sent'));
  }

  // Check lead has email
  if (!email.leads?.email) {
    return res.status(400).json(errorResponse('NO_EMAIL', 'Lead has no email address'));
  }

  // Check lead is not opted out
  if (email.leads?.do_not_contact) {
    return res.status(400).json(errorResponse('OPTED_OUT', 'Lead has opted out'));
  }

  try {
    const result = await sendEmail({
      to: email.leads.email,
      subject: email.subject,
      body: email.body,
    });

    // Update email status
    await supabase
      .from('email_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_message_id: result.messageId,
      })
      .eq('id', emailId);

    // Create email event
    await supabase.from('email_events').insert({
      email_draft_id: emailId,
      lead_id: email.lead_id,
      campaign_id: email.campaign_id,
      event_type: 'sent',
      provider_event_id: result.messageId,
      occurred_at: new Date().toISOString(),
    });

    res.json(successResponse({ sent: true, messageId: result.messageId }));
  } catch (err) {
    console.error('Send error:', err);
    await supabase
      .from('email_drafts')
      .update({ status: 'failed' })
      .eq('id', emailId);

    res.status(500).json(errorResponse('SEND_FAILED', 'Failed to send email'));
  }
});

export default router;
