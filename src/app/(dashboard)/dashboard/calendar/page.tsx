// src/app/(dashboard)/dashboard/calendar/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  Layers,
  Repeat,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Eye,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PostCreatorModal } from '@/components/dashboard/post-creator-modal';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import {
  ScheduledPostDTO,
  CalendarViewMode,
  PostPublishStatus,
  ContentCategoryDTO,
} from '@/modules/scheduling/types';
import { SocialPlatformId } from '@/modules/social/types';
import { SOCIAL_PLATFORMS_CATALOG } from '@/modules/social/platforms';

function ContentCalendarContent() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [posts, setPosts] = useState<ScheduledPostDTO[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPostDTO | null>(null);
  const [isExecutingNow, setIsExecutingNow] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedPlatform, selectedCategory, selectedStatus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ workspaceId: 'ws_peak_scale' });
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const [postsRes, catRes] = await Promise.all([
        fetch(`/api/v1/posts?${params.toString()}`).then((r) => r.json()),
        fetch('/api/v1/posts/categories').then((r) => r.json()),
      ]);

      if (postsRes.success) setPosts(postsRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load calendar data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Date Navigation Helpers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'weekly') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'weekly') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title
  const getHeaderTitle = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    if (viewMode === 'monthly') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'weekly') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${monthNames[weekStart.getMonth()].slice(0, 3)} ${weekStart.getDate()} – ${monthNames[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  };

  // Post Actions
  const handlePublishNow = async (postId: string) => {
    setIsExecutingNow(true);
    setModalFeedback(null);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/publish-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setModalFeedback('Post published and confirmed by social platforms!');
        setSelectedPost(data.data);
        fetchData();
      } else {
        setModalFeedback(`Publishing failed: ${data.error?.message}`);
      }
    } catch {
      setModalFeedback('An unexpected network error occurred.');
    } finally {
      setIsExecutingNow(false);
    }
  };

  const handleReschedule = async (postId: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      setModalFeedback('Please select both date and time to reschedule.');
      return;
    }
    try {
      const combined = new Date(`${rescheduleDate}T${rescheduleTime}:00Z`).toISOString();
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: combined, status: 'SCHEDULED' }),
      });
      const data = await res.json();
      if (data.success) {
        setModalFeedback(`Rescheduled for ${new Date(combined).toLocaleString()}`);
        setSelectedPost(data.data);
        fetchData();
      }
    } catch {
      setModalFeedback('Failed to reschedule post.');
    }
  };

  const handleCancelPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(null);
        fetchData();
      }
    } catch {
      alert('Failed to cancel post');
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: PostPublishStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="emerald" size="sm">Published</Badge>;
      case 'SCHEDULED':
        return <Badge variant="indigo" size="sm">Scheduled</Badge>;
      case 'PROCESSING':
        return <Badge variant="amber" size="sm">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="rose" size="sm">Failed</Badge>;
      case 'DRAFT':
        return <Badge variant="slate" size="sm">Draft</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  // Filtered Posts
  const getPostsForDate = (dateStr: string) => {
    return posts.filter((p) => {
      if (!p.scheduledAt) return false;
      return p.scheduledAt.startsWith(dateStr);
    });
  };

  // Monthly Grid Generation
  const renderMonthlyGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push(d);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}

        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-28 rounded-2xl bg-slate-950/20 border border-slate-900/60 p-2" />;
          }

          const currentCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayPosts = getPostsForDate(currentCellDate);
          const isToday = currentCellDate === todayStr;

          return (
            <div
              key={day}
              className={`min-h-28 rounded-2xl p-2.5 border transition-all flex flex-col justify-between ${
                isToday
                  ? 'bg-indigo-950/20 border-indigo-500/40 shadow-xs'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>

                {dayPosts.length > 0 && (
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                    {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 grow overflow-y-auto max-h-24">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      if (post.scheduledAt) {
                        const [d, t] = post.scheduledAt.split('T');
                        setRescheduleDate(d);
                        setRescheduleTime(t?.slice(0, 5) || '14:30');
                      }
                      setModalFeedback(null);
                    }}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all text-left shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-300">
                        {post.scheduledAt ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Draft'}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            post.status === 'PUBLISHED'
                              ? '#10b981'
                              : post.status === 'FAILED'
                              ? '#f43f5e'
                              : post.categoryColor || '#6366f1',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5 leading-tight">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-1.5 py-0.5 rounded-lg border border-dashed border-slate-800 hover:border-indigo-500/60 text-[10px] text-slate-500 hover:text-indigo-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // Weekly View
  const renderWeeklyView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((dayDate) => {
          const dateStr = dayDate.toISOString().split('T')[0];
          const dayPosts = getPostsForDate(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-3 min-h-96 flex flex-col justify-between ${
                isToday ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div>
                <div className="text-center pb-3 border-b border-slate-800 mb-3">
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {dayDate.toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div
                    className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-bold mt-1 ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-200'
                    }`}
                  >
                    {dayDate.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        if (post.scheduledAt) {
                          const [d, t] = post.scheduledAt.split('T');
                          setRescheduleDate(d);
                          setRescheduleTime(t?.slice(0, 5) || '14:30');
                        }
                        setModalFeedback(null);
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all shadow-xs text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {new Date(post.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {renderStatusBadge(post.status)}
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-900">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-3 py-1.5 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Post</span>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // Daily View (Hourly timeline)
  const renderDailyView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayPosts = getPostsForDate(dateStr);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 divide-y divide-slate-800/80">
        {hours.map((hour) => {
          const hourLabel = `${String(hour).padStart(2, '0')}:00`;
          const hourPosts = dayPosts.filter((p) => {
            if (!p.scheduledAt) return false;
            const h = new Date(p.scheduledAt).getHours();
            return h === hour;
          });

          return (
            <div key={hour} className="py-3 flex items-start gap-4">
              <span className="w-16 text-xs font-mono text-slate-500 shrink-0 mt-1">
                {hourLabel}
              </span>

              <div className="grow space-y-2">
                {hourPosts.length === 0 ? (
                  <div className="h-6" />
                ) : (
                  hourPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        if (post.scheduledAt) {
                          const [d, t] = post.scheduledAt.split('T');
                          setRescheduleDate(d);
                          setRescheduleTime(t?.slice(0, 5) || '14:30');
                        }
                        setModalFeedback(null);
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-sm transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(post.status)}
                          <span className="text-xs font-mono text-indigo-400">
                            {new Date(post.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {post.categoryName && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: post.categoryColor || '#6366f1' }}
                            >
                              {post.categoryName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Part 9 Scheduling Hub
            </span>
            <span className="text-xs text-slate-500 font-mono">Redis + BullMQ Automated Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Content Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Plan, organize, reschedule, and automate multi-channel social publishing across daily, weekly, and monthly timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls & Navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white px-2">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* View Mode Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['daily', 'weekly', 'monthly'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  viewMode === mode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
          >
            <option value="all">All Platforms</option>
            {SOCIAL_PLATFORMS_CATALOG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="FAILED">Failed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Calendar View Container */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social content calendar...</p>
        </div>
      ) : viewMode === 'monthly' ? (
        renderMonthlyGrid()
      ) : viewMode === 'weekly' ? (
        renderWeeklyView()
      ) : (
        renderDailyView()
      )}

      {/* Post Creator Modal */}
      <PostCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={fetchData}
      />

      {/* Post Detail / Reschedule Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedPost.status)}
                <span className="text-xs text-slate-400 font-mono">
                  ID: {selectedPost.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>

              {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950 flex items-center justify-center">
                  <img
                    src={selectedPost.mediaUrls[0]}
                    alt="Post media"
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}

              {selectedPost.failureReason && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Failure Diagnostics: </span>
                    {selectedPost.failureReason}
                  </div>
                </div>
              )}

              {selectedPost.platformPostIds && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirmed Platform Delivery</span>
                  </div>
                  {Object.entries(selectedPost.platformPostIds).map(([plat, pid]) => (
                    <div key={plat} className="font-mono text-[11px] text-slate-300">
                      • {plat.toUpperCase()}: {pid}
                    </div>
                  ))}
                </div>
              )}

              {/* Reschedule Controls (When post is not already published) */}
              {selectedPost.status !== 'PUBLISHED' && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reschedule Post</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReschedule(selectedPost.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Update Scheduled Time
                  </button>
                </div>
              )}

              {modalFeedback && (
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold text-center">
                  {modalFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCancelPost(selectedPost.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancel Post</span>
              </button>

              {selectedPost.status !== 'PUBLISHED' && (
                <button
                  type="button"
                  onClick={() => handlePublishNow(selectedPost.id)}
                  disabled={isExecutingNow}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isExecutingNow ? 'Publishing...' : 'Publish Now'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading content calendar...</p>
        </div>
      }
    >
      <ContentCalendarContent />
    </Suspense>
  );
}
