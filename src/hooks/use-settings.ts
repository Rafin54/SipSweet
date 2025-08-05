'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/types/app';
import { DEFAULT_SETTINGS } from '@/types/app';
import { storage } from '@/lib/storage';
import { db } from '@/lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial settings
  useEffect(() => {
    loadSettings();
    
    // Set up online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      // Sync when coming back online
      if (hasUnsavedChanges) {
        syncToServer();
      }
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasUnsavedChanges]);

  const loadSettings = async () => {
    setIsLoading(true);
    
    try {
      // Try to load from server first if online
      if (isOnline) {
        const serverSettings = await db.getSettings();
        if (serverSettings) {
          setSettings(serverSettings);
          storage.setSettings(serverSettings);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback to local storage
      const localSettings = storage.getSettings();
      if (localSettings) {
        // Migrate old settings to include new defaults
        const migratedSettings = {
          ...DEFAULT_SETTINGS,
          ...localSettings,
          // Ensure DND settings exist if they don't
          dnd_enabled: localSettings.dnd_enabled ?? DEFAULT_SETTINGS.dnd_enabled,
          dnd_start_time: localSettings.dnd_start_time ?? DEFAULT_SETTINGS.dnd_start_time,
          dnd_end_time: localSettings.dnd_end_time ?? DEFAULT_SETTINGS.dnd_end_time,
          // Update interval if it's still the old default (60 minutes)
          interval_min: localSettings.interval_min === 60 ? DEFAULT_SETTINGS.interval_min : localSettings.interval_min,
        };
        setSettings(migratedSettings);
        storage.setSettings(migratedSettings);
      } else {
        // Use default settings and save them
        setSettings(DEFAULT_SETTINGS);
        storage.setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to local storage on error
      const localSettings = storage.getSettings() || DEFAULT_SETTINGS;
      setSettings(localSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    const updatedSettings = { ...settings, ...newSettings };
    
    try {
      // Optimistically update local state
      setSettings(updatedSettings);
      
      // Save to local storage immediately
      storage.setSettings(updatedSettings);
      
      // Try to save to server if online
      if (isOnline) {
        const savedSettings = await db.updateSettings(updatedSettings);
        if (savedSettings) {
          setSettings(savedSettings);
          storage.setSettings(savedSettings);
          setHasUnsavedChanges(false);
        } else {
          setHasUnsavedChanges(true);
        }
      } else {
        setHasUnsavedChanges(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      setHasUnsavedChanges(true);
      return false;
    }
  }, [settings, isOnline]);

  const updateNickname = useCallback((nickname: UserSettings['nickname']) => {
    return updateSettings({ nickname });
  }, [updateSettings]);

  const updateDailyGoal = useCallback((daily_goal_ml: number) => {
    return updateSettings({ daily_goal_ml });
  }, [updateSettings]);

  const updateInterval = useCallback((interval_min: number) => {
    return updateSettings({ interval_min });
  }, [updateSettings]);

  const updateFlowerType = useCallback((flower_type: UserSettings['flower_type']) => {
    return updateSettings({ flower_type });
  }, [updateSettings]);

  const updateDndSettings = useCallback((dndSettings: {
    dnd_enabled?: boolean;
    dnd_start_time?: string;
    dnd_end_time?: string;
  }) => {
    return updateSettings(dndSettings);
  }, [updateSettings]);

  const resetToDefaults = useCallback(() => {
    return updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  const syncToServer = useCallback(async (): Promise<boolean> => {
    if (!isOnline || !hasUnsavedChanges) return false;
    
    try {
      const savedSettings = await db.updateSettings(settings);
      if (savedSettings) {
        setSettings(savedSettings);
        storage.setSettings(savedSettings);
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing settings to server:', error);
      return false;
    }
  }, [settings, isOnline, hasUnsavedChanges]);

  // Computed values
  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    
    return `${timeGreeting}, ${settings.nickname}`;
  }, [settings.nickname]);

  const getFlowerEmoji = useCallback((): string => {
    const flowerEmojis = {
      rose: '🌹',
      tulip: '🌷',
      daisy: '🌼',
    };
    return flowerEmojis[settings.flower_type] || '🌸';
  }, [settings.flower_type]);

  const getNextReminderTime = useCallback((): Date => {
    const now = new Date();
    const nextReminder = new Date(now.getTime() + settings.interval_min * 60 * 1000);
    return nextReminder;
  }, [settings.interval_min]);

  const isDndActive = useCallback((): boolean => {
    if (!settings.dnd_enabled || !settings.dnd_start_time || !settings.dnd_end_time) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = settings.dnd_start_time.split(':').map(Number);
    const [endHour, endMin] = settings.dnd_end_time.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight DND window
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }

    // Handle same-day DND window
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }, [settings.dnd_enabled, settings.dnd_start_time, settings.dnd_end_time]);

  const getDndStatusMessage = useCallback((): string | null => {
    if (!settings.dnd_enabled || !settings.dnd_start_time || !settings.dnd_end_time) {
      return null;
    }

    if (isDndActive()) {
      const [endHour, endMin] = settings.dnd_end_time.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);

      const timeString = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      return `Do not disturb until ${timeString}`;
    }

    return null;
  }, [settings.dnd_enabled, settings.dnd_start_time, settings.dnd_end_time, isDndActive]);

  const isValidSettings = useCallback((): boolean => {
    return (
      settings.daily_goal_ml >= 500 &&
      settings.daily_goal_ml <= 5000 &&
      settings.interval_min >= 15 &&
      settings.interval_min <= 480 &&
      ['Princess', 'Babe', 'Sweetie'].includes(settings.nickname) &&
      ['rose', 'tulip', 'daisy'].includes(settings.flower_type)
    );
  }, [settings]);

  return {
    // State
    settings,
    isLoading,
    isOnline,
    hasUnsavedChanges,
    
    // Actions
    updateSettings,
    updateNickname,
    updateDailyGoal,
    updateInterval,
    updateFlowerType,
    updateDndSettings,
    resetToDefaults,
    syncToServer,

    // Computed values
    getGreeting,
    getFlowerEmoji,
    getNextReminderTime,
    isDndActive,
    getDndStatusMessage,
    isValidSettings,
  };
}
