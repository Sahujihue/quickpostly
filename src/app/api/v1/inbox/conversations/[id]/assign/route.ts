// src/app/api/v1/inbox/conversations/[id]/assign/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { userId, userName } = body;

    if (!userId || !userName) {
      return apiResponse.badRequest('userId and userName are required to assign a conversation.');
    }

    const updated = await InboxRepository.assignConversation({
      conversationId: params.id,
      userId,
      userName,
    });

    return apiResponse.success(updated, `Conversation assigned to ${userName}.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to assign conversation';
    return apiResponse.error({ message, code: 'ASSIGN_CONVERSATION_ERROR', status: 400 });
  }
}
