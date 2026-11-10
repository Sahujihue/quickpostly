// src/lib/inbox/repository.ts
// Unified Social Inbox Repository with Official API Reply Enforcement & Team Collaboration

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  InboxConversationDTO,
  InboxMessageDTO,
  SendReplyInput,
  AssignConversationInput,
  InboxFilterOptions,
} from '@/modules/inbox/types';

interface InboxStoreData {
  conversations: InboxConversationDTO[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'inbox_store.json');

const now = Date.now();
const oneHour = 3600 * 1000;

const INITIAL_CONVERSATIONS: InboxConversationDTO[] = [
  {
    id: 'conv_ig_lead',
    workspaceId: 'ws_peak_scale',
    socialAccountId: 'acc_instagram_peak',
    platform: 'instagram',
    type: 'COMMENT',
    authorName: 'Marcus Sterling',
    authorHandle: '@marcus.sterling',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    postTitle: 'Consistency beats intensity in organic B2B audience building...',
    postPermalink: 'https://www.instagram.com/p/C9wK81xM9pL/',
    snippet: 'Do you have case studies for B2B cybersecurity startups? Looking to implement this for our 40-person team.',
    isUnread: true,
    isArchived: false,
    sentiment: 'LEAD',
    assignedToUserId: 'usr_sarah',
    assignedToName: 'Sarah Miller',
    canReply: true,
    lastActivityAt: new Date(now - 35 * 60000).toISOString(),
    messages: [
      {
        id: 'msg_ig_1',
        conversationId: 'conv_ig_lead',
        senderType: 'CUSTOMER',
        senderName: 'Marcus Sterling',
        content: 'Do you have case studies for B2B cybersecurity startups? Looking to implement this for our 40-person team.',
        isInternalNote: false,
        createdAt: new Date(now - 35 * 60000).toISOString(),
      },
    ],
    createdAt: new Date(now - 35 * 60000).toISOString(),
    updatedAt: new Date(now - 35 * 60000).toISOString(),
  },
  {
    id: 'conv_li_question',
    workspaceId: 'ws_peak_scale',
    socialAccountId: 'acc_linkedin_peak',
    platform: 'linkedin',
    type: 'COMMENT',
    authorName: 'Elena Rostova',
    authorHandle: 'elena-rostova-growth',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
    postTitle: 'Proud to announce our agency surpassed 100M organic impressions...',
    postPermalink: 'https://www.linkedin.com/feed/update/urn:li:share:99182748102',
    snippet: 'Incredible milestone! What was the single biggest contributor to that retention lift?',
    isUnread: true,
    isArchived: false,
    sentiment: 'QUESTION',
    assignedToUserId: 'usr_super_admin_seed',
    assignedToName: 'Alex Thorne',
    canReply: true,
    lastActivityAt: new Date(now - 2 * oneHour).toISOString(),
    messages: [
      {
        id: 'msg_li_1',
        conversationId: 'conv_li_question',
        senderType: 'CUSTOMER',
        senderName: 'Elena Rostova',
        content: 'Incredible milestone! What was the single biggest contributor to that retention lift?',
        isInternalNote: false,
        createdAt: new Date(now - 2 * oneHour).toISOString(),
      },
    ],
    createdAt: new Date(now - 2 * oneHour).toISOString(),
    updatedAt: new Date(now - 2 * oneHour).toISOString(),
  },
  {
    id: 'conv_fb_expired_window',
    workspaceId: 'ws_peak_scale',
    socialAccountId: 'acc_facebook_peak',
    platform: 'facebook',
    type: 'DIRECT_MESSAGE',
    authorName: 'David Kim',
    authorHandle: '@davidkim91',
    snippet: 'Hi, I sent an email to support 3 days ago regarding workspace team seats upgrade.',
    isUnread: false,
    isArchived: false,
    sentiment: 'QUESTION',
    canReply: false,
    replyRestrictionReason:
      'Meta Graph API 24-hour customer care messaging window has expired. The customer must send an inbound message to reopen direct communication.',
    lastActivityAt: new Date(now - 48 * oneHour).toISOString(),
    messages: [
      {
        id: 'msg_fb_1',
        conversationId: 'conv_fb_expired_window',
        senderType: 'CUSTOMER',
        senderName: 'David Kim',
        content: 'Hi, I sent an email to support 3 days ago regarding workspace team seats upgrade.',
        isInternalNote: false,
        createdAt: new Date(now - 48 * oneHour).toISOString(),
      },
      {
        id: 'msg_fb_note_1',
        conversationId: 'conv_fb_expired_window',
        senderType: 'NOTE',
        senderName: 'Sarah Miller',
        content: 'Internal note: Reached out via Zendesk ticket #4810 to avoid Meta 24h restriction.',
        isInternalNote: true,
        createdAt: new Date(now - 47 * oneHour).toISOString(),
      },
    ],
    createdAt: new Date(now - 48 * oneHour).toISOString(),
    updatedAt: new Date(now - 47 * oneHour).toISOString(),
  },
  {
    id: 'conv_tw_mention',
    workspaceId: 'ws_peak_scale',
    socialAccountId: 'acc_twitter_peak',
    platform: 'twitter',
    type: 'MENTION',
    authorName: 'Devon Hayes',
    authorHandle: '@devonhayes_tech',
    snippet: 'Hey @socialhivehq does your scheduler support BullMQ queue monitoring with custom retry backoffs?',
    isUnread: false,
    isArchived: false,
    sentiment: 'QUESTION',
    canReply: true,
    lastActivityAt: new Date(now - 4 * oneHour).toISOString(),
    messages: [
      {
        id: 'msg_tw_1',
        conversationId: 'conv_tw_mention',
        senderType: 'CUSTOMER',
        senderName: 'Devon Hayes',
        content: 'Hey @socialhivehq does your scheduler support BullMQ queue monitoring with custom retry backoffs?',
        isInternalNote: false,
        createdAt: new Date(now - 4 * oneHour).toISOString(),
      },
      {
        id: 'msg_tw_2',
        conversationId: 'conv_tw_mention',
        senderType: 'AGENT',
        senderName: 'SocialHive Support',
        content: 'Yes! All delayed jobs include 3 automatic exponential retries and live telemetry reporting.',
        isInternalNote: false,
        createdAt: new Date(now - 3 * oneHour).toISOString(),
      },
    ],
    createdAt: new Date(now - 4 * oneHour).toISOString(),
    updatedAt: new Date(now - 3 * oneHour).toISOString(),
  },
  {
    id: 'conv_yt_positive',
    workspaceId: 'ws_peak_scale',
    socialAccountId: 'acc_youtube_peak',
    platform: 'youtube',
    type: 'COMMENT',
    authorName: 'DevStudio Pro',
    authorHandle: '@devstudiopro',
    postTitle: 'Automating Social Distribution Across 8 Channels',
    snippet: 'Great walkthrough! Subscribed. Can we trigger custom webhooks when posts publish?',
    isUnread: true,
    isArchived: false,
    sentiment: 'POSITIVE',
    canReply: true,
    lastActivityAt: new Date(now - 8 * oneHour).toISOString(),
    messages: [
      {
        id: 'msg_yt_1',
        conversationId: 'conv_yt_positive',
        senderType: 'CUSTOMER',
        senderName: 'DevStudio Pro',
        content: 'Great walkthrough! Subscribed. Can we trigger custom webhooks when posts publish?',
        isInternalNote: false,
        createdAt: new Date(now - 8 * oneHour).toISOString(),
      },
    ],
    createdAt: new Date(now - 8 * oneHour).toISOString(),
    updatedAt: new Date(now - 8 * oneHour).toISOString(),
  },
];

export class InboxRepository {
  private static ensureStore(): InboxStoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      if (!fs.existsSync(STORE_FILE)) {
        const initial: InboxStoreData = { conversations: INITIAL_CONVERSATIONS };
        fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    } catch {
      return { conversations: INITIAL_CONVERSATIONS };
    }
  }

  private static saveStore(data: InboxStoreData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save inbox store', err);
    }
  }

  public static async getConversations(filter: InboxFilterOptions = {}): Promise<InboxConversationDTO[]> {
    const store = this.ensureStore();
    let convs = [...store.conversations];

    if (filter.workspaceId) {
      convs = convs.filter((c) => c.workspaceId === filter.workspaceId);
    }
    if (filter.platform) {
      convs = convs.filter((c) => c.platform === filter.platform);
    }
    if (filter.type) {
      convs = convs.filter((c) => c.type === filter.type);
    }
    if (filter.status === 'unread') {
      convs = convs.filter((c) => c.isUnread && !c.isArchived);
    } else if (filter.status === 'archived') {
      convs = convs.filter((c) => c.isArchived);
    } else {
      convs = convs.filter((c) => !c.isArchived);
    }
    if (filter.assignedToUserId) {
      convs = convs.filter((c) => c.assignedToUserId === filter.assignedToUserId);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      convs = convs.filter(
        (c) =>
          c.authorName.toLowerCase().includes(q) ||
          c.authorHandle.toLowerCase().includes(q) ||
          c.snippet.toLowerCase().includes(q) ||
          (c.postTitle && c.postTitle.toLowerCase().includes(q))
      );
    }

    return convs.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  }

  public static async getConversationById(id: string): Promise<InboxConversationDTO | null> {
    const store = this.ensureStore();
    return store.conversations.find((c) => c.id === id) || null;
  }

  public static async sendReply(input: SendReplyInput): Promise<InboxMessageDTO> {
    const store = this.ensureStore();
    const conv = store.conversations.find((c) => c.id === input.conversationId);
    if (!conv) {
      throw new Error(`Conversation '${input.conversationId}' not found.`);
    }

    // CRITICAL OFFICIAL API RESTRICTION CHECK
    if (!input.isInternalNote && !conv.canReply) {
      throw new Error(
        conv.replyRestrictionReason || 'Replies are not permitted on this conversation by official platform API policy.'
      );
    }

    const newMsg: InboxMessageDTO = {
      id: `msg_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      conversationId: input.conversationId,
      senderType: input.isInternalNote ? 'NOTE' : 'AGENT',
      senderName: input.senderName || (input.isInternalNote ? 'Team Member' : 'SocialHive Support'),
      content: input.content,
      isInternalNote: !!input.isInternalNote,
      createdAt: new Date().toISOString(),
    };

    conv.messages.push(newMsg);
    conv.lastActivityAt = newMsg.createdAt;
    conv.isUnread = false;
    conv.updatedAt = newMsg.createdAt;

    this.saveStore(store);
    return newMsg;
  }

  public static async assignConversation(input: AssignConversationInput): Promise<InboxConversationDTO> {
    const store = this.ensureStore();
    const conv = store.conversations.find((c) => c.id === input.conversationId);
    if (!conv) throw new Error(`Conversation '${input.conversationId}' not found.`);

    conv.assignedToUserId = input.userId;
    conv.assignedToName = input.userName;
    conv.updatedAt = new Date().toISOString();

    // Add internal system log message
    conv.messages.push({
      id: `msg_sys_${Date.now()}`,
      conversationId: conv.id,
      senderType: 'SYSTEM',
      senderName: 'System',
      content: `Conversation assigned to ${input.userName}.`,
      isInternalNote: true,
      createdAt: new Date().toISOString(),
    });

    this.saveStore(store);
    return conv;
  }

  public static async toggleArchive(id: string): Promise<InboxConversationDTO> {
    const store = this.ensureStore();
    const conv = store.conversations.find((c) => c.id === id);
    if (!conv) throw new Error(`Conversation '${id}' not found.`);

    conv.isArchived = !conv.isArchived;
    conv.updatedAt = new Date().toISOString();

    this.saveStore(store);
    return conv;
  }

  public static async markRead(id: string, isRead = true): Promise<InboxConversationDTO> {
    const store = this.ensureStore();
    const conv = store.conversations.find((c) => c.id === id);
    if (!conv) throw new Error(`Conversation '${id}' not found.`);

    conv.isUnread = !isRead;
    conv.updatedAt = new Date().toISOString();

    this.saveStore(store);
    return conv;
  }
}
