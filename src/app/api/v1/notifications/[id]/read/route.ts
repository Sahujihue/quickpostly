// src/app/api/v1/notifications/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await SchedulingRepository.markNotificationRead(params.id);
    if (!success) {
      return apiResponse.notFound(`Notification '${params.id}' not found`);
    }
    return apiResponse.success({ id: params.id, isRead: true }, 'Notification marked as read.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update notification';
    return apiResponse.error({ message, code: 'NOTIFICATION_UPDATE_ERROR', status: 400 });
  }
}
