import { createClient } from '@supabase/supabase-js';
import type { UserSettings, IntakeLog, PushSubscription } from '@/types/app';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



// Create a mock client for development when Supabase is not configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder_anon_key';



export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null; // We'll handle this in the db functions

// Database type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at'>>;
      };
      intake_logs: {
        Row: IntakeLog;
        Insert: Omit<IntakeLog, 'id'>;
        Update: Partial<Omit<IntakeLog, 'id'>>;
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: Omit<PushSubscription, 'id' | 'created_at'>;
        Update: Partial<Omit<PushSubscription, 'id' | 'created_at'>>;
      };
    };
  };
}

// Utility functions for database operations
export const db = {
  // User Settings
  async getSettings(): Promise<UserSettings | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        return null;
      }

      return data;
    } catch (err) {
      return null;
    }
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  // Intake Logs
  async logIntake(amount_ml: number): Promise<IntakeLog | null> {
    if (!supabase) {
      return null;
    }

    try {
      const now = new Date();
      const logData = {
        amount_ml,
        logged_at: now.toISOString(),
        date: now.toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('intake_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (err) {
      return null;
    }
  },

  async getTodayIntake(): Promise<IntakeLog[]> {
    if (!supabase) {
      return [];
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('intake_logs')
        .select('*')
        .eq('date', today)
        .order('logged_at', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (err) {
      return [];
    }
  },

  async getIntakeByDateRange(startDate: string, endDate: string): Promise<IntakeLog[]> {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('intake_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('logged_at', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  },

  // Push Subscriptions
  async savePushSubscription(subscription: Omit<PushSubscription, 'id' | 'created_at'>): Promise<PushSubscription | null> {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        ...subscription,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  async getActivePushSubscriptions(): Promise<PushSubscription[]> {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return [];
    }

    return data || [];
  },

  async deactivatePushSubscription(endpoint: string): Promise<boolean> {
    if (!supabase) {
      return true;
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', endpoint);

    if (error) {
      return false;
    }

    return true;
  },
};
