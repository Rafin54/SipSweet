import type { UserSettings, IntakeLog } from '@/types/app';

// Local Storage Keys
const STORAGE_KEYS = {
  SETTINGS: 'sipsweet_settings',
  INTAKE_LOGS: 'sipsweet_intake_logs',
  ONBOARDING_COMPLETE: 'sipsweet_onboarding_complete',
  LAST_SYNC: 'sipsweet_last_sync',
} as const;

// Local Storage Utilities
export const storage = {
  // Settings
  getSettings(): UserSettings | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading settings from localStorage:', error);
      return null;
    }
  },

  setSettings(settings: UserSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  },

  // Intake Logs
  getIntakeLogs(): IntakeLog[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INTAKE_LOGS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  setIntakeLogs(logs: IntakeLog[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.INTAKE_LOGS, JSON.stringify(logs));
    } catch (error) {
      // Silently fail
    }
  },

  addIntakeLog(log: IntakeLog): void {
    const logs = this.getIntakeLogs();
    logs.push(log);
    this.setIntakeLogs(logs);
  },

  getTodayIntakeLogs(): IntakeLog[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getIntakeLogs().filter(log => log.date === today);
  },

  // Onboarding
  isOnboardingComplete(): boolean {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  },

  setOnboardingComplete(complete: boolean): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete.toString());
  },

  // Sync tracking
  getLastSync(): Date | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return stored ? new Date(stored) : null;
  },

  setLastSync(date: Date): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  },

  // Clear all data
  clear(): void {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

// Sync utilities for offline/online data management
export const syncUtils = {
  async syncToServer(logs: IntakeLog[], settings: UserSettings): Promise<boolean> {
    try {
      // This would sync local data to Supabase
      // Implementation depends on your sync strategy
      storage.setLastSync(new Date());
      return true;
    } catch (error) {
      return false;
    }
  },

  async syncFromServer(): Promise<{ logs: IntakeLog[]; settings: UserSettings | null }> {
    try {
      // This would fetch data from Supabase
      // Implementation depends on your sync strategy
      return { logs: [], settings: null };
    } catch (error) {
      return { logs: [], settings: null };
    }
  },

  needsSync(): boolean {
    const lastSync = storage.getLastSync();
    if (!lastSync) return true;
    
    // Sync if last sync was more than 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastSync < oneHourAgo;
  },
};
