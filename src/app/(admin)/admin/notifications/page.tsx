'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Bell, Plus, Edit2, Trash2, Save, Loader2, Sparkles, Gift } from 'lucide-react';
import { CmsAnnouncementRecord } from '@/lib/cms/repository';

export default function AdminNotificationsPopupsPage() {
  const [items, setItems] = useState<CmsAnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<CmsAnnouncementRecord> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/announcements');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load announcements & popups', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      content: '',
      type: 'BAR',
      position: 'TOP',
      ctaText: 'Learn More',
      ctaLink: '/pricing',
      bgColor: '#f59e0b',
      textColor: '#0f172a',
      isActive: true,
      targetAudience: 'ALL',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CmsAnnouncementRecord) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.content) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Notification/Popup saved and scheduled', type: 'success' });
        setIsModalOpen(false);
        fetchAnnouncements();
      } else {
        setMessage({ text: data.error?.message || 'Failed to save announcement', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving announcement', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this announcement/popup?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Announcement deleted successfully', type: 'success' });
        fetchAnnouncements();
      }
    } catch {
      setMessage({ text: 'Failed to delete announcement', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" />
            <span>Announcements & Promotional Popups</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish top announcement ribbons, timed modal popups, promotional discounts, and CTA banners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement / Popup</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading announcements...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.type === 'BAR' ? (
                      <Badge variant="warning">Top Ribbon</Badge>
                    ) : (
                      <Badge variant="info">Modal Popup</Badge>
                    )}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                  </div>

                  <Badge variant={item.isActive ? 'success' : 'neutral'}>
                    {item.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                </div>

                <div
                  style={{ backgroundColor: item.bgColor, color: item.textColor }}
                  className="p-3 rounded-xl text-xs font-medium"
                >
                  <p>{item.content}</p>
                  {item.ctaText && (
                    <span className="font-bold underline mt-1 inline-block">
                      {item.ctaText} &rarr;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span>Audience: {item.targetAudience}</span>
                  <span>Position: {item.position}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Announcement' : 'Create Announcement / Popup'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Format Type
                </label>
                <select
                  value={editingItem.type || 'BAR'}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as 'BAR' | 'POPUP' | 'BANNER' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="BAR">Top Header Ribbon Bar</option>
                  <option value="POPUP">Interactive Center Popup</option>
                  <option value="BANNER">Bottom Floating Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={editingItem.targetAudience || 'ALL'}
                  onChange={(e) => setEditingItem({ ...editingItem, targetAudience: e.target.value as 'ALL' | 'GUESTS' | 'USERS' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Visitors</option>
                  <option value="GUESTS">Logged-out Guests Only</option>
                  <option value="USERS">Active Logged-in Users</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                required
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. Black Friday Special"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Message / Offer Copy
              </label>
              <textarea
                rows={3}
                required
                value={editingItem.content || ''}
                onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={editingItem.ctaText || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ctaText: e.target.value })}
                  placeholder="Claim Deal"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={editingItem.ctaLink || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, ctaLink: e.target.value })}
                  placeholder="/pricing"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingItem.bgColor || '#f59e0b'}
                    onChange={(e) => setEditingItem({ ...editingItem, bgColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingItem.bgColor || '#f59e0b'}
                    onChange={(e) => setEditingItem({ ...editingItem, bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingItem.textColor || '#0f172a'}
                    onChange={(e) => setEditingItem({ ...editingItem, textColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingItem.textColor || '#0f172a'}
                    onChange={(e) => setEditingItem({ ...editingItem, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingItem.isActive ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Active on Public Website</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Announcement</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
