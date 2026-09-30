import { Router } from 'express';
import { z } from 'zod';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';
import { searchLeads } from '../services/leadSearchService.js';

const router = Router();

const createLeadSchema = z.object({
  business_name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = z.object({
  business_name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  do_not_contact: z.boolean().optional(),
});

const searchSchema = z.object({
  categories: z.array(z.string()),
  location: z.string(),
  limit: z.number().min(1).max(100).default(50),
  additionalKeywords: z.string().optional(),
});

// Mock leads for demo mode
const MOCK_LEADS = [
  { id: '1', business_name: 'Royal Stitch', email: 'hello@royalstitch.com', category: 'Fashion & Tailoring', location: 'Benin City', website: 'royalstitch.com', phone: '08012345678', source: 'Google', status: 'new', do_not_contact: false, created_at: '2024-01-15' },
  { id: '2', business_name: 'Bella Couture', email: 'hello@bellacouture.com', category: 'Fashion & Tailoring', location: 'Benin City', website: 'bellacouture.com', phone: '08023456789', source: 'Google', status: 'delivered', do_not_contact: false, created_at: '2024-01-14' },
];

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

router.get('/', async (req, res) => {
  const supabase = isSupabaseConfigured ? await getSupabase() : null;
  const { data: leadData, error } = supabase
    ? await supabase.from('leads').select('*').order('created_at', { ascending: false })
    : { data: MOCK_LEADS, error: null };

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  const formatted = (leadData || []).map((lead: any) => ({
    id: lead.id,
    business: lead.business_name,
    email: lead.email || '',
    category: lead.industry || '',
    location: lead.location || '',
    website: lead.website || '',
    phone: lead.phone,
    source: lead.source,
    notes: lead.notes,
    status: lead.status,
    lastActivity: lead.do_not_contact ? 'Do Not Contact' : 'Never contacted',
    createdAt: lead.created_at,
  }));

  res.json(successResponse(formatted));
});

router.get('/:id', async (req, res) => {
  if (!isSupabaseConfigured) {
    const lead = MOCK_LEADS.find(l => l.id === req.params.id);
    if (!lead) return res.status(404).json(errorResponse('NOT_FOUND', 'Lead not found'));
    return res.json(successResponse(lead));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase.from('leads').select('*').eq('id', req.params.id).single();

  if (error) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Lead not found'));
  }

  res.json(successResponse(data));
});

router.post('/', async (req, res) => {
  const parsed = createLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid lead data'));
  }

  if (!isSupabaseConfigured) {
    const newLead = { id: `${Date.now()}`, ...parsed.data, status: 'new', do_not_contact: false, created_at: new Date().toISOString() };
    return res.status(201).json(successResponse(newLead));
  }

  const supabase = await getSupabase();

  // Check for duplicates
  if (parsed.data.email) {
    const normalizedEmail = normalizeEmail(parsed.data.email);
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .or(`email.ilike.${normalizedEmail}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json(errorResponse('DUPLICATE', 'Lead with this email already exists'));
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...parsed.data, status: 'new', do_not_contact: false })
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.status(201).json(successResponse(data));
});

router.post('/bulk', async (req, res) => {
  const leadsSchema = z.array(createLeadSchema);
  const parsed = leadsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid lead data'));
  }

  if (!isSupabaseConfigured) {
    const newLeads = parsed.data.map((lead, i) => ({ id: `${Date.now()}-${i}`, ...lead, status: 'new', do_not_contact: false, created_at: new Date().toISOString() }));
    return res.status(201).json(successResponse(newLeads));
  }

  const supabase = await getSupabase();
  const leadsWithDefaults = parsed.data.map(lead => ({ ...lead, status: 'new', do_not_contact: false }));
  const { data, error } = await supabase.from('leads').insert(leadsWithDefaults).select();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.status(201).json(successResponse(data));
});

router.patch('/:id', async (req, res) => {
  const parsed = updateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid update data'));
  }

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, ...parsed.data }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('leads')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.delete('/:id', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse({ deleted: true }));
  }

  const supabase = await getSupabase();
  const { error } = await supabase.from('leads').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse({ deleted: true }));
});

router.post('/search', async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid search parameters'));
  }

  try {
    const results = await searchLeads(parsed.data);
    res.json(successResponse(results));
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json(errorResponse('SEARCH_ERROR', 'Failed to search for leads'));
  }
});

export default router;
