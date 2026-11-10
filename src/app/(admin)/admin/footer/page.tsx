'use client';

import React, { useState, useEffect } from 'react';
import { PanelBottom, Save, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { CmsFooterRecord, CmsFooterColumn } from '@/lib/cms/repository';

export default function AdminFooterPage() {
  const [footer, setFooter] = useState<CmsFooterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/footer');
      const data = await res.json();
      if (data.success) {
        setFooter(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load footer configuration', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footer) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Footer configuration saved and live', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error saving footer settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddColumn = () => {
    if (!footer) return;
    const newCol: CmsFooterColumn = {
      id: `col_${Date.now()}`,
      title: 'New Column',
      links: [{ label: 'Link 1', url: '/' }],
    };
    setFooter({
      ...footer,
      columnsJson: [...footer.columnsJson, newCol],
    });
  };

  const handleDeleteColumn = (colId: string) => {
    if (!footer) return;
    setFooter({
      ...footer,
      columnsJson: footer.columnsJson.filter((c) => c.id !== colId),
    });
  };

  const handleAddLinkToColumn = (colIndex: number) => {
    if (!footer) return;
    const updated = [...footer.columnsJson];
    updated[colIndex].links.push({ label: 'New Link', url: '/' });
    setFooter({ ...footer, columnsJson: updated });
  };

  const handleDeleteLinkFromColumn = (colIndex: number, linkIndex: number) => {
    if (!footer) return;
    const updated = [...footer.columnsJson];
    updated[colIndex].links.splice(linkIndex, 1);
    setFooter({ ...footer, columnsJson: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading footer configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <PanelBottom className="w-6 h-6 text-indigo-500" />
          <span>Footer Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage footer columns, links, social profiles, newsletter opt-in, and copyright details.
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

      {footer && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand & Copy Section */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Brand Summary & Copyright
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Footer Brand Mission Statement
              </label>
              <textarea
                rows={2}
                value={footer.brandDescription}
                onChange={(e) => setFooter({ ...footer, brandDescription: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Copyright Notice
              </label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Newsletter Controls */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Newsletter Opt-in</h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={footer.showNewsletter}
                  onChange={(e) => setFooter({ ...footer, showNewsletter: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Newsletter Box</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={footer.newsletterTitle}
                  onChange={(e) => setFooter({ ...footer, newsletterTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={footer.newsletterSubtitle}
                  onChange={(e) => setFooter({ ...footer, newsletterSubtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Official Social Profiles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'].map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {platform} URL
                  </label>
                  <input
                    type="text"
                    value={footer.socialLinksJson[platform] || ''}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinksJson: { ...footer.socialLinksJson, [platform]: e.target.value },
                      })
                    }
                    placeholder={`https://${platform}.com/...`}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Columns & Links Editor */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Footer Link Columns</h2>
                <p className="text-xs text-slate-500">Configure vertical navigation menus in the footer.</p>
              </div>
              <button
                type="button"
                onClick={handleAddColumn}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Column</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {footer.columnsJson.map((col, colIdx) => (
                <div
                  key={col.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const updated = [...footer.columnsJson];
                        updated[colIdx].title = e.target.value;
                        setFooter({ ...footer, columnsJson: updated });
                      }}
                      className="font-bold text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteColumn(col.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    {col.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...footer.columnsJson];
                            updated[colIdx].links[linkIdx].label = e.target.value;
                            setFooter({ ...footer, columnsJson: updated });
                          }}
                          className="w-1/2 text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Path"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...footer.columnsJson];
                            updated[colIdx].links[linkIdx].url = e.target.value;
                            setFooter({ ...footer, columnsJson: updated });
                          }}
                          className="w-1/2 text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLinkFromColumn(colIdx, linkIdx)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddLinkToColumn(colIdx)}
                    className="w-full text-center py-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
                  >
                    + Add Link
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Footer Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
