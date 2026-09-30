import { Router } from 'express';
import { z } from 'zod';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';
import { generateEmails } from '../services/aiPersonalizationService.js';

const router = Router();

const createCampaignSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  location: z.string(),
  leads: z.array(z.string()),
  emailTemplate: z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
  }),
  aiPersonalization: z.enum(['light', 'balanced', 'deep']),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  base_subject: z.string().min(1).optional(),
  base_email: z.string().min(1).optional(),
  personalization_level: z.enum(['light', 'balanced', 'deep']).optional(),
  status: z.enum(['draft', 'generating', 'review', 'sending', 'sent']).optional(),
});

// Mock campaigns
const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Fashion Brands — Benin', category: 'Fashion & Tailoring', location: 'Benin City', leads: ['1', '2', '4'], status: 'sent', emailTemplate: { subject: 'A quick idea for your business', body: 'Hi,\n\nI came across your business and thought there might be an opportunity to collaborate.' }, aiPersonalization: 'balanced', created_at: '2024-01-15' },
];

router.get('/', async (_req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse(MOCK_CAMPAIGNS));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.get('/:id', async (req, res) => {
  if (!isSupabaseConfigured) {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === req.params.id);
    if (!campaign) return res.status(404).json(errorResponse('NOT_FOUND', 'Campaign not found'));
    return res.json(successResponse(campaign));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Campaign not found'));
  }

  res.json(successResponse(data));
});

router.post('/', async (req, res) => {
  const parsed = createCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid campaign data'));
  }

  if (!isSupabaseConfigured) {
    const newCampaign = {
      id: `${Date.now()}`,
      ...parsed.data,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    return res.status(201).json(successResponse(newCampaign));
  }

  const supabase = await getSupabase();
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      name: parsed.data.name,
      base_subject: parsed.data.emailTemplate.subject,
      base_email: parsed.data.emailTemplate.body,
      personalization_level: parsed.data.aiPersonalization,
      status: 'draft',
    })
    .select()
    .single();

  if (campaignError) {
    return res.status(500).json(errorResponse('DB_ERROR', campaignError.message));
  }

  // Add campaign leads
  const campaignLeads = parsed.data.leads.map(leadId => ({
    campaign_id: campaign.id,
    lead_id: leadId,
  }));

  await supabase.from('campaign_leads').insert(campaignLeads);

  res.status(201).json(successResponse(campaign));
});

router.patch('/:id', async (req, res) => {
  const parsed = updateCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid update data'));
  }

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, ...parsed.data }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('campaigns')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.post('/:id/generate', async (req, res) => {
  const campaignId = req.params.id;

  if (!isSupabaseConfigured) {
    // Demo mode - generate mock emails
    return res.json(successResponse({ generated: 3, campaignId }));
  }

  const supabase = await getSupabase();

  // Get campaign with leads
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Campaign not found'));
  }

  // Update status to generating
  await supabase.from('campaigns').update({ status: 'generating' }).eq('id', campaignId);

  // Get leads for this campaign
  const { data: campaignLeads } = await supabase
    .from('campaign_leads')
    .select('lead_id')
    .eq('campaign_id', campaignId);

  if (!campaignLeads || campaignLeads.length === 0) {
    return res.status(400).json(errorResponse('NO_LEADS', 'Campaign has no leads'));
  }

  const leadIds = campaignLeads.map(cl => cl.lead_id);
  const { data: leads } = await supabase.from('leads').select('*').in('id', leadIds);

  if (!leads || leads.length === 0) {
    return res.status(400).json(errorResponse('NO_LEADS', 'No valid leads found'));
  }

  try {
    const results = await generateEmails({
      campaign,
      leads,
    });

    // Save generated drafts
    const drafts = results.map(result => ({
      campaign_id: campaignId,
      lead_id: result.leadId,
      subject: result.subject,
      body: result.body,
      personalization_summary: result.personalization_summary,
      ai_model: result.ai_model || 'openrouter',
      status: 'pending_review',
    }));

    const { error: draftsError } = await supabase.from('email_drafts').insert(drafts);

    if (draftsError) {
      console.error('Error saving drafts:', draftsError);
    }

    // Update campaign status
    await supabase.from('campaigns').update({ status: 'review' }).eq('id', campaignId);

    res.json(successResponse({ generated: results.length, campaignId }));
  } catch (err) {
    console.error('Generation error:', err);
    await supabase.from('campaigns').update({ status: 'draft' }).eq('id', campaignId);
    res.status(500).json(errorResponse('GENERATION_ERROR', 'Failed to generate emails'));
  }
});

router.post('/:id/send', async (req, res) => {
  const campaignId = req.params.id;

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ sent: 0, campaignId }));
  }

  const supabase = await getSupabase();

  // Get campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Campaign not found'));
  }

  // Get approved emails
  const { data: emails } = await supabase
    .from('email_drafts')
    .select('*, leads(email)')
    .eq('campaign_id', campaignId)
    .eq('status', 'approved');

  if (!emails || emails.length === 0) {
    return res.status(400).json(errorResponse('NO_APPROVED', 'No approved emails to send'));
  }

  // Update status to sending
  await supabase.from('campaigns').update({ status: 'sending' }).eq('id', campaignId);

  res.json(successResponse({ total: emails.length, campaignId }));
});

export default router;
