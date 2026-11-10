// src/app/(dashboard)/dashboard/inbox/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Inbox,
  MessageSquare,
  Send,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
  Filter,
  Check,
  Archive,
  Search,
  User,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Lock,
  RefreshCw,
  Plus,
  StickyNote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import {
  InboxConversationDTO,
  InboxItemType,
  InboxSentiment,
} from '@/modules/inbox/types';
import { SocialPlatformId } from '@/modules/social/types';
import { SOCIAL_PLATFORMS_CATALOG } from '@/modules/social/platforms';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

const TEAM_MEMBERS = [
  { id: 'usr_super_admin_seed', name: 'Alex Thorne' },
  { id: 'usr_sarah', name: 'Sarah Miller' },
  { id: 'usr_david', name: 'David Vance' },
];

const QUICK_TEMPLATES = [
  'Thanks for reaching out! We will look into this right away.',
  'Great question! You can review our full case study at socialhive.app/case-studies.',
  'Thanks for the kind words! Appreciate you being part of our journey.',
  'Could you share your workspace ID or registered email so our team can assist?',
];

function UnifiedSocialInboxContent() {
  const [conversations, setConversations] = useState<InboxConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<InboxConversationDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Reply Composer
  const [replyMode, setReplyMode] = useState<'REPLY' | 'NOTE'>('REPLY');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter, platformFilter, typeFilter]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ workspaceId: 'ws_peak_scale', status: statusFilter });
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/v1/inbox/conversations?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setConversations(data.data.conversations || []);
        if (data.data.conversations?.length > 0) {
          const currentId = selectedConversation?.id;
          const match = data.data.conversations.find((c: InboxConversationDTO) => c.id === currentId);
          setSelectedConversation(match || data.data.conversations[0]);
        } else {
          setSelectedConversation(null);
        }
      }
    } catch (err) {
      console.error('Failed to load inbox conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (conv: InboxConversationDTO) => {
    setSelectedConversation(conv);
    setErrorMessage(null);
    setReplyText('');
    if (conv.isUnread) {
      fetch(`/api/v1/inbox/conversations/${conv.id}/read`, { method: 'PUT' });
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, isUnread: false } : c))
      );
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/inbox/conversations/${selectedConversation.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText.trim(),
          isInternalNote: replyMode === 'NOTE',
          senderName: 'SocialHive Agent',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        // Reload conversation thread
        const updatedRes = await fetch(`/api/v1/inbox/conversations/${selectedConversation.id}`).then((r) => r.json());
        if (updatedRes.success) {
          setSelectedConversation(updatedRes.data);
          setConversations((prev) =>
            prev.map((c) => (c.id === updatedRes.data.id ? updatedRes.data : c))
          );
        }
      } else {
        setErrorMessage(data.error?.message || 'Failed to send reply');
      }
    } catch {
      setErrorMessage('A network error occurred while sending.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAssign = async (userId: string, userName: string) => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/v1/inbox/conversations/${selectedConversation.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedConversation(data.data);
        setConversations((prev) =>
          prev.map((c) => (c.id === data.data.id ? data.data : c))
        );
      }
    } catch {
      alert('Failed to assign conversation');
    }
  };

  const handleToggleArchive = async () => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/v1/inbox/conversations/${selectedConversation.id}/archive`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        fetchConversations();
      }
    } catch {
      alert('Failed to toggle archive');
    }
  };

  const renderSentimentBadge = (sentiment: InboxSentiment) => {
    switch (sentiment) {
      case 'LEAD':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Lead</span>;
      case 'QUESTION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Question</span>;
      case 'POSITIVE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Positive</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">Neutral</span>;
    }
  };

  const unreadTotal = conversations.filter((c) => c.isUnread && !c.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Cross-Platform Communication
            </span>
            <span className="text-xs text-slate-500 font-mono">Part 10 Social Inbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unified Social Inbox
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage customer conversations, post comments, and DMs across Instagram, LinkedIn, X, TikTok, and YouTube in a single collaboration hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <button
            type="button"
            onClick={fetchConversations}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Pane: Conversation List (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search sender, message, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>Unread</span>
              {unreadTotal > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadTotal}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'archived' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Archived
            </button>

            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden"
            >
              <option value="all">All Channels</option>
              {SOCIAL_PLATFORMS_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conversations List */}
          <div className="grow overflow-y-auto space-y-2 pr-1 max-h-[520px]">
            {isLoading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Syncing inbox...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                No conversations match your filter.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm'
                        : conv.isUnread
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700 font-semibold'
                        : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {conv.authorName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-white truncate block">
                            {conv.authorName}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {conv.authorHandle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderSentimentBadge(conv.sentiment)}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                          <SocialPlatformIcon platform={conv.platform} size="sm" showBackground={false} className="w-2.5 h-2.5" />
                          <span>{conv.platform}</span>
                        </span>
                        {conv.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {conv.snippet}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span className="capitalize">{conv.type.toLowerCase().replace('_', ' ')}</span>
                      <span>
                        {new Date(conv.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation Thread & Reply Composer (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          {!selectedConversation ? (
            <div className="grow flex flex-col items-center justify-center text-center py-24 text-slate-500">
              <Inbox className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-white">Select a conversation</h3>
              <p className="text-xs text-slate-500 mt-1">Choose a message or comment from the left pane to reply.</p>
            </div>
          ) : (
            <>
              {/* Conversation Top Header */}
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {selectedConversation.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">{selectedConversation.authorName}</h2>
                      <span className="text-xs text-slate-400 font-mono">{selectedConversation.authorHandle}</span>
                    </div>
                    {selectedConversation.postTitle && (
                      <div className="text-[11px] text-indigo-400 flex items-center gap-1 mt-0.5">
                        <span className="truncate max-w-sm">Re: {selectedConversation.postTitle}</span>
                        {selectedConversation.postPermalink && (
                          <a
                            href={selectedConversation.postPermalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Assignment & Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.assignedToUserId || ''}
                    onChange={(e) => {
                      const member = TEAM_MEMBERS.find((m) => m.id === e.target.value);
                      if (member) handleAssign(member.id, member.name);
                    }}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-hidden"
                  >
                    <option value="">Assign To...</option>
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleToggleArchive}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={selectedConversation.isArchived ? 'Move to Inbox' : 'Archive'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Thread Bubbles */}
              <div className="grow overflow-y-auto space-y-3.5 pr-2 max-h-[380px]">
                {selectedConversation.messages.map((msg) => {
                  const isCustomer = msg.senderType === 'CUSTOMER';
                  const isNote = msg.isInternalNote || msg.senderType === 'NOTE';
                  const isSystem = msg.senderType === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2 text-[10px] text-slate-500 font-mono">
                        {msg.content} &bull; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    );
                  }

                  if (isNote) {
                    return (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1 my-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <StickyNote className="w-3 h-3" />
                            Internal Team Note ({msg.senderName})
                          </span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[10px] text-slate-500 mb-1 px-1">
                        {msg.senderName} &bull; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                          isCustomer
                            ? 'bg-slate-950 border border-slate-800 text-slate-200'
                            : 'bg-indigo-600 text-white shadow-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official API Reply Restriction Banner (When canReply is false) */}
              {!selectedConversation.canReply && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Official API Restriction: </span>
                    {selectedConversation.replyRestrictionReason ||
                      'Replies are not supported on this conversation by official platform API policy.'}
                  </div>
                </div>
              )}

              {/* Reply Mode Selector & Quick Templates */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      disabled={!selectedConversation.canReply}
                      onClick={() => setReplyMode('REPLY')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        replyMode === 'REPLY'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white disabled:opacity-40'
                      }`}
                    >
                      Direct Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyMode('NOTE')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        replyMode === 'NOTE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <StickyNote className="w-3 h-3" />
                      <span>Internal Note</span>
                    </button>
                  </div>

                  {replyMode === 'REPLY' && selectedConversation.canReply && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) setReplyText(e.target.value);
                      }}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-hidden"
                    >
                      <option value="">Quick Templates...</option>
                      {QUICK_TEMPLATES.map((tmpl, idx) => (
                        <option key={idx} value={tmpl}>
                          {tmpl.slice(0, 35)}...
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Textarea Input */}
                <div className="relative">
                  <textarea
                    rows={3}
                    disabled={replyMode === 'REPLY' && !selectedConversation.canReply}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyMode === 'NOTE'
                        ? 'Type an internal team note (only visible to your agency)...'
                        : selectedConversation.canReply
                        ? `Reply as SocialHive to ${selectedConversation.authorName}...`
                        : 'Replies disabled by official platform API window.'
                    }
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors resize-none disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim() || (replyMode === 'REPLY' && !selectedConversation.canReply)}
                    className={`absolute right-3 bottom-3 px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 ${
                      replyMode === 'NOTE' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    {isSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{replyMode === 'NOTE' ? 'Save Note' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnifiedSocialInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social inbox...</p>
        </div>
      }
    >
      <UnifiedSocialInboxContent />
    </Suspense>
  );
}
