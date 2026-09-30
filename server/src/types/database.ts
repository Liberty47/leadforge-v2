export interface Database {
  public: {
    Tables: {
      activation_keys: {
        Row: {
          id: string;
          key_hash: string;
          label: string | null;
          status: 'active' | 'inactive' | 'expired' | 'revoked';
          created_at: string;
          activated_at: string | null;
          expires_at: string | null;
          last_verified_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['activation_keys']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['activation_keys']['Insert']>;
      };
      business_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_system: boolean;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['business_categories']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          business_name: string;
          email: string | null;
          phone: string | null;
          website: string | null;
          industry: string | null;
          location: string | null;
          description: string | null;
          source: string | null;
          source_url: string | null;
          status: string;
          notes: string | null;
          do_not_contact: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      lead_categories: {
        Row: {
          id: string;
          lead_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lead_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lead_categories']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          base_subject: string;
          base_email: string;
          personalization_level: 'light' | 'balanced' | 'deep';
          status: 'draft' | 'generating' | 'review' | 'sending' | 'sent';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
      campaign_leads: {
        Row: {
          id: string;
          campaign_id: string;
          lead_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campaign_leads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campaign_leads']['Insert']>;
      };
      email_drafts: {
        Row: {
          id: string;
          campaign_id: string;
          lead_id: string;
          subject: string;
          body: string;
          personalization_summary: string | null;
          ai_model: string | null;
          status: 'pending_review' | 'approved' | 'rejected' | 'queued' | 'sent' | 'delivered' | 'open_detected' | 'clicked' | 'replied' | 'bounced' | 'failed';
          provider_message_id: string | null;
          approved_at: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          replied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['email_drafts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['email_drafts']['Insert']>;
      };
      email_events: {
        Row: {
          id: string;
          email_draft_id: string;
          lead_id: string;
          campaign_id: string;
          event_type: string;
          provider_event_id: string | null;
          occurred_at: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['email_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['email_events']['Insert']>;
      };
      notification_settings: {
        Row: {
          id: string;
          notify_on_delivered: boolean;
          notify_on_opened: boolean;
          notify_on_clicked: boolean;
          notify_on_replied: boolean;
          notify_on_bounced: boolean;
          telegram_enabled: boolean;
          whatsapp_enabled: boolean;
          tiktok_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notification_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notification_settings']['Insert']>;
      };
      app_settings: {
        Row: {
          id: string;
          emails_per_day: number;
          delay_between_sends: number;
          timezone: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>;
      };
    };
  };
}
