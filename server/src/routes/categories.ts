import { Router } from 'express';
import { z } from 'zod';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

// Default categories for demo mode
const DEFAULT_CATEGORIES = [
  { id: 'fashion', name: 'Fashion & Tailoring' },
  { id: 'restaurants', name: 'Restaurants' },
  { id: 'hotels', name: 'Hotels' },
  { id: 'beauty', name: 'Beauty & Skincare' },
  { id: 'barbershops', name: 'Barbershops' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'schools', name: 'Schools' },
  { id: 'bookstores', name: 'Bookstores' },
  { id: 'gyms', name: 'Gyms & Fitness' },
  { id: 'photography', name: 'Photography' },
  { id: 'events', name: 'Event Planning' },
  { id: 'logistics', name: 'Logistics' },
  { id: 'construction', name: 'Construction' },
  { id: 'auto', name: 'Auto Services' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'supermarkets', name: 'Supermarkets' },
  { id: 'retail', name: 'Retail' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'professional', name: 'Professional Services' },
  { id: 'digital', name: 'Digital Agencies' },
  { id: 'travel', name: 'Travel & Tourism' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'entertainment', name: 'Entertainment' },
];

router.get('/', async (_req, res) => {
  if (!isSupabaseConfigured) {
    return res.json(successResponse(DEFAULT_CATEGORIES.map(c => ({ ...c, is_system: true, is_favorite: false }))));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('business_categories')
    .select('*')
    .order('is_system', { ascending: false })
    .order('name');

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse(data));
});

router.post('/', async (req, res) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid category data'));
  }

  if (!isSupabaseConfigured) {
    const newCategory = {
      id: `custom-${Date.now()}`,
      ...parsed.data,
      is_system: false,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res.json(successResponse(newCategory));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('business_categories')
    .insert({ ...parsed.data, is_system: false })
    .select()
    .single();

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.status(201).json(successResponse(data));
});

router.patch('/:id', async (req, res) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid update data'));
  }

  if (!isSupabaseConfigured) {
    return res.json(successResponse({ id: req.params.id, ...parsed.data }));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('business_categories')
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
  const { error } = await supabase
    .from('business_categories')
    .delete()
    .eq('id', req.params.id)
    .eq('is_system', false);

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  res.json(successResponse({ deleted: true }));
});

export default router;
