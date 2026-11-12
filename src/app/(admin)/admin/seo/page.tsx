'use client';

import React, { useState, useEffect } from 'react';
import { Search, Save, Loader2, Globe, FileCode, CheckCircle2, Sparkles } from 'lucide-react';
import { CmsSeoSettingRecord } from '@/lib/cms/repository';
import { ImageUploadField } from '@/components/admin/image-upload-field';

export default function AdminSeoSettingsPage() {
  const [seo, setSeo] = useState<CmsSeoSettingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSeo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/seo');
      const data = await res.json();
      if (data.success) {
        setSeo(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load SEO configuration', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Global SEO and robots.txt settings saved', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Failed to update SEO settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading SEO configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-500" />
          <span>Search Engine Optimization & Indexing</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure default search engine metadata, OpenGraph tags, sitemap.xml rules, and custom robots.txt directives.
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

      {seo && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Section */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Default Metadata
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Website Title
              </label>
              <input
                type="text"
                required
                value={seo.defaultMetaTitle}
                onChange={(e) => setSeo({ ...seo, defaultMetaTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                required
                value={seo.defaultMetaDescription}
                onChange={(e) => setSeo({ ...seo, defaultMetaDescription: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Meta Banner / OpenGraph Banner with Upload & Live Preview */}
            <div className="pt-2">
              <ImageUploadField
                label="Meta Banner (Default OpenGraph / Social Share Image)"
                description="Social preview banner card displayed when pages on your website are shared on WhatsApp, Facebook, Twitter/X, and LinkedIn."
                value={seo.defaultOgImage || ''}
                onChange={(url) => setSeo({ ...seo, defaultOgImage: url || null })}
                folder="banners"
                aspectRatioHint="1200 × 630 px (1.91:1 ratio)"
                previewVariant="banner"
                siteTitle={seo.defaultMetaTitle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Twitter Card Layout Type
                </label>
                <select
                  value={seo.twitterCardType || 'summary_large_image'}
                  onChange={(e) => setSeo({ ...seo, twitterCardType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="summary_large_image">summary_large_image (Full Width Banner - Recommended)</option>
                  <option value="summary">summary (Small Square Thumbnail)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Twitter / X Handle
                </label>
                <input
                  type="text"
                  value={seo.twitterHandle}
                  onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                  placeholder="@QuickPostly"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Analytics & Webmaster Verification */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Measurement & Analytics IDs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXX"
                  value={seo.googleAnalyticsId || ''}
                  onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Tag Manager Container ID
                </label>
                <input
                  type="text"
                  placeholder="GTM-XXXXXXX"
                  value={seo.googleTagManagerId || ''}
                  onChange={(e) => setSeo({ ...seo, googleTagManagerId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Robots.txt & Sitemap Directives */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Robots.txt & Sitemap</h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={seo.sitemapEnabled}
                  onChange={(e) => setSeo({ ...seo, sitemapEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Generate Dynamic /sitemap.xml</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Robots.txt Content
              </label>
              <textarea
                rows={5}
                value={seo.robotsTxt || ''}
                onChange={(e) => setSeo({ ...seo, robotsTxt: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save SEO Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
