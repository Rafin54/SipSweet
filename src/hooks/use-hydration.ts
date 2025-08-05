'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IntakeLog, DailyProgress } from '@/types/app';
import { storage } from '@/lib/storage';
import { db } from '@/lib/supabase';
import { progressUtils, dateUtils } from '@/lib/utils';

export function useHydration(dailyGoalMl: number = 2000) {
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [todayProgress, setTodayProgress] = useState<DailyProgress>({
    date: dateUtils.formatDate(new Date()),
    total_ml: 0,
    goal_ml: dailyGoalMl,
    percentage: 0,
    logs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Load initial data
  useEffect(() => {
    loadHydrationData();
    
    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update progress when logs or goal changes
  useEffect(() => {
    const progress = progressUtils.calculateDailyProgress(logs, dailyGoalMl);
    setTodayProgress(progress);
  }, [logs, dailyGoalMl]);

  const loadHydrationData = async () => {
    setIsLoading(true);
    
    try {
      // Try to load from server first if online
      if (isOnline) {
        const serverLogs = await db.getTodayIntake();
        if (serverLogs.length > 0) {
          setLogs(serverLogs);
          storage.setIntakeLogs(serverLogs);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback to local storage
      const localLogs = storage.getIntakeLogs();
      setLogs(localLogs);
    } catch (error) {
      console.error('Error loading hydration data:', error);
      // Fallback to local storage on error
      const localLogs = storage.getIntakeLogs();
      setLogs(localLogs);
    } finally {
      setIsLoading(false);
    }
  };

  const logIntake = useCallback(async (amountMl: number): Promise<boolean> => {
    const now = new Date();
    const newLog: IntakeLog = {
      amount_ml: amountMl,
      logged_at: now.toISOString(),
      date: dateUtils.formatDate(now),
    };

    try {
      // Optimistically update local state
      const updatedLogs = [...logs, newLog];
      setLogs(updatedLogs);
      
      // Save to local storage immediately
      storage.addIntakeLog(newLog);
      
      // Try to save to server if online
      if (isOnline) {
        const savedLog = await db.logIntake(amountMl);
        if (savedLog) {
          // Update with server-generated ID
          const logsWithId = updatedLogs.map(log => 
            log === newLog ? savedLog : log
          );
          setLogs(logsWithId);
          storage.setIntakeLogs(logsWithId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error logging intake:', error);
      // The optimistic update already happened, so the user sees the change
      // We'll sync to server later when online
      return false;
    }
  }, [logs, isOnline]);

  const getWeeklyProgress = useCallback((): DailyProgress[] => {
    return progressUtils.calculateWeeklyProgress(logs, dailyGoalMl);
  }, [logs, dailyGoalMl]);

  const getTodayLogs = useCallback((): IntakeLog[] => {
    const today = dateUtils.formatDate(new Date());
    return logs.filter(log => log.date === today);
  }, [logs]);

  const getLastSipTime = useCallback((): Date | null => {
    const todayLogs = getTodayLogs();
    if (todayLogs.length === 0) return null;
    
    const lastLog = todayLogs[todayLogs.length - 1];
    return new Date(lastLog.logged_at);
  }, [getTodayLogs]);

  const isGoalReached = useCallback((): boolean => {
    return todayProgress.percentage >= 100;
  }, [todayProgress.percentage]);

  const getRemainingAmount = useCallback((): number => {
    return Math.max(0, dailyGoalMl - todayProgress.total_ml);
  }, [dailyGoalMl, todayProgress.total_ml]);

  const syncToServer = useCallback(async (): Promise<boolean> => {
    if (!isOnline) return false;
    
    try {
      // Get local logs that might not be synced
      const localLogs = storage.getIntakeLogs();
      const today = dateUtils.formatDate(new Date());
      const todayLocalLogs = localLogs.filter(log => log.date === today);
      
      // This is a simplified sync - in a real app you'd want more sophisticated sync logic
      for (const log of todayLocalLogs) {
        if (!log.id) {
          // Log doesn't have an ID, so it's not synced to server
          await db.logIntake(log.amount_ml);
        }
      }
      
      // Reload from server to get the latest state
      await loadHydrationData();
      return true;
    } catch (error) {
      console.error('Error syncing to server:', error);
      return false;
    }
  }, [isOnline, loadHydrationData]);

  return {
    // State
    logs,
    todayProgress,
    isLoading,
    isOnline,
    
    // Actions
    logIntake,
    syncToServer,
    
    // Computed values
    getWeeklyProgress,
    getTodayLogs,
    getLastSipTime,
    isGoalReached,
    getRemainingAmount,
  };
}
