const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

function getToken(): string | null {
  return localStorage.getItem('activation_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data as T;
}

// Activation API
export const activationApi = {
  verify: (key: string) =>
    request<{ token: string; demoMode?: boolean }>('POST', '/activation/verify', { key }),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    request<Category[]>('GET', '/categories'),
  create: (category: { name: string; description?: string; is_favorite?: boolean }) =>
    request<Category>('POST', '/categories', category),
  update: (id: string, updates: Partial<Category>) =>
    request<Category>('PATCH', `/categories/${id}`, updates),
  delete: (id: string) =>
    request<{ deleted: boolean }>('DELETE', `/categories/${id}`),
};

// Leads API
export const leadsApi = {
  getAll: () =>
    request<Lead[]>('GET', '/leads'),
  getById: (id: string) =>
    request<Lead>('GET', `/leads/${id}`),
  create: (lead: LeadCreateParams) =>
    request<Lead>('POST', '/leads', lead),
  createBulk: (leads: LeadCreateParams[]) =>
    request<Lead[]>('POST', '/leads/bulk', leads),
  update: (id: string, updates: Partial<LeadCreateParams>) =>
    request<Lead>('PATCH', `/leads/${id}`, updates),
  delete: (id: string) =>
    request<{ deleted: boolean }>('DELETE', `/leads/${id}`),
  search: (params: { categories: string[]; location: string; limit?: number; additionalKeywords?: string }) =>
    request<SearchResult[]>('POST', '/leads/search', params),
};

// Campaigns API
export const campaignsApi = {
  getAll: () =>
    request<Campaign[]>('GET', '/campaigns'),
  getById: (id: string) =>
    request<Campaign>('GET', `/campaigns/${id}`),
  create: (campaign: Partial<Campaign>) =>
    request<Campaign>('POST', '/campaigns', campaign),
  update: (id: string, updates: Partial<Campaign>) =>
    request<Campaign>('PATCH', `/campaigns/${id}`, updates),
  generate: (id: string) =>
    request<{ generated: number; campaignId: string }>('POST', `/campaigns/${id}/generate`),
  send: (id: string) =>
    request<{ total: number; campaignId: string }>('POST', `/campaigns/${id}/send`),
};

// Emails API
export const emailsApi = {
  getById: (id: string) =>
    request<Email>('GET', `/emails/${id}`),
  update: (id: string, updates: Partial<Email>) =>
    request<Email>('PATCH', `/emails/${id}`, updates),
  approve: (id: string) =>
    request<Email>('POST', `/emails/${id}/approve`),
  reject: (id: string) =>
    request<Email>('POST', `/emails/${id}/reject`),
  regenerate: (id: string) =>
    request<{ regenerated: boolean }>('POST', `/emails/${id}/regenerate`),
  send: (id: string) =>
    request<{ sent: boolean; messageId?: string }>('POST', `/emails/${id}/send`),
};

// Activity API
export const activityApi = {
  getAll: (limit?: number) =>
    request<Activity[]>('GET', `/activity?limit=${limit || 50}`),
};

// Settings API
export const settingsApi = {
  get: () =>
    request<Settings>('GET', '/settings'),
  updateNotifications: (settings: Partial<NotificationSettings>) =>
    request<Settings>('PATCH', '/settings/notifications', settings),
  testTelegram: () =>
    request<{ sent: boolean }>('POST', '/settings/test/telegram'),
};

// Types (mirroring backend and frontend mock data)
interface Category {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  is_custom?: boolean;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Lead {
  id: string;
  business: string;
  email: string;
  phone?: string;
  category: string;
  location: string;
  website: string;
  source?: string;
  notes?: string;
  status: string;
  lastActivity: string;
  createdAt: string;
}

interface SearchResult {
  businessName: string;
  website: string | null;
  description: string | null;
  location: string;
  source: string;
  sourceUrl: string;
  email?: string | null;
  phone?: string | null;
}

interface Campaign {
  id: string;
  name: string;
  category: string;
  location: string;
  leads: string[];
  status: 'draft' | 'generating' | 'review' | 'sending' | 'sent';
  emailTemplate?: {
    subject: string;
    body: string;
  };
  aiPersonalization: 'light' | 'balanced' | 'deep';
  createdAt: string;
}

interface Email {
  id: string;
  leadId: string;
  campaignId: string;
  to: string;
  subject: string;
  body: string;
  status: string;
  personalizationSummary?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
}

interface Activity {
  id: string;
  leadId: string;
  leadName: string;
  type: string;
  timestamp: string;
  campaignId?: string;
}

interface Settings {
  notify_on_delivered: boolean;
  notify_on_opened: boolean;
  notify_on_clicked: boolean;
  notify_on_replied: boolean;
  notify_on_bounced: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  tiktok_enabled: boolean;
  connectionStatus?: {
    serper: boolean;
    openrouter: boolean;
    resend: boolean;
    telegram: boolean;
    whatsapp: boolean;
  };
}

interface NotificationSettings {
  notify_on_delivered?: boolean;
  notify_on_opened?: boolean;
  notify_on_clicked?: boolean;
  notify_on_replied?: boolean;
  notify_on_bounced?: boolean;
  telegram_enabled?: boolean;
  whatsapp_enabled?: boolean;
  tiktok_enabled?: boolean;
}

// API-specific types for creating/updating
interface LeadCreateParams {
  business_name?: string;
  business?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  category?: string;
  location?: string;
  source?: string;
  notes?: string;
}


