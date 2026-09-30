import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Lead,
  Category,
  Campaign,
  Email,
  Activity,
  DEFAULT_CATEGORIES,
  MOCK_LEADS,
  MOCK_CAMPAIGNS,
  MOCK_EMAILS,
  MOCK_ACTIVITY,
  MOCK_STATS,
} from '../data/mockData';

interface AppState {
  isActivated: boolean;
  categories: Category[];
  leads: Lead[];
  campaigns: Campaign[];
  emails: Email[];
  activities: Activity[];
  stats: typeof MOCK_STATS;
  currentCampaignId: string | null;
  generatedEmails: Email[];
  reviewedCount: number;
  searchResults: Lead[];
  isSearching: boolean;

  activate: (key: string) => boolean;
  addCategory: (category: Omit<Category, 'id'>) => void;
  removeCategory: (id: string) => void;
  addLeads: (leads: Lead[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  searchLeads: (query: string) => void;
  setSearchResults: (results: Lead[]) => void;
  setIsSearching: (searching: boolean) => void;
  
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => string;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  setCurrentCampaignId: (id: string | null) => void;
  
  generateEmails: (campaignId: string) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  approveEmail: (id: string) => void;
  rejectEmail: (id: string) => void;
  approveAllReviewed: () => void;
  
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateStats: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isActivated: false,
      categories: [...DEFAULT_CATEGORIES],
      leads: [...MOCK_LEADS],
      campaigns: [...MOCK_CAMPAIGNS],
      emails: [...MOCK_EMAILS],
      activities: [...MOCK_ACTIVITY],
      stats: { ...MOCK_STATS },
      currentCampaignId: null,
      generatedEmails: [],
      reviewedCount: 0,
      searchResults: [],
      isSearching: false,

      activate: (key: string) => {
        if (key === 'DEMO-LEADFORGE-2026' || key.length > 5) {
          set({ isActivated: true });
          return true;
        }
        return false;
      },

      addCategory: (category) => {
        const id = `custom-${Date.now()}`;
        set((state) => ({
          categories: [...state.categories, { ...category, id, isCustom: true }],
        }));
      },

      removeCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addLeads: (leads) => {
        set((state) => ({
          leads: [...state.leads, ...leads],
        }));
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== id),
        }));
      },

      searchLeads: (query) => {
        const { leads } = get();
        const filtered = leads.filter(
          (l) =>
            l.business.toLowerCase().includes(query.toLowerCase()) ||
            l.email.toLowerCase().includes(query.toLowerCase()) ||
            l.website.toLowerCase().includes(query.toLowerCase())
        );
        set({ searchResults: filtered });
      },

      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (searching) => set({ isSearching: searching }),

      createCampaign: (campaign) => {
        const id = `campaign-${Date.now()}`;
        const newCampaign: Campaign = {
          ...campaign,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
          currentCampaignId: id,
        }));
        return id;
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      setCurrentCampaignId: (id) => set({ currentCampaignId: id }),

      generateEmails: (campaignId) => {
        const { leads, campaigns, emails } = get();
        const campaign = campaigns.find((c) => c.id === campaignId);
        if (!campaign) return;

        const campaignLeads = leads.filter((l) => campaign.leads.includes(l.id));
        const newEmails: Email[] = campaignLeads.map((lead, index) => ({
          id: `email-${Date.now()}-${index}`,
          leadId: lead.id,
          campaignId,
          to: lead.email,
          subject: `A quick idea for ${lead.business}`,
          body: `Hi ${lead.business} team,\n\nI came across your ${lead.category.toLowerCase()} business and thought there might be an opportunity to collaborate.\n\nBest regards`,
          status: 'pending_review',
          personalizationSummary: `Mentioned ${lead.category.toLowerCase()} services`,
          createdAt: new Date().toISOString(),
        }));

        set({
          generatedEmails: newEmails,
          emails: [...emails, ...newEmails],
        });
      },

      updateEmail: (id, updates) => {
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
          generatedEmails: state.generatedEmails.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      approveEmail: (id) => {
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === id ? { ...e, status: 'approved' as const } : e
          ),
          generatedEmails: state.generatedEmails.map((e) =>
            e.id === id ? { ...e, status: 'approved' as const } : e
          ),
          reviewedCount: state.reviewedCount + 1,
        }));
      },

      rejectEmail: (id) => {
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === id ? { ...e, status: 'rejected' as const } : e
          ),
          generatedEmails: state.generatedEmails.map((e) =>
            e.id === id ? { ...e, status: 'rejected' as const } : e
          ),
          reviewedCount: state.reviewedCount + 1,
        }));
      },

      approveAllReviewed: () => {
        set((state) => ({
          emails: state.emails.map((e) =>
            e.status === 'pending_review' ? { ...e, status: 'approved' as const } : e
          ),
          generatedEmails: state.generatedEmails.map((e) =>
            e.status === 'pending_review' ? { ...e, status: 'approved' as const } : e
          ),
          reviewedCount: state.generatedEmails.length,
        }));
      },

      addActivity: (activity) => {
        const id = `activity-${Date.now()}`;
        set((state) => ({
          activities: [{ ...activity, id }, ...state.activities],
        }));
      },

      updateStats: () => {
        const { emails } = get();
        const stats = {
          totalLeads: get().leads.length,
          emailsSent: emails.filter((e) => ['sent', 'delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length,
          delivered: emails.filter((e) => ['delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length,
          openDetected: emails.filter((e) => ['opened', 'clicked', 'replied'].includes(e.status)).length,
          clicked: emails.filter((e) => ['clicked', 'replied'].includes(e.status)).length,
          replies: emails.filter((e) => e.status === 'replied').length,
        };
        set({ stats });
      },
    }),
    {
      name: 'lead-forge-storage',
      partialize: (state) => ({
        isActivated: state.isActivated,
        categories: state.categories,
        leads: state.leads,
        campaigns: state.campaigns,
        emails: state.emails,
        activities: state.activities,
        stats: state.stats,
      }),
    }
  )
);
