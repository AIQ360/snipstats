export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      data_fetch_status: {
        Row: {
          completed_at: string | null
          id: string
          message: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at: string | null
          id?: string
          message: string | null
          started_at: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at: string | null
          id?: string
          message: string | null
          started_at: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_fetch_status_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_analytics: {
        Row: {
          avg_session_duration: number
          bounce_rate: number
          created_at: string
          date: string
          id: string
          pageviews: number
          property_id: string | null
          sessions: number
          updated_at: string
          users: number
          user_id: string
          new_users: number | null
        }
        Insert: {
          avg_session_duration: number
          bounce_rate: number
          created_at?: string
          date: string
          id?: string
          pageviews: number
          property_id?: string | null
          sessions: number
          updated_at?: string
          users: number
          user_id: string
          new_users?: number | null
        }
        Update: {
          avg_session_duration?: number
          bounce_rate?: number
          created_at?: string
          date?: string
          id?: string
          pageviews?: number
          property_id?: string | null
          sessions?: number
          updated_at?: string
          users?: number
          user_id?: string
          new_users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string
          email_sent: boolean | null
          email_sent_at: string | null
          event_type: string
          id: string
          metric_name: string | null
          previous_value: number | null
          title: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          event_type: string
          id?: string
          metric_name?: string | null
          previous_value?: number | null
          title: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          event_type?: string
          id?: string
          metric_name?: string | null
          previous_value?: number | null
          title?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ga_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          data_consent: boolean | null
          ga_account_id: string
          ga_property_id: string
          id: string
          property_name: string | null
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          token_status: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          data_consent?: boolean | null
          ga_account_id: string
          ga_property_id: string
          id?: string
          property_name?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          token_status?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          data_consent?: boolean | null
          ga_account_id?: string
          ga_property_id?: string
          id?: string
          property_name?: string | null
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          token_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ga_accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      page_paths: {
        Row: {
          avg_time_on_page: number | null
          created_at: string
          date: string
          id: string
          page_path: string
          pageviews: number | null
          unique_pageviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_time_on_page?: number | null
          created_at?: string
          date: string
          id?: string
          page_path: string
          pageviews?: number | null
          unique_pageviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_time_on_page?: number | null
          created_at?: string
          date?: string
          id?: string
          page_path?: string
          pageviews?: number | null
          unique_pageviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_paths_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted: boolean | null
          created_at: string
          id: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          description: string | null
          id: string
          interval: string
          name: string
          price: number
          dodo_product_id: string | null
        }
        Insert: {
          description?: string | null
          id: string
          interval: string
          name: string
          price: number
          dodo_product_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          interval?: string
          name?: string
          price?: number
          dodo_product_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          dodo_customer_id: string | null
          dodo_subscription_id: string | null
          id: string
          plan_id: string | null
          status: string
          updated_at: string
          user_id: string
          pending_upgrade_plan_id: string | null
          // New Dodo-compatible fields
          subscription_period_interval: string | null
          subscription_period_count: number | null
          payment_frequency_interval: string | null
          payment_frequency_count: number | null
          next_billing_date: string | null
          previous_billing_date: string | null
          cancelled_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          id?: string
          plan_id?: string | null
          status: string
          updated_at?: string
          user_id: string
          pending_upgrade_plan_id?: string | null
          subscription_period_interval?: string | null
          subscription_period_count?: number | null
          payment_frequency_interval?: string | null
          payment_frequency_count?: number | null
          next_billing_date?: string | null
          previous_billing_date?: string | null
          cancelled_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          pending_upgrade_plan_id?: string | null
          subscription_period_interval?: string | null
          subscription_period_count?: number | null
          payment_frequency_interval?: string | null
          payment_frequency_count?: number | null
          next_billing_date?: string | null
          previous_billing_date?: string | null
          cancelled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_pending_upgrade_plan_id_fkey"
            columns: ["pending_upgrade_plan_id"]
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_sources: {
        Row: {
          created_at: string
          date: string
          id: string
          medium: string | null
          sessions: number | null
          source: string
          updated_at: string
          users: number | null
          user_id: string
          pageviews: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          medium?: string | null
          sessions?: number | null
          source: string
          updated_at?: string
          users?: number | null
          user_id: string
          pageviews?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          medium?: string | null
          sessions?: number | null
          source?: string
          updated_at?: string
          users?: number | null
          user_id?: string
          pageviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_sources_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          referral_code: string | null
          updated_at: string
          notification_email: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          referral_code?: string | null
          updated_at?: string
          notification_email?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          referral_code?: string | null
          updated_at?: string
          notification_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_column_types: {
        Args: {
          table_name: string
        }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
