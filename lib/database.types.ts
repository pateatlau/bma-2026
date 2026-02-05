export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_email: string | null;
          actor_id: string | null;
          created_at: string;
          id: string;
          ip_address: unknown;
          new_values: Json | null;
          old_values: Json | null;
          resource_id: string | null;
          resource_type: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_email?: string | null;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_email?: string | null;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: unknown;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_conversations: {
        Row: {
          created_at: string;
          id: string;
          language: Database['public']['Enums']['language_code'];
          last_message_at: string | null;
          message_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language?: Database['public']['Enums']['language_code'];
          last_message_at?: string | null;
          message_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language?: Database['public']['Enums']['language_code'];
          last_message_at?: string | null;
          message_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          classification: Database['public']['Enums']['chat_classification'] | null;
          confidence_score: number | null;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          retrieved_doc_ids: string[] | null;
          role: Database['public']['Enums']['chat_role'];
        };
        Insert: {
          classification?: Database['public']['Enums']['chat_classification'] | null;
          confidence_score?: number | null;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          retrieved_doc_ids?: string[] | null;
          role: Database['public']['Enums']['chat_role'];
        };
        Update: {
          classification?: Database['public']['Enums']['chat_classification'] | null;
          confidence_score?: number | null;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          retrieved_doc_ids?: string[] | null;
          role?: Database['public']['Enums']['chat_role'];
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'chat_conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          body: string;
          content_id: string;
          created_at: string;
          deleted_at: string | null;
          hidden_at: string | null;
          hidden_by: string | null;
          hidden_reason: string | null;
          id: string;
          is_hidden: boolean;
          parent_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          content_id: string;
          created_at?: string;
          deleted_at?: string | null;
          hidden_at?: string | null;
          hidden_by?: string | null;
          hidden_reason?: string | null;
          id?: string;
          is_hidden?: boolean;
          parent_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          content_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          hidden_at?: string | null;
          hidden_by?: string | null;
          hidden_reason?: string | null;
          id?: string;
          is_hidden?: boolean;
          parent_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'content';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_hidden_by_fkey';
            columns: ['hidden_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      content: {
        Row: {
          author_id: string | null;
          body_en: string | null;
          body_lus: string | null;
          comments_count: number;
          comments_enabled: boolean;
          created_at: string;
          deleted_at: string | null;
          event_date: string | null;
          event_end_date: string | null;
          event_location: string | null;
          event_location_url: string | null;
          excerpt_en: string | null;
          excerpt_lus: string | null;
          featured_image_url: string | null;
          gallery_urls: Json | null;
          id: string;
          leadership_order: number | null;
          leadership_position: string | null;
          likes_count: number;
          published_at: string | null;
          scheduled_for: string | null;
          status: Database['public']['Enums']['content_status'];
          title_en: string | null;
          title_lus: string | null;
          type: Database['public']['Enums']['content_type'];
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body_en?: string | null;
          body_lus?: string | null;
          comments_count?: number;
          comments_enabled?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          event_location?: string | null;
          event_location_url?: string | null;
          excerpt_en?: string | null;
          excerpt_lus?: string | null;
          featured_image_url?: string | null;
          gallery_urls?: Json | null;
          id?: string;
          leadership_order?: number | null;
          leadership_position?: string | null;
          likes_count?: number;
          published_at?: string | null;
          scheduled_for?: string | null;
          status?: Database['public']['Enums']['content_status'];
          title_en?: string | null;
          title_lus?: string | null;
          type: Database['public']['Enums']['content_type'];
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body_en?: string | null;
          body_lus?: string | null;
          comments_count?: number;
          comments_enabled?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          event_location?: string | null;
          event_location_url?: string | null;
          excerpt_en?: string | null;
          excerpt_lus?: string | null;
          featured_image_url?: string | null;
          gallery_urls?: Json | null;
          id?: string;
          leadership_order?: number | null;
          leadership_position?: string | null;
          likes_count?: number;
          published_at?: string | null;
          scheduled_for?: string | null;
          status?: Database['public']['Enums']['content_status'];
          title_en?: string | null;
          title_lus?: string | null;
          type?: Database['public']['Enums']['content_type'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_message_counts: {
        Row: {
          count: number;
          date: string;
          id: string;
          user_id: string;
        };
        Insert: {
          count?: number;
          date?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          count?: number;
          date?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_message_counts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      escalations: {
        Row: {
          conversation_id: string;
          created_at: string;
          email_sent_at: string | null;
          id: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database['public']['Enums']['escalation_status'];
          summary: string | null;
          trigger_message_id: string | null;
          updated_at: string;
          user_id: string;
          whatsapp_sent_at: string | null;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          email_sent_at?: string | null;
          id?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database['public']['Enums']['escalation_status'];
          summary?: string | null;
          trigger_message_id?: string | null;
          updated_at?: string;
          user_id: string;
          whatsapp_sent_at?: string | null;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          email_sent_at?: string | null;
          id?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database['public']['Enums']['escalation_status'];
          summary?: string | null;
          trigger_message_id?: string | null;
          updated_at?: string;
          user_id?: string;
          whatsapp_sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'escalations_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'chat_conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escalations_resolved_by_fkey';
            columns: ['resolved_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escalations_trigger_message_id_fkey';
            columns: ['trigger_message_id'];
            isOneToOne: false;
            referencedRelation: 'chat_messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escalations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      knowledge_base: {
        Row: {
          category: string;
          content_en: string | null;
          content_lus: string | null;
          created_at: string;
          embedding_en: string | null;
          embedding_lus: string | null;
          id: string;
          source_url: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          content_en?: string | null;
          content_lus?: string | null;
          created_at?: string;
          embedding_en?: string | null;
          embedding_lus?: string | null;
          id?: string;
          source_url?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content_en?: string | null;
          content_lus?: string | null;
          created_at?: string;
          embedding_en?: string | null;
          embedding_lus?: string | null;
          id?: string;
          source_url?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          content_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          content_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          content_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'content';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          renewed_from_id: string | null;
          starts_at: string | null;
          status: Database['public']['Enums']['membership_status'];
          tier: Database['public']['Enums']['membership_tier'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          renewed_from_id?: string | null;
          starts_at?: string | null;
          status?: Database['public']['Enums']['membership_status'];
          tier?: Database['public']['Enums']['membership_tier'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          renewed_from_id?: string | null;
          starts_at?: string | null;
          status?: Database['public']['Enums']['membership_status'];
          tier?: Database['public']['Enums']['membership_tier'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_renewed_from_id_fkey';
            columns: ['renewed_from_id'];
            isOneToOne: false;
            referencedRelation: 'memberships';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'memberships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_logs: {
        Row: {
          channel: Database['public']['Enums']['notification_channel'];
          created_at: string;
          delivered_at: string | null;
          external_id: string | null;
          failed_at: string | null;
          failure_reason: string | null;
          id: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          sent_at: string | null;
          template_name: string;
          template_params: Json | null;
          user_id: string | null;
        };
        Insert: {
          channel: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          delivered_at?: string | null;
          external_id?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          sent_at?: string | null;
          template_name: string;
          template_params?: Json | null;
          user_id?: string | null;
        };
        Update: {
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          delivered_at?: string | null;
          external_id?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          sent_at?: string | null;
          template_name?: string;
          template_params?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount_paise: number;
          created_at: string;
          currency: string;
          id: string;
          idempotency_key: string | null;
          ip_address: unknown;
          membership_id: string | null;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: Database['public']['Enums']['payment_status'];
          status_history: Json;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          amount_paise: number;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          ip_address?: unknown;
          membership_id?: string | null;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          status_history?: Json;
          updated_at?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          amount_paise?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          ip_address?: unknown;
          membership_id?: string | null;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          status_history?: Json;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_membership_id_fkey';
            columns: ['membership_id'];
            isOneToOne: false;
            referencedRelation: 'memberships';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          app_role: Database['public']['Enums']['app_role'];
          bangalore_address: string | null;
          created_at: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: Database['public']['Enums']['relationship_type'] | null;
          emergency_contact_relation_other: string | null;
          full_name: string | null;
          id: string;
          is_directory_visible: boolean;
          language_preference: Database['public']['Enums']['language_code'];
          notification_channel: Database['public']['Enums']['notification_channel'];
          notifications_enabled: boolean;
          occupation: Database['public']['Enums']['occupation_type'] | null;
          occupation_other: string | null;
          permanent_address: string | null;
          phone: string | null;
          photo_url: string | null;
          updated_at: string;
        };
        Insert: {
          app_role?: Database['public']['Enums']['app_role'];
          bangalore_address?: string | null;
          created_at?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: Database['public']['Enums']['relationship_type'] | null;
          emergency_contact_relation_other?: string | null;
          full_name?: string | null;
          id: string;
          is_directory_visible?: boolean;
          language_preference?: Database['public']['Enums']['language_code'];
          notification_channel?: Database['public']['Enums']['notification_channel'];
          notifications_enabled?: boolean;
          occupation?: Database['public']['Enums']['occupation_type'] | null;
          occupation_other?: string | null;
          permanent_address?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          updated_at?: string;
        };
        Update: {
          app_role?: Database['public']['Enums']['app_role'];
          bangalore_address?: string | null;
          created_at?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: Database['public']['Enums']['relationship_type'] | null;
          emergency_contact_relation_other?: string | null;
          full_name?: string | null;
          id?: string;
          is_directory_visible?: boolean;
          language_preference?: Database['public']['Enums']['language_code'];
          notification_channel?: Database['public']['Enums']['notification_channel'];
          notifications_enabled?: boolean;
          occupation?: Database['public']['Enums']['occupation_type'] | null;
          occupation_other?: string | null;
          permanent_address?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: never;
        Returns: Database['public']['Enums']['app_role'];
      };
      has_active_membership: { Args: never; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      is_editor_or_admin: { Args: never; Returns: boolean };
      is_paid_member: { Args: never; Returns: boolean };
    };
    Enums: {
      app_role: 'user' | 'member' | 'editor' | 'admin';
      chat_classification: 'informational' | 'guidance' | 'urgent';
      chat_role: 'user' | 'assistant' | 'system';
      content_status: 'draft' | 'scheduled' | 'published' | 'archived';
      content_type: 'news' | 'article' | 'event' | 'newsletter' | 'gallery' | 'leadership';
      escalation_status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
      language_code: 'en' | 'lus';
      membership_status: 'active' | 'expired' | 'cancelled' | 'pending';
      membership_tier: 'free' | 'annual' | 'lifetime';
      notification_channel: 'whatsapp' | 'email' | 'both';
      occupation_type:
        | 'student'
        | 'govt_employee'
        | 'private_employee'
        | 'doctor'
        | 'engineer'
        | 'teacher'
        | 'business_owner'
        | 'self_employed'
        | 'homemaker'
        | 'retired'
        | 'other';
      payment_status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
      relationship_type:
        | 'spouse'
        | 'father'
        | 'mother'
        | 'brother'
        | 'sister'
        | 'son'
        | 'daughter'
        | 'friend'
        | 'relative'
        | 'other';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ['user', 'member', 'editor', 'admin'],
      chat_classification: ['informational', 'guidance', 'urgent'],
      chat_role: ['user', 'assistant', 'system'],
      content_status: ['draft', 'scheduled', 'published', 'archived'],
      content_type: ['news', 'article', 'event', 'newsletter', 'gallery', 'leadership'],
      escalation_status: ['pending', 'acknowledged', 'resolved', 'dismissed'],
      language_code: ['en', 'lus'],
      membership_status: ['active', 'expired', 'cancelled', 'pending'],
      membership_tier: ['free', 'annual', 'lifetime'],
      notification_channel: ['whatsapp', 'email', 'both'],
      occupation_type: [
        'student',
        'govt_employee',
        'private_employee',
        'doctor',
        'engineer',
        'teacher',
        'business_owner',
        'self_employed',
        'homemaker',
        'retired',
        'other',
      ],
      payment_status: ['pending', 'processing', 'success', 'failed', 'refunded'],
      relationship_type: [
        'spouse',
        'father',
        'mother',
        'brother',
        'sister',
        'son',
        'daughter',
        'friend',
        'relative',
        'other',
      ],
    },
  },
} as const;
