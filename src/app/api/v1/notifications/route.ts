// src/app/api/v1/notifications/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';
import { PostScheduler } from '@/lib/queue/scheduler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const notifications = await SchedulingRepository.getNotifications(workspaceId, limit);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return apiResponse.success({
      notifications,
      unreadCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return apiResponse.error({ message, code: 'NOTIFICATIONS_FETCH_ERROR', status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workspaceId } = body;

    if (action === 'MARK_ALL_READ') {
      await SchedulingRepository.markAllNotificationsRead(workspaceId || 'ws_peak_scale');
      return apiResponse.success({ markedAllRead: true }, 'All notifications marked as read.');
    }

    if (action === 'CHECK_UPCOMING') {
      const result = await PostScheduler.checkUpcomingPostsAndExpirations(workspaceId || 'ws_peak_scale');
      return apiResponse.success(result, 'Upcoming check completed.');
    }

    return apiResponse.badRequest('Invalid action.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Notification action failed';
    return apiResponse.error({ message, code: 'NOTIFICATION_ACTION_ERROR', status: 400 });
  }
}
