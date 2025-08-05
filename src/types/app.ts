// SipSweet Lamia - App Type Definitions

export interface UserSettings {
  id?: string;
  nickname: 'Princess' | 'Babe' | 'Sweetie';
  daily_goal_ml: number;
  interval_min: number;
  flower_type: 'rose' | 'tulip' | 'daisy';
  dnd_start_time?: string; // Format: 'HH:MM' (e.g., '02:00')
  dnd_end_time?: string;   // Format: 'HH:MM' (e.g., '11:00')
  dnd_enabled?: boolean;   // Whether do-not-disturb is active
  created_at?: string;
  updated_at?: string;
}

export interface IntakeLog {
  id?: string;
  amount_ml: number;
  logged_at: string;
  date: string;
}

export interface PushSubscription {
  id?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface DailyProgress {
  date: string;
  total_ml: number;
  goal_ml: number;
  percentage: number;
  logs: IntakeLog[];
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    nickname: string;
    flower_emoji: string;
    timestamp: string;
  };
}

export interface FlowerTheme {
  type: 'rose' | 'tulip' | 'daisy';
  emoji: string;
  color: string;
  petals: number;
}

export const FLOWER_THEMES: Record<string, FlowerTheme> = {
  rose: {
    type: 'rose',
    emoji: '🌹',
    color: '#F8D7DA',
    petals: 8,
  },
  tulip: {
    type: 'tulip',
    emoji: '🌷',
    color: '#E6D0EC',
    petals: 6,
  },
  daisy: {
    type: 'daisy',
    emoji: '🌼',
    color: '#DFF4E3',
    petals: 12,
  },
};

export const NICKNAME_OPTIONS = ['Princess', 'Babe', 'Sweetie'] as const;

export const DEFAULT_SETTINGS: UserSettings = {
  nickname: 'Princess',
  daily_goal_ml: 2000,
  interval_min: 120, // Changed from 60 to 120 minutes (2 hours)
  flower_type: 'rose',
  dnd_start_time: '02:00',
  dnd_end_time: '11:00',
  dnd_enabled: true,
};

export const SIP_AMOUNTS = [
  { label: 'Small Sip', amount: 150, emoji: '💧' },
  { label: 'Regular Sip', amount: 250, emoji: '🥤' },
  { label: 'Big Gulp', amount: 400, emoji: '🚰' },
] as const;
