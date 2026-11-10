// src/app/api/v1/inbox/conversations/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { InboxRepository } from '@/lib/inbox/repository';
import { SocialPlatformId } from '@/modules/social/types';
import { InboxItemType } from '@/modules/inbox/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const platform = searchParams.get('platform') as SocialPlatformId | null;
    const type = searchParams.get('type') as InboxItemType | null;
    const status = (searchParams.get('status') || 'all') as 'all' | 'unread' | 'archived';
    const assignedToUserId = searchParams.get('assignedToUserId') || undefined;
    const searchQuery = searchParams.get('search') || undefined;

    const conversations = await InboxRepository.getConversations({
      workspaceId,
      platform: platform || undefined,
      type: type || undefined,
      status,
      assignedToUserId,
      searchQuery,
    });

    const unreadCount = conversations.filter((c) => c.isUnread && !c.isArchived).length;

    return apiResponse.success({
      conversations,
      unreadCount,
      total: conversations.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch inbox conversations';
    return apiResponse.error({ message, code: 'INBOX_FETCH_ERROR', status: 500 });
  }
}
