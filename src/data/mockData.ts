export interface Lead {
  id: string;
  business: string;
  email: string;
  category: string;
  location: string;
  website: string;
  phone?: string;
  source?: string;
  notes?: string;
  status: 'new' | 'approved' | 'rejected' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  lastActivity: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  category: string;
  location: string;
  leads: string[];
  status: 'draft' | 'generating' | 'review' | 'sending' | 'sent';
  emailTemplate: {
    subject: string;
    body: string;
  };
  aiPersonalization: 'light' | 'balanced' | 'deep';
  createdAt: string;
}

export interface Email {
  id: string;
  leadId: string;
  campaignId: string;
  to: string;
  subject: string;
  body: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'queued' | 'sent' | 'delivered' | 'open_detected' | 'clicked' | 'replied' | 'bounced' | 'failed';
  personalizationSummary?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
}

export interface Activity {
  id: string;
  leadId: string;
  leadName: string;
  type: 'email_sent' | 'delivered' | 'open_detected' | 'clicked' | 'replied' | 'bounced' | 'failed';
  timestamp: string;
  campaignId?: string;
}

export interface AppStats {
  totalLeads: number;
  emailsSent: number;
  delivered: number;
  openDetected: number;
  clicked: number;
  replies: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
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

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    business: 'Royal Stitch',
    email: 'hello@royalstitch.com',
    category: 'Fashion & Tailoring',
    location: 'Benin City',
    website: 'royalstitch.com',
    phone: '08012345678',
    source: 'Google',
    status: 'new',
    lastActivity: 'Never contacted',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    business: 'Bella Couture',
    email: 'hello@bellacouture.com',
    category: 'Fashion & Tailoring',
    location: 'Benin City',
    website: 'bellacouture.com',
    phone: '08023456789',
    source: 'Google',
    status: 'delivered',
    lastActivity: 'Today',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    business: 'Prime Fashion',
    email: 'hello@primefashion.com',
    category: 'Fashion',
    location: 'Lagos',
    website: 'primefashion.com',
    status: 'opened',
    lastActivity: 'Today',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    business: 'Urban Thread',
    email: '',
    category: 'Fashion & Tailoring',
    location: 'Benin City',
    website: 'urbanthread.com',
    status: 'new',
    lastActivity: 'Never contacted',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    business: 'Lagos Grille',
    email: 'info@lagosgrille.com',
    category: 'Restaurants',
    location: 'Lagos',
    website: 'lagosgrille.com',
    status: 'clicked',
    lastActivity: 'Today',
    createdAt: '2024-01-11',
  },
  {
    id: '6',
    business: 'Benin Palace Hotel',
    email: 'book@beninpalace.com',
    category: 'Hotels',
    location: 'Benin City',
    website: 'beninpalace.com',
    status: 'replied',
    lastActivity: 'Today',
    createdAt: '2024-01-10',
  },
  {
    id: '7',
    business: 'Glow Beauty Studio',
    email: 'hello@glowbeauty.com',
    category: 'Beauty & Skincare',
    location: 'Lagos',
    website: 'glowbeauty.com',
    status: 'delivered',
    lastActivity: 'Yesterday',
    createdAt: '2024-01-09',
  },
  {
    id: '8',
    business: 'FitLife Gym',
    email: 'info@fitlife.com',
    category: 'Gyms & Fitness',
    location: 'Benin City',
    website: 'fitlifegym.com',
    status: 'new',
    lastActivity: 'Never contacted',
    createdAt: '2024-01-08',
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Fashion Brands — Benin',
    category: 'Fashion & Tailoring',
    location: 'Benin City',
    leads: ['1', '2', '4'],
    status: 'sent',
    emailTemplate: {
      subject: 'A quick idea for your business',
      body: 'Hi,\n\nI came across your business and thought there might be an opportunity to collaborate. Would love to connect.\n\nBest regards',
    },
    aiPersonalization: 'balanced',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Restaurants — Lagos',
    category: 'Restaurants',
    location: 'Lagos',
    leads: ['5'],
    status: 'sent',
    emailTemplate: {
      subject: 'Partnership opportunity',
      body: 'Hi,\n\nYour restaurant caught my attention. Would you be open to a partnership?\n\nBest regards',
    },
    aiPersonalization: 'balanced',
    createdAt: '2024-01-14',
  },
];

export const MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    leadId: '1',
    campaignId: '1',
    to: 'hello@royalstitch.com',
    subject: 'A quick idea for Royal Stitch',
    body: 'Hi Royal Stitch team,\n\nI came across your tailoring business and thought there might be an opportunity to collaborate on a digital marketing campaign.\n\nBest regards',
    status: 'delivered',
    personalizationSummary: 'Mentioned tailoring services and digital marketing',
    createdAt: '2024-01-15T15:42:00',
    sentAt: '2024-01-15T15:42:00',
    deliveredAt: '2024-01-15T15:43:00',
    openedAt: '2024-01-15T15:51:00',
    clickedAt: '2024-01-15T15:53:00',
  },
  {
    id: 'e2',
    leadId: '2',
    campaignId: '1',
    to: 'hello@bellacouture.com',
    subject: 'A quick idea for Bella Couture',
    body: 'Hi Bella Couture team,\n\nI came across your fashion boutique and thought there might be an opportunity to collaborate on a promotional campaign.\n\nBest regards',
    status: 'open_detected',
    personalizationSummary: 'Mentioned fashion boutique and promotional campaign',
    createdAt: '2024-01-15T15:42:00',
    sentAt: '2024-01-15T15:42:00',
    deliveredAt: '2024-01-15T15:43:00',
    openedAt: '2024-01-15T15:51:00',
  },
  {
    id: 'e3',
    leadId: '3',
    campaignId: '1',
    to: 'hello@primefashion.com',
    subject: 'A quick idea for Prime Fashion',
    body: 'Hi Prime Fashion team,\n\nI came across your fashion business and thought there might be an opportunity to collaborate on expanding your reach.\n\nBest regards',
    status: 'clicked',
    personalizationSummary: 'Mentioned fashion business and expanding reach',
    createdAt: '2024-01-15T15:42:00',
    sentAt: '2024-01-15T15:42:00',
    deliveredAt: '2024-01-15T15:43:00',
    openedAt: '2024-01-15T15:51:00',
    clickedAt: '2024-01-15T15:53:00',
  },
];

export const MOCK_ACTIVITY: Activity[] = [
  {
    id: 'a1',
    leadId: '1',
    leadName: 'Royal Stitch',
    type: 'delivered',
    timestamp: '2 min ago',
    campaignId: '1',
  },
  {
    id: 'a2',
    leadId: '2',
    leadName: 'Bella Couture',
    type: 'open_detected',
    timestamp: '8 min ago',
    campaignId: '1',
  },
  {
    id: 'a3',
    leadId: '3',
    leadName: 'Prime Fashion',
    type: 'clicked',
    timestamp: '22 min ago',
    campaignId: '1',
  },
  {
    id: 'a4',
    leadId: '6',
    leadName: 'Benin Palace Hotel',
    type: 'replied',
    timestamp: '41 min ago',
    campaignId: '1',
  },
  {
    id: 'a5',
    leadId: '5',
    leadName: 'Lagos Grille',
    type: 'email_sent',
    timestamp: '1 hour ago',
    campaignId: '2',
  },
];

export const MOCK_STATS: AppStats = {
  totalLeads: 1250,
  emailsSent: 486,
  delivered: 451,
  openDetected: 218,
  clicked: 64,
  replies: 31,
};
