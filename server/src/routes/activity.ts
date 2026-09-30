import { Router } from 'express';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase.js';
import { successResponse, errorResponse } from '../lib/response.js';

const router = Router();

// Mock activity
const MOCK_ACTIVITY = [
  { id: 'a1', leadId: '1', leadName: 'Royal Stitch', type: 'delivered', timestamp: '2 min ago', campaignId: '1' },
  { id: 'a2', leadId: '2', leadName: 'Bella Couture', type: 'open_detected', timestamp: '8 min ago', campaignId: '1' },
];

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;

  if (!isSupabaseConfigured) {
    return res.json(successResponse(MOCK_ACTIVITY));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('email_events')
    .select('*, leads(business_name), campaigns(name)')
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) {
    return res.status(500).json(errorResponse('DB_ERROR', error.message));
  }

  const formatted = (data || []).map((event: any) => ({
    id: event.id,
    leadId: event.lead_id,
    leadName: event.leads?.business_name || 'Unknown',
    type: event.event_type,
    timestamp: formatTimestamp(event.occurred_at),
    campaignId: event.campaign_id,
    campaignName: event.campaigns?.name,
  }));

  res.json(successResponse(formatted));
});

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default router;
