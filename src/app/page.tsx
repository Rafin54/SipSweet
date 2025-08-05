'use client';

import React, { useState } from 'react';
import { Settings, Bell, BellOff } from 'lucide-react';
import { Greeting } from '@/components/dashboard/greeting';
import { ProgressDisplay } from '@/components/dashboard/progress-display';
import { SipButton } from '@/components/dashboard/sip-button';
import { Button } from '@/components/ui/button';
import { DndSettings } from '@/components/settings/dnd-settings';
import { PushNotificationSetup } from '@/components/notifications/push-notification-setup';

import { useHydration } from '@/hooks/use-hydration';
import { useSettings } from '@/hooks/use-settings';
import { useNotifications } from '@/hooks/use-notifications';
import { formatUtils } from '@/lib/utils';

export default function Dashboard() {
  const { settings, isLoading: settingsLoading, getFlowerEmoji, isDndActive, getDndStatusMessage, updateDndSettings } = useSettings();
  const {
    todayProgress,
    logIntake,
    getLastSipTime,
    isLoading: hydrationLoading
  } = useHydration(settings.daily_goal_ml);
  const {
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    canSubscribe,
    isLoading: notificationLoading
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);

  const handleSip = async (amount: number): Promise<boolean> => {
    const success = await logIntake(amount);
    if (success) {
      console.log(`Logged ${amount}ml successfully!`);
    }
    return success;
  };

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
  };

  const isLoading = settingsLoading || hydrationLoading;
  const lastSipTime = getLastSipTime();
  const flowerEmoji = getFlowerEmoji();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blossom-pink via-lilac-lavender to-mint-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌸</div>
          <div className="text-charcoal font-body">Loading your garden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blossom-pink via-lilac-lavender to-mint-green">
      <header className="flex justify-between items-center p-4 pt-8">
        <div className="w-10" />
        <div className="text-center">
          <div className="text-sm text-charcoal opacity-70 font-body">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationToggle}
            disabled={notificationLoading || !canSubscribe}
            className="w-10 h-10 p-0"
          >
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 p-0"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 pb-8 space-y-8">
        <Greeting
          nickname={settings.nickname}
          flowerEmoji={flowerEmoji}
          className="mt-4"
        />

        <ProgressDisplay
          progress={todayProgress}
          settings={settings}
          lastSipTime={lastSipTime}
        />

        <div className="flex justify-center">
          <SipButton
            onSip={handleSip}
            flowerType={settings.flower_type}
            disabled={isLoading}
          />
        </div>

        {/* Quick Stats & DND Status */}
        <div className="text-center space-y-2">
          {getDndStatusMessage() ? (
            <div className="text-sm text-charcoal opacity-70 font-body bg-lilac-lavender bg-opacity-20 rounded-full px-4 py-2 inline-block">
              🌙 {getDndStatusMessage()}
            </div>
          ) : (
            <div className="text-sm text-charcoal opacity-70 font-body">
              Next reminder in {formatUtils.formatInterval(settings.interval_min)}
            </div>
          )}
        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-charcoal font-heading">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <DndSettings
                settings={settings}
                onUpdate={updateDndSettings}
              />

              <PushNotificationSetup />

              <div className="pt-4 border-t border-blossom-pink border-opacity-20">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="w-full"
                  variant="primary"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
