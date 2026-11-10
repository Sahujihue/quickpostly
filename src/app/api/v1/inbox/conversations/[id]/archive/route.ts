// src/app/api/v1/inbox/conversations/[id]/archive/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await InboxRepository.toggleArchive(params.id);
    return apiResponse.success(
      updated,
      updated.isArchived ? 'Conversation archived.' : 'Conversation moved back to active inbox.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to archive conversation';
    return apiResponse.error({ message, code: 'ARCHIVE_CONVERSATION_ERROR', status: 400 });
  }
}
