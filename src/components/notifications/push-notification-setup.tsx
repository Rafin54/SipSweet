'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import { useSettings } from '@/hooks/use-settings';

interface PushNotificationSetupProps {
  className?: string;
}

export function PushNotificationSetup({ className }: PushNotificationSetupProps) {
  const { settings } = useSettings();
  const {
    permission,
    isSupported,
    subscription,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    canRequestPermission,
    canSubscribe,
    canUnsubscribe,
    isSubscribed,
  } = useNotifications();

  const [setupStep, setSetupStep] = useState<'permission' | 'subscribe' | 'complete'>('permission');

  useEffect(() => {
    if (permission === 'granted' && isSubscribed) {
      setSetupStep('complete');
    } else if (permission === 'granted') {
      setSetupStep('subscribe');
    } else {
      setSetupStep('permission');
    }
  }, [permission, isSubscribed]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setSetupStep('subscribe');
    }
  };

  const handleSubscribe = async () => {
    const success = await subscribeToPush();
    if (success) {
      setSetupStep('complete');
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribeFromPush();
    if (success) {
      setSetupStep('permission');
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Push Notifications Not Supported</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. You can still use local reminders.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 border border-blossom-pink border-opacity-20 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blossom-pink bg-opacity-20 rounded-full flex items-center justify-center">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-blossom-pink" />
          ) : (
            <BellOff className="w-5 h-5 text-charcoal opacity-60" />
          )}
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-charcoal">
            Push Notifications
          </h3>
          <p className="text-sm text-charcoal opacity-70">
            Get gentle reminders even when the app is closed
          </p>
        </div>
      </div>

      {setupStep === 'permission' && (
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-blossom-pink mt-0.5" />
            <div>
              <p className="text-sm text-charcoal">
                Allow notifications to receive gentle hydration reminders throughout the day.
                We'll respect your do-not-disturb settings ({settings.dnd_start_time} - {settings.dnd_end_time}).
              </p>
            </div>
          </div>
          
          {canRequestPermission && (
            <Button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="w-full bg-blossom-pink hover:bg-blossom-pink/80 text-charcoal"
            >
              {isLoading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          )}

          {permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                Notifications are blocked. Please enable them in your browser settings to receive reminders.
              </p>
            </div>
          )}
        </div>
      )}

      {setupStep === 'subscribe' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Permission granted!</span>
          </div>
          
          <p className="text-sm text-charcoal">
            Now let's set up push notifications so you'll receive reminders even when the app is closed.
          </p>

          {canSubscribe && (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-mint-green hover:bg-mint-green/80 text-charcoal"
            >
              {isLoading ? 'Setting up...' : 'Set Up Push Notifications'}
            </Button>
          )}
        </div>
      )}

      {setupStep === 'complete' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Push notifications are active!</span>
          </div>
          
          <p className="text-sm text-charcoal">
            You'll receive gentle reminders every {settings.interval_min} minutes during your active hours.
            DND is active from {settings.dnd_start_time} to {settings.dnd_end_time}.
          </p>

          {canUnsubscribe && (
            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              variant="ghost"
              className="w-full border border-charcoal/20 text-charcoal hover:bg-charcoal/5"
            >
              {isLoading ? 'Disabling...' : 'Disable Push Notifications'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
