import { type ClassValue, clsx } from 'clsx';
import type { UserSettings, IntakeLog, DailyProgress, FlowerTheme } from '@/types/app';
import { FLOWER_THEMES } from '@/types/app';

// Utility function for combining class names (similar to shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date utilities
export const dateUtils = {
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  isToday(date: Date): boolean {
    const today = new Date();
    return this.formatDate(date) === this.formatDate(today);
  },

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },
};

// Progress calculation utilities
export const progressUtils = {
  calculateDailyProgress(logs: IntakeLog[], goalMl: number): DailyProgress {
    const today = dateUtils.formatDate(new Date());
    const todayLogs = logs.filter(log => log.date === today);
    const totalMl = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
    const percentage = Math.min((totalMl / goalMl) * 100, 100);

    return {
      date: today,
      total_ml: totalMl,
      goal_ml: goalMl,
      percentage,
      logs: todayLogs,
    };
  },

  calculateWeeklyProgress(logs: IntakeLog[], goalMl: number): DailyProgress[] {
    const today = new Date();
    const weekStart = dateUtils.getWeekStart(today);
    const weekDays: DailyProgress[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = dateUtils.formatDate(date);
      
      const dayLogs = logs.filter(log => log.date === dateStr);
      const totalMl = dayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
      const percentage = Math.min((totalMl / goalMl) * 100, 100);

      weekDays.push({
        date: dateStr,
        total_ml: totalMl,
        goal_ml: goalMl,
        percentage,
        logs: dayLogs,
      });
    }

    return weekDays;
  },

  getPetalsCompleted(percentage: number, totalPetals: number): number {
    return Math.floor((percentage / 100) * totalPetals);
  },
};

// Notification utilities
export const notificationUtils = {
  generateMessage(nickname: string, flowerType: string): { title: string; body: string } {
    const flower = FLOWER_THEMES[flowerType];
    const messages = [
      {
        title: `Time to hydrate, ${nickname}! ${flower.emoji}`,
        body: `Your beautiful petals need water to bloom. Take a sip! 💧`,
      },
      {
        title: `Gentle reminder, ${nickname} ${flower.emoji}`,
        body: `Like flowers need water, you need hydration. Sip something lovely! ✨`,
      },
      {
        title: `${nickname}, your garden awaits! ${flower.emoji}`,
        body: `Time to water your inner garden. A small sip makes a big difference! 🌸`,
      },
      {
        title: `Sweet ${nickname} ${flower.emoji}`,
        body: `Your body is like a delicate flower - it needs water to stay beautiful! 💕`,
      },
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },

  getFlowerEmoji(flowerType: string): string {
    return FLOWER_THEMES[flowerType]?.emoji || '🌸';
  },

  /**
   * Check if a notification should be sent based on DND settings
   */
  shouldSendNotification(settings: UserSettings): boolean {
    return dndUtils.shouldSendNotification(settings);
  },

  /**
   * Get the next scheduled notification time considering DND window
   */
  getNextNotificationTime(settings: UserSettings, lastSipTime?: Date): Date {
    const now = new Date();
    const baseTime = lastSipTime || now;
    const nextTime = new Date(baseTime.getTime() + settings.interval_min * 60 * 1000);

    // If DND is not enabled, return the normal next time
    if (!settings.dnd_enabled || !settings.dnd_start_time || !settings.dnd_end_time) {
      return nextTime;
    }

    // If the next notification would be during DND, schedule it for after DND ends
    if (dndUtils.isInDndWindow(settings.dnd_start_time, settings.dnd_end_time)) {
      const dndEndTime = dndUtils.getNextNotificationTime(settings);
      if (dndEndTime && dndEndTime > nextTime) {
        return dndEndTime;
      }
    }

    return nextTime;
  },
};

// Animation utilities
export const animationUtils = {
  triggerPetalPop(element: HTMLElement): void {
    element.classList.add('animate-petal-pop');
    setTimeout(() => {
      element.classList.remove('animate-petal-pop');
    }, 300);
  },

  triggerProgressFill(element: HTMLElement): void {
    element.classList.add('animate-progress-fill');
    setTimeout(() => {
      element.classList.remove('animate-progress-fill');
    }, 500);
  },
};

// Validation utilities
export const validationUtils = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 2000; // Max 2L per sip seems reasonable
  },

  isValidGoal(goal: number): boolean {
    return goal >= 500 && goal <= 5000; // Between 0.5L and 5L daily
  },

  isValidInterval(interval: number): boolean {
    return interval >= 15 && interval <= 480; // Between 15 minutes and 8 hours
  },
};

// Format utilities
export const formatUtils = {
  formatVolume(ml: number): string {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
  },

  formatPercentage(percentage: number): string {
    return `${Math.round(percentage)}%`;
  },

  formatInterval(minutes: number): string {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  },
};

// Do-not-disturb utilities
export const dndUtils = {
  /**
   * Check if current time is within do-not-disturb window
   */
  isInDndWindow(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight DND window (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }

    // Handle same-day DND window (e.g., 02:00 to 11:00)
    return currentTime >= startMinutes && currentTime <= endMinutes;
  },

  /**
   * Check if notifications should be sent based on DND settings
   */
  shouldSendNotification(settings: UserSettings): boolean {
    if (!settings.dnd_enabled) {
      return true; // DND is disabled, always send notifications
    }

    if (!settings.dnd_start_time || !settings.dnd_end_time) {
      return true; // DND times not set, always send notifications
    }

    return !this.isInDndWindow(settings.dnd_start_time, settings.dnd_end_time);
  },

  /**
   * Get the next time when notifications will be allowed
   */
  getNextNotificationTime(settings: UserSettings): Date | null {
    if (!settings.dnd_enabled || !settings.dnd_start_time || !settings.dnd_end_time) {
      return null; // DND not active
    }

    if (this.shouldSendNotification(settings)) {
      return null; // Notifications are currently allowed
    }

    const now = new Date();
    const [endHour, endMin] = settings.dnd_end_time.split(':').map(Number);

    const nextNotificationTime = new Date(now);
    nextNotificationTime.setHours(endHour, endMin, 0, 0);

    // If the end time is earlier in the day, it means it's for tomorrow
    if (nextNotificationTime <= now) {
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
    }

    return nextNotificationTime;
  },

  /**
   * Format time for display (e.g., "2:00 AM")
   */
  formatTime(timeString: string): string {
    const [hour, minute] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  },

  /**
   * Get DND status message for UI
   */
  getDndStatusMessage(settings: UserSettings): string | null {
    if (!settings.dnd_enabled || !settings.dnd_start_time || !settings.dnd_end_time) {
      return null;
    }

    if (this.isInDndWindow(settings.dnd_start_time, settings.dnd_end_time)) {
      const nextTime = this.getNextNotificationTime(settings);
      if (nextTime) {
        return `Do not disturb until ${this.formatTime(settings.dnd_end_time)}`;
      }
    }

    return null;
  },
};

// Device utilities
export const deviceUtils = {
  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  },

  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches;
  },

  supportsNotifications(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsNotifications()) {
      return 'denied';
    }
    return await Notification.requestPermission();
  },
};
