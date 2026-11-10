// src/app/(dashboard)/dashboard/queue/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Layers,
  Repeat,
  Plus,
  Play,
  Pause,
  Clock,
  Trash2,
  Edit2,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Send,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PostCreatorModal } from '@/components/dashboard/post-creator-modal';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import {
  ScheduledPostDTO,
  ContentCategoryDTO,
  QueueMetricsDTO,
} from '@/modules/scheduling/types';

function QueueManagementContent() {
  const [categories, setCategories] = useState<ContentCategoryDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [queuePosts, setQueuePosts] = useState<ScheduledPostDTO[]>([]);
  const [metrics, setMetrics] = useState<QueueMetricsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [newCategoryEvergreen, setNewCategoryEvergreen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategoryId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, metricsRes] = await Promise.all([
        fetch('/api/v1/posts/categories?workspaceId=ws_peak_scale').then((r) => r.json()),
        fetch('/api/v1/posts/queue/metrics?workspaceId=ws_peak_scale').then((r) => r.json()),
      ]);

      if (catsRes.success && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
        const activeCatId = selectedCategoryId || catsRes.data[0]?.id;
        if (!selectedCategoryId && activeCatId) {
          setSelectedCategoryId(activeCatId);
        }

        if (activeCatId) {
          const postsRes = await fetch(
            `/api/v1/posts?workspaceId=ws_peak_scale&categoryId=${activeCatId}`
          ).then((r) => r.json());
          if (postsRes.success) {
            setQueuePosts(postsRes.data || []);
          }
        }
      }

      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.error('Failed to load queue data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePause = async (cat: ContentCategoryDTO) => {
    try {
      const updatedPaused = !cat.isPaused;
      await fetch('/api/v1/posts/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cat,
          isPaused: updatedPaused,
        }),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isPaused: updatedPaused } : c))
      );
    } catch {
      // Ignored
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/v1/posts/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_peak_scale',
          name: newCategoryName,
          color: newCategoryColor,
          isEvergreen: newCategoryEvergreen,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddCategoryOpen(false);
        setNewCategoryName('');
        loadData();
      }
    } catch {
      alert('Failed to create category');
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${id}/publish-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Post published successfully to social platforms!');
        loadData();
      } else {
        alert(`Publishing failed: ${data.error?.message}`);
      }
    } catch {
      alert('Network error during publishing.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this post from the queue?')) return;
    try {
      await fetch(`/api/v1/posts/${id}`, { method: 'DELETE' });
      loadData();
    } catch {
      alert('Failed to delete post');
    }
  };

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              SocialBee-Inspired Category Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Part 9 Queue System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Publishing Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize posts into purposeful categories. Auto-populate recurrent time slots and recycle evergreen content indefinitely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />

          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>New Category</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* BullMQ Engine & Queue Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Queue Engine</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {metrics?.isRedisConnected ? 'BullMQ Live' : 'Persistent'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Deduplication active</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Delayed (Scheduled)</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-0.5">
            {metrics?.delayed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Waiting for target slot</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Published</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
            {metrics?.completed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Confirmed by platforms</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Evergreen Active</div>
          <div className="text-xl font-extrabold text-amber-400 mt-0.5">
            {metrics?.totalEvergreen ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Auto-recycling enabled</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Drafts</div>
          <div className="text-xl font-extrabold text-slate-300 mt-0.5">
            {metrics?.totalDrafts ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Work-in-progress posts</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Failed</div>
          <div className="text-xl font-extrabold text-rose-400 mt-0.5">
            {metrics?.failed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Requires retry/edit</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
              {cat.postsCount !== undefined && cat.postsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                  {cat.postsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Category Meta Header */}
      {activeCategory && (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white">{activeCategory.name}</h2>
              {activeCategory.isEvergreen && (
                <Badge variant="amber" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Evergreen Recycling
                </Badge>
              )}
              {activeCategory.isPaused && (
                <Badge variant="rose" size="sm">
                  <Pause className="w-3 h-3 mr-1" />
                  Queue Paused
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activeCategory.description || 'Posts in this category are delivered at scheduled time slots.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTogglePause(activeCategory)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCategory.isPaused
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {activeCategory.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Queue</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Queue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Queue Posts List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading queue items...</p>
        </div>
      ) : queuePosts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">This category queue is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add content to this category queue so SocialHive can automatically publish at your scheduled time slots.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Post Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {queuePosts.map((post, index) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400 shrink-0">
                  #{index + 1}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    {post.scheduledAt && (
                      <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduledAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}

                    {post.evergreen && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        Recycled {post.evergreenRecycles} times
                      </span>
                    )}

                    {post.status === 'PUBLISHED' && (
                      <Badge variant="emerald" size="sm">Published</Badge>
                    )}
                    {post.status === 'FAILED' && (
                      <Badge variant="rose" size="sm">Failed</Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1">
                    {post.platforms.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {post.status !== 'PUBLISHED' && (
                  <button
                    type="button"
                    onClick={() => handlePublishNow(post.id)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Publish immediately"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Creator Modal */}
      <PostCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={loadData}
      />

      {/* New Category Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Category</h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Lead Magnets & Freebies"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Theme Color</label>
              <div className="flex gap-2">
                {['#f59e0b', '#6366f1', '#10b981', '#a855f7', '#ec4899', '#3b82f6'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewCategoryColor(col)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      newCategoryColor === col ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-300">Evergreen Recycling</span>
              <input
                type="checkbox"
                checked={newCategoryEvergreen}
                onChange={(e) => setNewCategoryEvergreen(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueueManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading queue management...</p>
        </div>
      }
    >
      <QueueManagementContent />
    </Suspense>
  );
}
