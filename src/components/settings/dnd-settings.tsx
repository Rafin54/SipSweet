'use client';

import React, { useState } from 'react';
import { Moon, Sun, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserSettings } from '@/types/app';

interface DndSettingsProps {
  settings: UserSettings;
  onUpdate: (dndSettings: {
    dnd_enabled?: boolean;
    dnd_start_time?: string;
    dnd_end_time?: string;
  }) => Promise<boolean>;
  className?: string;
}

export function DndSettings({ settings, onUpdate, className }: DndSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleDnd = async () => {
    setIsUpdating(true);
    try {
      await onUpdate({ dnd_enabled: !settings.dnd_enabled });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeChange = async (field: 'dnd_start_time' | 'dnd_end_time', value: string) => {
    setIsUpdating(true);
    try {
      await onUpdate({ [field]: value });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTimeForInput = (timeString?: string): string => {
    if (!timeString) return '02:00';
    return timeString;
  };

  const formatTimeForDisplay = (timeString?: string): string => {
    if (!timeString) return '2:00 AM';
    
    const [hour, minute] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isDndActive = () => {
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
  };

  const dndActive = isDndActive();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-lilac-lavender bg-opacity-20">
          <Moon className="w-5 h-5 text-charcoal" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-charcoal font-heading">
            Do Not Disturb
          </h3>
          <p className="text-sm text-charcoal opacity-70 font-body">
            Pause reminders during your sleep hours
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-white bg-opacity-30 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-full transition-colors',
            settings.dnd_enabled 
              ? 'bg-mint-green bg-opacity-40' 
              : 'bg-dew-blue bg-opacity-20'
          )}>
            {settings.dnd_enabled ? (
              <Moon className="w-4 h-4 text-charcoal" />
            ) : (
              <Sun className="w-4 h-4 text-charcoal" />
            )}
          </div>
          <div>
            <div className="font-medium text-charcoal">
              {settings.dnd_enabled ? 'Enabled' : 'Disabled'}
            </div>
            {dndActive && settings.dnd_enabled && (
              <div className="text-xs text-charcoal opacity-60">
                Currently active
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleDnd}
          disabled={isUpdating}
          className={cn(
            'px-4 py-2 rounded-full transition-all',
            settings.dnd_enabled
              ? 'bg-mint-green bg-opacity-20 text-charcoal'
              : 'bg-dew-blue bg-opacity-20 text-charcoal'
          )}
        >
          {settings.dnd_enabled ? 'Turn Off' : 'Turn On'}
        </Button>
      </div>

      {/* Time Settings */}
      {settings.dnd_enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal opacity-70">
                Sleep Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForInput(settings.dnd_start_time)}
                  onChange={(e) => handleTimeChange('dnd_start_time', e.target.value)}
                  disabled={isUpdating}
                  className={cn(
                    'w-full px-3 py-2 rounded-xl border border-blossom-pink border-opacity-20',
                    'bg-white bg-opacity-50 text-charcoal font-body',
                    'focus:outline-none focus:ring-2 focus:ring-blossom-pink focus:ring-opacity-50',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal opacity-40 pointer-events-none" />
              </div>
              <div className="text-xs text-charcoal opacity-60">
                {formatTimeForDisplay(settings.dnd_start_time)}
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal opacity-70">
                Wake Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formatTimeForInput(settings.dnd_end_time)}
                  onChange={(e) => handleTimeChange('dnd_end_time', e.target.value)}
                  disabled={isUpdating}
                  className={cn(
                    'w-full px-3 py-2 rounded-xl border border-blossom-pink border-opacity-20',
                    'bg-white bg-opacity-50 text-charcoal font-body',
                    'focus:outline-none focus:ring-2 focus:ring-blossom-pink focus:ring-opacity-50',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal opacity-40 pointer-events-none" />
              </div>
              <div className="text-xs text-charcoal opacity-60">
                {formatTimeForDisplay(settings.dnd_end_time)}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-3 bg-mint-green bg-opacity-20 rounded-xl">
            <div className="text-sm text-charcoal font-body">
              <span className="font-medium">Quiet hours:</span>{' '}
              {formatTimeForDisplay(settings.dnd_start_time)} to{' '}
              {formatTimeForDisplay(settings.dnd_end_time)}
            </div>
            <div className="text-xs text-charcoal opacity-70 mt-1">
              You won't receive hydration reminders during this time
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
