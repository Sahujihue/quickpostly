'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  PanelTop,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  Eye,
  Sliders,
} from 'lucide-react';
import { CmsHeaderRecord, CmsNavigationItemRecord } from '@/lib/cms/repository';

export default function AdminHeaderPage() {
  const [header, setHeader] = useState<CmsHeaderRecord | null>(null);
  const [navItems, setNavItems] = useState<CmsNavigationItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', path: '', openInNewTab: false });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchHeader = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/header');
      const data = await res.json();
      if (data.success) {
        setHeader(data.data.header);
        setNavItems(data.data.navItems || []);
      }
    } catch {
      setMessage({ text: 'Failed to load header settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeader();
  }, []);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(header),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Header configuration saved and live', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error saving header settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.label || !newLink.path) return;

    try {
      const res = await fetch('/api/v1/admin/cms/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLink,
          menuLocation: 'HEADER',
          order: navItems.length + 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Navigation link added', type: 'success' });
        setIsAddLinkModalOpen(false);
        setNewLink({ label: '', path: '', openInNewTab: false });
        fetchHeader();
      }
    } catch {
      setMessage({ text: 'Failed to add nav link', type: 'error' });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/cms/header?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Navigation link removed', type: 'success' });
        setNavItems(navItems.filter((i) => i.id !== id));
      }
    } catch {
      setMessage({ text: 'Failed to delete nav link', type: 'error' });
    }
  };

  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;

    const items = [...navItems];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // renumber
    items.forEach((item, idx) => {
      item.order = idx + 1;
      fetch('/api/v1/admin/cms/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    });

    setNavItems(items);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading header configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <PanelTop className="w-6 h-6 text-indigo-500" />
          <span>Header & Navigation Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure site brand logo, reorder navbar links, toggle sticky mode, and configure primary CTA buttons.
        </p>
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

      {/* Main Settings Form */}
      {header && (
        <form onSubmit={handleSaveHeader} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Header Branding & Layout Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand Text Logo
              </label>
              <input
                type="text"
                value={header.logoText}
                onChange={(e) => setHeader({ ...header, logoText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Logo URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://.../logo.png"
                value={header.logoLight || ''}
                onChange={(e) => setHeader({ ...header, logoLight: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Header CTA Button Text
              </label>
              <input
                type="text"
                value={header.ctaText}
                onChange={(e) => setHeader({ ...header, ctaText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Header CTA Destination Link
              </label>
              <input
                type="text"
                value={header.ctaLink}
                onChange={(e) => setHeader({ ...header, ctaLink: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={header.isSticky}
                onChange={(e) => setHeader({ ...header, isSticky: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Sticky Header on Scroll</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={header.showCtaButton}
                onChange={(e) => setHeader({ ...header, showCtaButton: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display CTA Button</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={header.showSignInButton}
                onChange={(e) => setHeader({ ...header, showSignInButton: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display Sign-In Link</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={header.showThemeToggle}
                onChange={(e) => setHeader({ ...header, showThemeToggle: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Dark Mode Switcher</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Header Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Navigation Items Manager */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Navigation Menu Links</h2>
            <p className="text-xs text-slate-500">Order and links shown in desktop navbar and mobile drawer.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddLinkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                  <span className="text-xs text-slate-400 font-mono ml-2">({item.path})</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveLink(index, 'up')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === navItems.length - 1}
                  onClick={() => handleMoveLink(index, 'down')}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Link Modal */}
      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        title="Add Navigation Link"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Documentation"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Destination URL / Anchor
            </label>
            <input
              type="text"
              required
              placeholder="e.g. /#features or /blog"
              value={newLink.path}
              onChange={(e) => setNewLink({ ...newLink, path: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddLinkModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Add Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
