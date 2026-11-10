// src/app/api/v1/inbox/conversations/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({ isRead: true }));
    const isRead = body.isRead !== undefined ? !!body.isRead : true;

    const updated = await InboxRepository.markRead(params.id, isRead);
    return apiResponse.success(
      updated,
      isRead ? 'Marked as read.' : 'Marked as unread.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark conversation';
    return apiResponse.error({ message, code: 'MARK_READ_ERROR', status: 400 });
  }
}
