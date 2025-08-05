'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/types/app';
import { deviceUtils, notificationUtils } from '@/lib/utils';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check support and permission on mount
  useEffect(() => {
    setIsSupported(deviceUtils.supportsNotifications());
    
    if (deviceUtils.supportsNotifications()) {
      setPermission(Notification.permission);
      
      // Check if we already have a push subscription
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        setSubscription(existingSubscription);
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setIsLoading(true);
    
    try {
      const result = await deviceUtils.requestNotificationPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    setIsLoading(true);

    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        setSubscription(pushSubscription);

        // Send subscription to server
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: pushSubscription.toJSON(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save subscription to server');
        }

        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true; // Already unsubscribed
    }

    setIsLoading(true);

    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify server to deactivate subscription
      await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  const showLocalNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'hydration-reminder',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }, [isSupported, permission]);

  const showHydrationReminder = useCallback((settings: UserSettings) => {
    // Check if we should send notification based on DND settings
    if (!notificationUtils.shouldSendNotification(settings)) {
      return null;
    }

    const { title, body } = notificationUtils.generateMessage(
      settings.nickname,
      settings.flower_type
    );

    const flowerEmoji = notificationUtils.getFlowerEmoji(settings.flower_type);

    return showLocalNotification(title, body, {
      data: {
        nickname: settings.nickname,
        flower_emoji: flowerEmoji,
        timestamp: new Date().toISOString(),
      },
    });
  }, [showLocalNotification]);

  const testNotification = useCallback(() => {
    return showLocalNotification(
      'Test Notification 🌸',
      'This is a test notification from SipSweet Lamia!',
      {
        tag: 'test-notification',
      }
    );
  }, [showLocalNotification]);

  // Computed values
  const canRequestPermission = isSupported && permission === 'default';
  const canSubscribe = isSupported && permission === 'granted' && !subscription;
  const canUnsubscribe = isSupported && subscription !== null;
  const isSubscribed = subscription !== null;

  return {
    // State
    permission,
    isSupported,
    subscription,
    isLoading,
    
    // Actions
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showLocalNotification,
    showHydrationReminder,
    testNotification,
    
    // Computed values
    canRequestPermission,
    canSubscribe,
    canUnsubscribe,
    isSubscribed,
  };
}
