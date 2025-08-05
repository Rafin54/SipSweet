'use client';

import React from 'react';
import { Trophy, Target, Clock } from 'lucide-react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { cn, formatUtils, dateUtils, notificationUtils } from '@/lib/utils';
import type { DailyProgress, UserSettings } from '@/types/app';

interface ProgressDisplayProps {
  progress: DailyProgress;
  settings: UserSettings;
  lastSipTime?: Date | null;
  className?: string;
}

export function ProgressDisplay({ 
  progress, 
  settings, 
  lastSipTime,
  className 
}: ProgressDisplayProps) {
  const isGoalReached = progress.percentage >= 100;
  const remainingAmount = Math.max(0, progress.goal_ml - progress.total_ml);
  
  const getNextReminderTime = () => {
    if (!lastSipTime) return null;
    // Use the notification utils to properly calculate next reminder time considering DND
    return notificationUtils.getNextNotificationTime(settings, lastSipTime);
  };

  const getTimeSinceLastSip = () => {
    if (!lastSipTime) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastSipTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}m ago` : `${diffHours}h ago`;
    }
  };

  const nextReminderTime = getNextReminderTime();
  const timeSinceLastSip = getTimeSinceLastSip();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Progress Ring */}
      <div className="flex justify-center">
        <ProgressRing
          percentage={progress.percentage}
          size={240}
          strokeWidth={12}
          petals={8}
          flowerType={settings.flower_type}
          showPercentage={false}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal font-heading">
              {formatUtils.formatVolume(progress.total_ml)}
            </div>
            <div className="text-sm text-charcoal opacity-70 font-body">
              of {formatUtils.formatVolume(progress.goal_ml)}
            </div>
            {isGoalReached && (
              <div className="flex items-center justify-center mt-2">
                <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="text-sm font-medium text-charcoal">Goal reached!</span>
              </div>
            )}
          </div>
        </ProgressRing>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Progress Card */}
        <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl p-4 border border-blossom-pink border-opacity-20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-charcoal opacity-70" />
            <span className="text-sm font-medium text-charcoal opacity-70">Progress</span>
          </div>
          <div className="text-2xl font-bold text-charcoal font-heading">
            {formatUtils.formatPercentage(progress.percentage)}
          </div>
          {!isGoalReached && (
            <div className="text-xs text-charcoal opacity-60 mt-1">
              {formatUtils.formatVolume(remainingAmount)} to go
            </div>
          )}
        </div>

        {/* Sips Today Card */}
        <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl p-4 border border-blossom-pink border-opacity-20">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 text-charcoal opacity-70">💧</div>
            <span className="text-sm font-medium text-charcoal opacity-70">Sips Today</span>
          </div>
          <div className="text-2xl font-bold text-charcoal font-heading">
            {progress.logs.length}
          </div>
          {progress.logs.length > 0 && (
            <div className="text-xs text-charcoal opacity-60 mt-1">
              Avg: {formatUtils.formatVolume(Math.round(progress.total_ml / progress.logs.length))}
            </div>
          )}
        </div>
      </div>

      {/* Last Sip & Next Reminder */}
      {(timeSinceLastSip || nextReminderTime) && (
        <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border border-blossom-pink border-opacity-20">
          <div className="space-y-2">
            {timeSinceLastSip && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal opacity-70">Last sip:</span>
                <span className="text-sm font-medium text-charcoal">{timeSinceLastSip}</span>
              </div>
            )}
            
            {nextReminderTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-charcoal opacity-70" />
                  <span className="text-sm text-charcoal opacity-70">Next reminder:</span>
                </div>
                <span className="text-sm font-medium text-charcoal">
                  {dateUtils.formatTime(nextReminderTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration Message */}
      {isGoalReached && (
        <div className="text-center p-4 bg-gradient-to-r from-mint-green to-blossom-pink rounded-2xl">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-lg font-semibold text-charcoal font-heading mb-1">
            Wonderful, {settings.nickname}!
          </div>
          <div className="text-sm text-charcoal opacity-80 font-body">
            You've reached your hydration goal for today. Your inner garden is blooming! 🌸
          </div>
        </div>
      )}
    </div>
  );
}
