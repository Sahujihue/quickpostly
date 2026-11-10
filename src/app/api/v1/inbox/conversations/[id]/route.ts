// src/app/api/v1/inbox/conversations/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await InboxRepository.getConversationById(params.id);
    if (!conversation) {
      return apiResponse.notFound(`Conversation '${params.id}' not found`);
    }
    return apiResponse.success(conversation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch conversation';
    return apiResponse.error({ message, code: 'CONVERSATION_GET_ERROR', status: 500 });
  }
}
