import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { db } from '@/lib/supabase';
import { notificationUtils, dndUtils } from '@/lib/utils';
import type { UserSettings } from '@/types/app';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:emsohel@users.noreply.github.com', // Your GitHub email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user settings to check DND and personalization
    const settings = await db.getSettings();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'No user settings found' },
        { status: 404 }
      );
    }

    // Check if we should send notification based on DND settings
    if (!notificationUtils.shouldSendNotification(settings)) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Notification blocked by do-not-disturb settings',
          blocked: true 
        },
        { status: 200 }
      );
    }

    // Get all active push subscriptions
    const subscriptions = await db.getActivePushSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found' },
        { status: 404 }
      );
    }

    // Generate personalized notification message
    const { title, body } = notificationUtils.generateMessage(
      settings.nickname,
      settings.flower_type
    );

    const flowerEmoji = notificationUtils.getFlowerEmoji(settings.flower_type);

    // Prepare notification payload
    const payload = JSON.stringify({
      title: `${title} ${flowerEmoji}`,
      body,
      data: {
        nickname: settings.nickname,
        flower_emoji: flowerEmoji,
        timestamp: new Date().toISOString(),
        url: '/',
      },
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );
        return { success: true, endpoint: subscription.endpoint };
      } catch (error: any) {
        // If subscription is invalid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.deactivatePushSubscription(subscription.endpoint);
        }
        return { 
          success: false, 
          endpoint: subscription.endpoint, 
          error: error.message 
        };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results: {
        total: subscriptions.length,
        successful,
        failed,
        details: results,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET() {
  return POST(new NextRequest('http://localhost:3000/api/send-push', {
    method: 'POST',
  }));
}
