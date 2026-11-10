// src/modules/inbox/types.ts
// Official Unified Social Inbox Types & Permissions

import { SocialPlatformId } from '@/modules/social/types';

export type InboxItemType = 'COMMENT' | 'DIRECT_MESSAGE' | 'MENTION';
export type InboxSenderType = 'CUSTOMER' | 'AGENT' | 'SYSTEM' | 'NOTE';
export type InboxSentiment = 'POSITIVE' | 'LEAD' | 'QUESTION' | 'NEUTRAL' | 'NEGATIVE';

export interface InboxMessageDTO {
  id: string;
  conversationId: string;
  senderType: InboxSenderType;
  senderName: string;
  content: string;
  externalMessageId?: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface InboxConversationDTO {
  id: string;
  workspaceId: string;
  socialAccountId: string;
  platform: SocialPlatformId;
  type: InboxItemType;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  postTitle?: string;
  postPermalink?: string;
  snippet: string;
  isUnread: boolean;
  isArchived: boolean;
  sentiment: InboxSentiment;
  assignedToUserId?: string;
  assignedToName?: string;
  canReply: boolean; // Only enable message replies where official APIs permit them
  replyRestrictionReason?: string; // Reason if reply is disallowed by platform policy
  lastActivityAt: string;
  messages: InboxMessageDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface SendReplyInput {
  conversationId: string;
  content: string;
  isInternalNote?: boolean;
  senderName?: string;
}

export interface AssignConversationInput {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface InboxFilterOptions {
  workspaceId?: string;
  platform?: SocialPlatformId;
  type?: InboxItemType;
  status?: 'all' | 'unread' | 'archived';
  assignedToUserId?: string;
  searchQuery?: string;
}
