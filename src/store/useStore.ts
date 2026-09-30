/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as api from '../services/api';

interface AppState {
  isActivated: boolean;
  activationToken: string | null;
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
  isLoading: boolean;
  error: string | null;

  activate: (key: string) => Promise<boolean>;
  logout: () => void;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  fetchLeads: () => Promise<void>;
  addLeads: (leads: Lead[]) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  searchLeads: (query: string) => void;
  setSearchResults: (results: Lead[]) => void;
  setIsSearching: (searching: boolean) => void;
  fetchSearchResults: (params: { categories: string[]; location: string; limit?: number; additionalKeywords?: string }) => Promise<void>;
  
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => Promise<string>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  setCurrentCampaignId: (id: string | null) => void;
  generateEmails: (campaignId: string) => Promise<number>;
  
  fetchEmails: () => Promise<void>;
  updateEmail: (id: string, updates: Partial<Email>) => Promise<void>;
  approveEmail: (id: string) => Promise<void>;
  rejectEmail: (id: string) => Promise<void>;
  approveAllReviewed: () => void;
  sendEmail: (id: string) => Promise<void>;
  
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateStats: () => void;
  clearError: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isActivated: false,
      activationToken: null,
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
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      activate: async (key: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.activationApi.verify(key);
          set({
            isActivated: true,
            activationToken: response.token,
            isLoading: false,
          });
          // Fetch real data after activation
          await get().fetchCategories();
          await get().fetchLeads();
          await get().fetchCampaigns();
          await get().fetchActivities();
          return true;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Activation failed', isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('activation_token');
        set({
          isActivated: false,
          activationToken: null,
          categories: [...DEFAULT_CATEGORIES],
          leads: [...MOCK_LEADS],
          campaigns: [...MOCK_CAMPAIGNS],
          emails: [...MOCK_EMAILS],
          activities: [...MOCK_ACTIVITY],
          stats: { ...MOCK_STATS },
        });
      },

      fetchCategories: async () => {
        try {
          const categories = await api.categoriesApi.getAll();
          set({ categories });
        } catch (err) {
          console.error('Failed to fetch categories:', err);
        }
      },

      addCategory: async (category) => {
        try {
          const newCategory = await api.categoriesApi.create(category);
          set((state) => ({
            categories: [...state.categories, { ...newCategory, isCustom: true }],
          }));
        } catch (err) {
          // Fallback to local state
          const id = `custom-${Date.now()}`;
          set((state) => ({
            categories: [...state.categories, { ...category, id, isCustom: true }],
          }));
        }
      },

      removeCategory: async (id) => {
        try {
          await api.categoriesApi.delete(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        } catch (err) {
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        }
      },

      fetchLeads: async () => {
        try {
          const leads = await api.leadsApi.getAll();
          set({ leads: leads as any });
        } catch (err) {
          console.error('Failed to fetch leads:', err);
        }
      },

      addLeads: async (leadsToAdd) => {
        try {
          // Try bulk create first
          const newLeads = await api.leadsApi.createBulk(leadsToAdd.map(l => ({
            business_name: l.business,
            email: l.email,
            phone: l.phone,
            website: l.website,
            industry: l.category,
            location: l.location,
            source: l.source,
            notes: l.notes,
          } as any)));
          set((state) => ({
            leads: [...state.leads, ...newLeads.map((l: any) => ({
              id: l.id,
              business: l.business_name,
              email: l.email || '',
              phone: l.phone,
              category: l.industry || '',
              location: l.location || '',
              website: l.website || '',
              source: l.source,
              notes: l.notes,
              status: l.status || 'new',
              lastActivity: 'Never contacted',
              createdAt: l.created_at,
            }))],
          }));
        } catch (err) {
          // Fallback to local state
          const newLeads = leadsToAdd.map((l, i) => ({
            ...l,
            id: `local-${Date.now()}-${i}`,
            status: 'new' as const,
            lastActivity: 'Never contacted',
          }));
          set((state) => ({
            leads: [...state.leads, ...newLeads],
          }));
        }
      },

      updateLead: async (id, updates) => {
        try {
          await api.leadsApi.update(id, {
            business_name: updates.business,
            email: updates.email,
            phone: updates.phone,
            website: updates.website,
            industry: updates.category,
            location: updates.location,
            notes: updates.notes,
          } as any);
          set((state) => ({
            leads: state.leads.map((l) =>
              l.id === id ? { ...l, ...updates } : l
            ),
          }));
        } catch (err) {
          // Update locally anyway
          set((state) => ({
            leads: state.leads.map((l) =>
              l.id === id ? { ...l, ...updates } : l
            ),
          }));
        }
      },

      deleteLead: async (id) => {
        try {
          await api.leadsApi.delete(id);
          set((state) => ({
            leads: state.leads.filter((l) => l.id !== id),
          }));
        } catch (err) {
          set((state) => ({
            leads: state.leads.filter((l) => l.id !== id),
          }));
        }
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

      fetchSearchResults: async (params) => {
        set({ isSearching: true });
        try {
          const results = await api.leadsApi.search(params);
          set({
            searchResults: results.map((r) => ({
              id: `search-${Date.now()}-${Math.random()}`,
              business: r.businessName,
              email: r.email || '',
              phone: r.phone || '',
              category: params.categories[0] || '',
              location: r.location,
              website: r.website || '',
              source: r.source,
              description: r.description,
              status: 'new' as const,
              lastActivity: 'Never contacted',
              createdAt: new Date().toISOString(),
            })),
            isSearching: false,
          });
        } catch (err) {
          console.error('Search failed:', err);
          set({ isSearching: false });
        }
      },

      fetchCampaigns: async () => {
        try {
          const campaigns = await api.campaignsApi.getAll();
          set({ campaigns: campaigns.map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            location: c.location,
            leads: c.leads || [],
            status: c.status,
            emailTemplate: { subject: c.base_subject, body: c.base_email },
            aiPersonalization: c.personalization_level,
            createdAt: c.created_at,
          })) });
        } catch (err) {
          console.error('Failed to fetch campaigns:', err);
        }
      },

      createCampaign: async (campaign) => {
        try {
          const newCampaign = await api.campaignsApi.create({
            name: campaign.name,
            category: campaign.category,
            location: campaign.location,
            leads: campaign.leads,
            emailTemplate: campaign.emailTemplate,
            aiPersonalization: campaign.aiPersonalization,
          });
          set((state) => ({
            campaigns: [...state.campaigns, newCampaign as any],
            currentCampaignId: (newCampaign as any).id,
          }));
          return (newCampaign as any).id;
        } catch (err) {
          const id = `campaign-${Date.now()}`;
          set((state) => ({
            campaigns: [...state.campaigns, { ...campaign, id, createdAt: new Date().toISOString() }],
            currentCampaignId: id,
          }));
          return id;
        }
      },

      updateCampaign: async (id, updates) => {
        try {
          await api.campaignsApi.update(id, updates as any);
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        } catch (err) {
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        }
      },

      setCurrentCampaignId: (id) => set({ currentCampaignId: id }),

      generateEmails: async (campaignId) => {
        try {
          const result = await api.campaignsApi.generate(campaignId);
          // Refetch emails after generation
          await get().fetchEmails();
          return result.generated;
        } catch (err) {
          console.error('Email generation failed:', err);
          // Generate locally as fallback
          const { leads, campaigns } = get();
          const campaign = campaigns.find((c) => c.id === campaignId);
          if (!campaign) return 0;

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
            emails: [...get().emails, ...newEmails],
          });
          return newEmails.length;
        }
      },

      fetchEmails: async () => {
        // Email fetching is done through campaigns
        // This is a placeholder for potential email-specific endpoint
      },

      updateEmail: async (id, updates) => {
        try {
          await api.emailsApi.update(id, updates);
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }));
        } catch (err) {
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }));
        }
      },

      approveEmail: async (id) => {
        try {
          await api.emailsApi.approve(id);
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, status: 'approved' as const } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, status: 'approved' as const } : e
            ),
            reviewedCount: state.reviewedCount + 1,
          }));
        } catch (err) {
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, status: 'approved' as const } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, status: 'approved' as const } : e
            ),
            reviewedCount: state.reviewedCount + 1,
          }));
        }
      },

      rejectEmail: async (id) => {
        try {
          await api.emailsApi.reject(id);
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, status: 'rejected' as const } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, status: 'rejected' as const } : e
            ),
            reviewedCount: state.reviewedCount + 1,
          }));
        } catch (err) {
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, status: 'rejected' as const } : e
            ),
            generatedEmails: state.generatedEmails.map((e) =>
              e.id === id ? { ...e, status: 'rejected' as const } : e
            ),
            reviewedCount: state.reviewedCount + 1,
          }));
        }
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

      sendEmail: async (id) => {
        try {
          await api.emailsApi.send(id);
          set((state) => ({
            emails: state.emails.map((e) =>
              e.id === id ? { ...e, status: 'sent' as const } : e
            ),
          }));
        } catch (err) {
          console.error('Send failed:', err);
        }
      },

      fetchActivities: async () => {
        try {
          const activities = await api.activityApi.getAll();
          set({ activities: activities as any });
        } catch (err) {
          console.error('Failed to fetch activities:', err);
        }
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
        activationToken: state.activationToken,
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
