import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { notificationUtils } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Get user settings
    const settings = await db.getSettings();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'No user settings found' },
        { status: 404 }
      );
    }

    // Check if notifications should be sent
    if (!notificationUtils.shouldSendNotification(settings)) {
      const nextTime = notificationUtils.getNextNotificationTime(settings);
      return NextResponse.json({
        success: true,
        message: 'Notifications blocked by DND settings',
        blocked: true,
        nextNotificationTime: nextTime?.toISOString(),
      });
    }

    // Get today's intake logs to determine last sip time
    const todayLogs = await db.getTodayIntake();
    const lastSipTime = todayLogs.length > 0 
      ? new Date(todayLogs[todayLogs.length - 1].logged_at)
      : null;

    // Calculate if a reminder is due
    const now = new Date();
    const intervalMs = settings.interval_min * 60 * 1000;
    
    let shouldSendReminder = false;
    
    if (!lastSipTime) {
      // No sips today, send reminder
      shouldSendReminder = true;
    } else {
      // Check if enough time has passed since last sip
      const timeSinceLastSip = now.getTime() - lastSipTime.getTime();
      shouldSendReminder = timeSinceLastSip >= intervalMs;
    }

    if (!shouldSendReminder) {
      const nextReminderTime = lastSipTime 
        ? new Date(lastSipTime.getTime() + intervalMs)
        : now;
        
      return NextResponse.json({
        success: true,
        message: 'No reminder needed yet',
        shouldSend: false,
        nextReminderTime: nextReminderTime.toISOString(),
        lastSipTime: lastSipTime?.toISOString(),
      });
    }

    // Send the notification by calling our send-push endpoint
    const sendResponse = await fetch(
      new URL('/api/send-push', request.url).toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const sendResult = await sendResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Notification scheduled and sent',
      shouldSend: true,
      sendResult,
      lastSipTime: lastSipTime?.toISOString(),
      nextReminderTime: new Date(now.getTime() + intervalMs).toISOString(),
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint to check notification status without sending
  try {
    const settings = await db.getSettings();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'No user settings found' },
        { status: 404 }
      );
    }

    const todayLogs = await db.getTodayIntake();
    const lastSipTime = todayLogs.length > 0 
      ? new Date(todayLogs[todayLogs.length - 1].logged_at)
      : null;

    const now = new Date();
    const intervalMs = settings.interval_min * 60 * 1000;
    
    const shouldSendReminder = !lastSipTime || 
      (now.getTime() - lastSipTime.getTime()) >= intervalMs;

    const nextReminderTime = notificationUtils.getNextNotificationTime(
      settings,
      lastSipTime || undefined
    );

    const isDndActive = !notificationUtils.shouldSendNotification(settings);

    return NextResponse.json({
      success: true,
      status: {
        shouldSendReminder,
        isDndActive,
        lastSipTime: lastSipTime?.toISOString(),
        nextReminderTime: nextReminderTime?.toISOString(),
        intervalMinutes: settings.interval_min,
        dndSettings: {
          enabled: settings.dnd_enabled,
          startTime: settings.dnd_start_time,
          endTime: settings.dnd_end_time,
        },
      },
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
