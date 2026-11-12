'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Globe,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  CheckCircle2,
  Loader2,
  Smartphone,
  Monitor,
  Layers,
} from 'lucide-react';
import { CmsSectionRecord } from '@/lib/cms/repository';

export default function AdminWebsiteBuilderPage() {
  const [sections, setSections] = useState<CmsSectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<CmsSectionRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/sections?pageId=page_home');
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load website sections', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update orders
    const orders = newSections.map((sec, idx) => ({ id: sec.id, order: idx + 1 }));
    setSections(newSections);

    try {
      const res = await fetch('/api/v1/admin/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Section order updated and saved', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Failed to persist section order', type: 'error' });
    }
  };

  const handleToggleVisibility = async (sec: CmsSectionRecord) => {
    try {
      const res = await fetch('/api/v1/admin/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sec.id, isVisible: !sec.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(sections.map((s) => (s.id === sec.id ? { ...s, isVisible: !s.isVisible } : s)));
        setMessage({
          text: `Section ${sec.title} is now ${!sec.isVisible ? 'visible' : 'hidden'} on live website`,
          type: 'success',
        });
      }
    } catch {
      setMessage({ text: 'Failed to toggle visibility', type: 'error' });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch('/api/v1/admin/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Section duplicated successfully', type: 'success' });
        fetchSections();
      }
    } catch {
      setMessage({ text: 'Failed to duplicate section', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this section from the live page?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/sections?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Section removed successfully', type: 'success' });
        setSections(sections.filter((s) => s.id !== id));
      }
    } catch {
      setMessage({ text: 'Failed to delete section', type: 'error' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSection),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Section content updated successfully', type: 'success' });
        setIsEditModalOpen(false);
        fetchSections();
      }
    } catch {
      setMessage({ text: 'Failed to save section content', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            <span>Dynamic Website Builder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reorder, edit, duplicate, and toggle visibility for all homepage and landing page sections in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Site</span>
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Sections Table / Reordering Canvas */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading homepage section structure...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, index) => (
            <div
              key={sec.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                sec.isVisible
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-70'
              }`}
            >
              {/* Order number & details */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 shrink-0">
                  {index + 1}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sec.title}
                    </span>
                    <Badge variant="neutral">Key: #{sec.sectionKey}</Badge>
                    <Badge variant={sec.isVisible ? 'success' : 'neutral'}>
                      {sec.isVisible ? 'Live' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sec.subtitle}</p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  title="Move section up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  title="Move section down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(sec)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    sec.isVisible
                      ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={sec.isVisible ? 'Hide from live page' : 'Publish to live page'}
                >
                  {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(sec);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                  title="Edit section content"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => handleDuplicate(sec.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Duplicate section"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(sec.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Section Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Section: ${editingSection?.title || ''}`}
        size="lg"
      >
        {editingSection && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                required
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={editingSection.subtitle}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Anchor / Section Key
              </label>
              <input
                type="text"
                disabled
                value={editingSection.sectionKey}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingSection.isVisible}
                  onChange={(e) => setEditingSection({ ...editingSection, isVisible: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Visible on live website</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Section Changes</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
