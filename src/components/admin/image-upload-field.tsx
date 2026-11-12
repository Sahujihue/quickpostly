'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, Check, Eye } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value: string | null;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  aspectRatioHint?: string;
  previewVariant?: 'logo-light' | 'logo-dark' | 'favicon' | 'banner' | 'square';
  siteTitle?: string;
}

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  folder = 'brand',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon',
  aspectRatioHint,
  previewVariant = 'square',
  siteTitle = 'QuickPostly',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/v1/admin/cms/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.fileUrl) {
        onChange(data.data.fileUrl);
        setUrlInput(data.data.fileUrl);
      } else {
        setError(data.error?.message || 'Failed to upload image. Please try another file.');
      }
    } catch {
      setError('Network error while uploading image. Please check connection.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError(null);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
        {aspectRatioHint && (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
            {aspectRatioHint}
          </span>
        )}
      </div>

      {error && (
        <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Controls & URL input tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            inputMode === 'upload'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            inputMode === 'url'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste Image URL</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto text-[11px] font-medium text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {inputMode === 'upload' ? (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-input-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-300/80 dark:border-slate-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Uploading image...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span>Choose Image from Computer</span>
              </>
            )}
          </label>
          <span className="text-[11px] text-slate-400">
            {uploading ? 'Processing & saving asset...' : 'Supports PNG, SVG, JPG, WEBP, ICO (Max 10MB)'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyUrl();
              }
            }}
            placeholder="https://example.com/assets/logo.png"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Visual Live Preview Cards */}
      {value ? (
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Eye className="w-3 h-3 text-indigo-500" />
            <span>Active Live Preview:</span>
          </p>

          {/* Favicon Browser Tab Simulation */}
          {previewVariant === 'favicon' && (
            <div className="max-w-md rounded-t-lg border border-slate-200 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-800 p-2 flex items-center gap-2 shadow-inner">
              <div className="flex items-center gap-1 px-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 max-w-[240px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Favicon Preview"
                  className="w-4 h-4 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {siteTitle} – AI Platform
                </span>
                <X className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
              </div>
            </div>
          )}

          {/* Meta Banner Social Share Card Simulation (1200x630 format) */}
          {previewVariant === 'banner' && (
            <div className="max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md bg-white dark:bg-slate-900">
              <div className="relative aspect-[1200/630] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="OpenGraph Social Share Banner Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-xs text-[10px] text-white font-mono font-medium">
                  1200 × 630 OG Banner
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  QUICKPOSTLY.COM
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {siteTitle} – AI Social Media Management & Smart Queuing
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Create AI-powered social media content, schedule posts, manage multiple accounts and grow everywhere.
                </p>
              </div>
            </div>
          )}

          {/* Logo Light Mode Preview */}
          {previewVariant === 'logo-light' && (
            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center gap-3">
              <div className="h-10 max-w-[200px] flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Logo Light Preview"
                  className="max-h-10 max-w-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 ml-auto">Light Header Preview</span>
            </div>
          )}

          {/* Logo Dark Mode Preview */}
          {previewVariant === 'logo-dark' && (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center gap-3">
              <div className="h-10 max-w-[200px] flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Logo Dark Preview"
                  className="max-h-10 max-w-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 ml-auto">Dark Header Preview</span>
            </div>
          )}

          {/* Square generic preview */}
          {previewVariant === 'square' && (
            <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] block truncate max-w-xs">
                  {value.startsWith('data:') ? 'Embedded Base64 Image' : value}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center text-slate-400 text-xs">
          No image selected yet. Upload an image or enter a URL above.
        </div>
      )}
    </div>
  );
}
