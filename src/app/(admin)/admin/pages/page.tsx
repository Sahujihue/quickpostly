'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  History,
  RotateCcw,
  ExternalLink,
  Save,
  Loader2,
  Eye,
} from 'lucide-react';
import { CmsPageRecord, CmsPageRevisionRecord } from '@/lib/cms/repository';

export default function AdminPagesManagerPage() {
  const [pages, setPages] = useState<CmsPageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<CmsPageRecord> | null>(null);
  const [bodyHtmlInput, setBodyHtmlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [revisions, setRevisions] = useState<CmsPageRevisionRecord[]>([]);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [activePageForRevisions, setActivePageForRevisions] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load dynamic pages', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPage({
      title: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      status: 'PUBLISHED',
      isSystemPage: false,
    });
    setBodyHtmlInput('<h2>Page Title</h2>\n<p>Add rich semantic content here...</p>');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (page: CmsPageRecord) => {
    setEditingPage(page);
    setBodyHtmlInput((page.contentJson?.bodyHtml as string) || '');
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !editingPage.title || !editingPage.slug) return;

    setSaving(true);
    try {
      const payload = {
        ...editingPage,
        contentJson: {
          ...editingPage.contentJson,
          bodyHtml: bodyHtmlInput,
        },
      };

      const res = await fetch('/api/v1/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Dynamic page saved and updated', type: 'success' });
        setIsEditorOpen(false);
        fetchPages();
      } else {
        setMessage({ text: data.error?.message || 'Failed to save page', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving dynamic page', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom page?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/pages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Page deleted successfully', type: 'success' });
        fetchPages();
      } else {
        setMessage({ text: data.error?.message || 'Cannot delete page', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to delete page', type: 'error' });
    }
  };

  const handleOpenRevisions = async (pageId: string) => {
    setActivePageForRevisions(pageId);
    try {
      const res = await fetch(`/api/v1/admin/cms/pages?revisionsFor=${pageId}`);
      const data = await res.json();
      if (data.success) {
        setRevisions(data.data);
        setIsRevisionsOpen(true);
      }
    } catch {
      setMessage({ text: 'Failed to fetch revisions', type: 'error' });
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!confirm('Revert page back to this historical revision?')) return;
    try {
      const res = await fetch('/api/v1/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', revisionId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Page successfully reverted to revision', type: 'success' });
        setIsRevisionsOpen(false);
        fetchPages();
      }
    } catch {
      setMessage({ text: 'Failed to rollback revision', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Dynamic Custom Pages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build, publish, edit, and version-control pages with unique URLs and automatic revision rollbacks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
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
          <span>Loading dynamic pages...</span>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Page Title & Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-400 font-mono">
                            {p.slug === 'home' ? '/' : p.isSystemPage ? `/${p.slug}` : `/pages/${p.slug}`}
                          </span>
                          <Link
                            href={p.slug === 'home' ? '/' : p.isSystemPage ? `/${p.slug}` : `/pages/${p.slug}`}
                            target="_blank"
                            className="text-indigo-500 hover:text-indigo-600 inline-flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={p.isSystemPage ? 'warning' : 'info'}>
                        {p.isSystemPage ? 'System Core' : 'Custom CMS'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenRevisions(p.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Revision History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                          title="Edit page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!p.isSystemPage && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Page Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingPage?.id ? `Edit Page: ${editingPage.title}` : 'Create Dynamic Page'}
        size="xl"
      >
        {editingPage && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="e.g. Creator Affiliate Guide"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  disabled={editingPage.isSystemPage}
                  value={editingPage.slug || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                  placeholder="e.g. creator-affiliate-guide"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={editingPage.metaTitle || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Publish Status
                </label>
                <select
                  value={editingPage.status || 'PUBLISHED'}
                  onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as CmsPageRecord['status'] })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PUBLISHED">Published (Live)</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta Description (Search Engines & Social Sharing)
              </label>
              <textarea
                rows={2}
                value={editingPage.metaDescription || ''}
                onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Body HTML (Safe sanitized semantic markup)
              </label>
              <textarea
                rows={8}
                value={bodyHtmlInput}
                onChange={(e) => setBodyHtmlInput(e.target.value)}
                placeholder="<h2>Section heading</h2><p>Paragraph content...</p>"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
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
                <span>Save & Publish</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Revisions History Modal */}
      <Modal
        isOpen={isRevisionsOpen}
        onClose={() => setIsRevisionsOpen(false)}
        title="Page Revision History & Rollbacks"
      >
        <div className="space-y-3">
          {revisions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No historical revisions recorded yet for this page. Revisions are created automatically whenever published content is modified.
            </p>
          ) : (
            revisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rev.title}</p>
                  <p className="text-slate-400 text-[11px]">
                    Saved by {rev.createdBy || 'Admin'} on {new Date(rev.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRollback(rev.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Revision</span>
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
