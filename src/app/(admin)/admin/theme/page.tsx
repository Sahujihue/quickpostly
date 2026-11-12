'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Loader2, Sparkles, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';
import { CmsThemeSettingRecord } from '@/lib/cms/repository';
import { ImageUploadField } from '@/components/admin/image-upload-field';

export default function AdminThemeBrandingPage() {
  const [theme, setTheme] = useState<CmsThemeSettingRecord | null>(null);
  const [metaBanner, setMetaBanner] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchThemeAndSeo = async () => {
    try {
      setLoading(true);
      const [themeRes, seoRes] = await Promise.all([
        fetch('/api/v1/admin/cms/theme'),
        fetch('/api/v1/admin/cms/seo'),
      ]);

      const themeData = await themeRes.json();
      const seoData = await seoRes.json();

      if (themeData.success) {
        setTheme(themeData.data);
      }
      if (seoData.success && seoData.data?.defaultOgImage) {
        setMetaBanner(seoData.data.defaultOgImage);
      }
    } catch {
      setMessage({ text: 'Failed to load theme and branding configuration', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemeAndSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;

    setSaving(true);
    try {
      const promises: Promise<Response>[] = [
        fetch('/api/v1/admin/cms/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(theme),
        }),
      ];

      // Also persist Meta Banner to SEO settings
      if (metaBanner !== undefined) {
        promises.push(
          fetch('/api/v1/admin/cms/seo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ defaultOgImage: metaBanner }),
          })
        );
      }

      const results = await Promise.all(promises);
      const allSuccess = results.every((r) => r.ok);

      if (allSuccess) {
        setMessage({
          text: 'Theme, Logo, Favicon & Meta Banner updated and active across platform!',
          type: 'success',
        });
      } else {
        setMessage({ text: 'Some settings could not be updated', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving branding settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading theme & branding settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Palette className="w-6 h-6 text-indigo-500" />
          <span>Theme, Typography & Branding</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize global brand identifiers, upload website logos, set favicon, configure social meta banner, and customize color accents.
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

      {theme && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Brand Assets: Logo, Favicon & Meta Banner */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Brand Media Assets (Logo, Favicon & Meta Banner)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload image files directly from your computer or paste asset URLs.
                  </p>
                </div>
              </div>

              {/* Website Logo - Light Mode */}
              <ImageUploadField
                label="Website Logo (Light Mode)"
                description="Primary logo displayed on light backgrounds, public navbar, customer portal, and invoice headers."
                value={theme.logoLight || ''}
                onChange={(url) => setTheme({ ...theme, logoLight: url || null })}
                folder="logos"
                aspectRatioHint="Recommended: 250×60 px (PNG/SVG)"
                previewVariant="logo-light"
              />

              {/* Website Logo - Dark Mode */}
              <ImageUploadField
                label="Website Logo (Dark Mode)"
                description="Contrasting logo displayed on dark theme backgrounds, dark navigation bar, and admin sidebar."
                value={theme.logoDark || ''}
                onChange={(url) => setTheme({ ...theme, logoDark: url || null })}
                folder="logos"
                aspectRatioHint="Recommended: 250×60 px (PNG/SVG)"
                previewVariant="logo-dark"
              />

              {/* Browser Favicon */}
              <ImageUploadField
                label="Browser Favicon (.ico / .png / .svg)"
                description="Small icon displayed in browser tabs, bookmarks bar, and mobile home-screen app shortcuts."
                value={theme.favicon || ''}
                onChange={(url) => setTheme({ ...theme, favicon: url || null })}
                folder="favicons"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                aspectRatioHint="32×32 or 64×64 px (.ico / .png)"
                previewVariant="favicon"
                siteTitle={theme.siteName}
              />

              {/* Meta Banner / Social Share OpenGraph Banner */}
              <ImageUploadField
                label="Meta Banner (Social Share OpenGraph Image)"
                description="Preview banner displayed when your website link is shared on WhatsApp, Facebook, Twitter/X, LinkedIn, and Slack."
                value={metaBanner}
                onChange={(url) => setMetaBanner(url)}
                folder="banners"
                aspectRatioHint="1200×630 px (1.91:1 ratio, JPG/PNG)"
                previewVariant="banner"
                siteTitle={theme.siteName}
              />
            </div>

            {/* 2. Brand Identity Text */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Brand Text Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    required
                    value={theme.siteName}
                    onChange={(e) => setTheme({ ...theme, siteName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={theme.tagLine}
                    onChange={(e) => setTheme({ ...theme, tagLine: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Colors */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Brand Palette & Accents
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Typography */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Font Families
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Heading Font
                  </label>
                  <select
                    value={theme.fontHeading}
                    onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Inter">Inter (Clean Modern SaaS)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Geist Sans">Geist Sans</option>
                    <option value="Manrope">Manrope</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Body Font
                  </label>
                  <select
                    value={theme.fontBody}
                    onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Inter">Inter (Universal)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Branding & Assets</span>
              </button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Live Visual Brand Summary</span>
            </h3>

            {/* Header Logo Card Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navbar Logo Representation
              </span>
              
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                {theme.logoLight || theme.logoDark ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.logoLight || theme.logoDark || ''}
                    alt={theme.siteName}
                    className="h-8 max-w-[160px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: theme.primaryColor }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs shadow-sm"
                    >
                      QP
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {theme.siteName}
                    </span>
                  </div>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  Active
                </span>
              </div>

              {/* Favicon Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Browser Tab Favicon
                </span>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  {theme.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={theme.favicon}
                      alt="Favicon"
                      className="w-4 h-4 object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded bg-amber-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {theme.siteName} – AI Platform
                  </span>
                </div>
              </div>

              {/* Meta Banner Card Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Social Share Meta Banner
                </span>
                {metaBanner ? (
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[1200/630] bg-slate-100 dark:bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={metaBanner}
                      alt="Meta Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-xs">
                    No custom meta banner set (using default)
                  </div>
                )}
              </div>

              {/* Palette Accent Button */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Action Color:
                </p>
                <button
                  type="button"
                  style={{ backgroundColor: theme.primaryColor }}
                  className="w-full py-2 px-3 rounded-lg text-slate-950 font-bold text-xs shadow-sm cursor-default"
                >
                  Explore Platform
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
