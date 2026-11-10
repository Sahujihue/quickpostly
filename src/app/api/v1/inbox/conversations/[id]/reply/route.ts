// src/app/api/v1/inbox/conversations/[id]/reply/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { content, isInternalNote, senderName } = body;

    if (!content || !content.trim()) {
      return apiResponse.badRequest('Message content is required.');
    }

    const newMessage = await InboxRepository.sendReply({
      conversationId: params.id,
      content,
      isInternalNote: !!isInternalNote,
      senderName,
    });

    return apiResponse.success(
      newMessage,
      isInternalNote ? 'Internal note added to conversation.' : 'Reply sent successfully via official platform API.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send reply';
    return apiResponse.error({
      message,
      code: 'REPLY_DISALLOWED_BY_PLATFORM_POLICY',
      status: 400,
    });
  }
}
