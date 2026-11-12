'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  Loader2,
  Folder,
  Film,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CmsMediaItemRecord } from '@/lib/cms/repository';

export default function AdminMediaLibraryPage() {
  const [items, setItems] = useState<CmsMediaItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsMediaItemRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    fileName: '',
    fileUrl: '',
    altText: '',
    folder: 'product',
    mimeType: 'image/png',
    fileSize: 245000,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMedia = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/api/v1/admin/cms/media?q=${encodeURIComponent(query)}` : '/api/v1/admin/cms/media';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load media assets', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(searchQuery);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNewItem((prev) => ({
          ...prev,
          fileName: data.data.fileName,
          fileUrl: data.data.url,
          mimeType: data.data.mimeType,
          fileSize: data.data.fileSize,
        }));
      } else {
        setUploadError(data.error?.message || 'Failed to upload media file');
      }
    } catch {
      setUploadError('Network error uploading file');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.fileName || !newItem.fileUrl) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Media asset registered in library', type: 'success' });
        setIsUploadModalOpen(false);
        setNewItem({
          fileName: '',
          fileUrl: '',
          altText: '',
          folder: 'product',
          mimeType: 'image/png',
          fileSize: 245000,
        });
        fetchMedia();
      }
    } catch {
      setMessage({ text: 'Failed to register asset', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Media asset metadata updated', type: 'success' });
        setIsEditModalOpen(false);
        fetchMedia();
      }
    } catch {
      setMessage({ text: 'Failed to update asset', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to safely remove this asset from the library?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Media asset deleted', type: 'success' });
        setItems(items.filter((i) => i.id !== id));
      }
    } catch {
      setMessage({ text: 'Failed to delete asset', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-500" />
            <span>Media Library & Asset Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store, search, preview, and optimize public marketing graphics, blog covers, and hero assets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
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

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by file name or alt text..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
        >
          Search
        </button>
      </form>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading asset library...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm group"
            >
              <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <img
                  src={item.fileUrl}
                  alt={item.altText || item.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-white backdrop-blur-sm">
                  {item.folder}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={item.fileName}>
                  {item.fileName}
                </h4>
                <p className="text-[11px] text-slate-400 truncate" title={item.altText || ''}>
                  Alt: {item.altText || 'No alt text provided'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                  <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                  <span>
                    {item.width}x{item.height}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="View Full Asset"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setIsEditModalOpen(true);
                    }}
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
            </div>
          ))}
        </div>
      )}

      {/* Upload/Register Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload & Register Media Asset"
      >
        <form onSubmit={handleCreateMedia} className="space-y-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUploadFile}
            className="hidden"
          />

          {/* Upload Dropzone / Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-center cursor-pointer group"
          >
            {isUploadingFile ? (
              <div className="py-2 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading photo/video asset to server...</span>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  <Upload className="w-4 h-4" />
                  <span>Click to Browse &amp; Upload Photo or Video</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports PNG, JPG, WEBP, GIF, MP4, WEBM (Photos up to 15MB, Videos up to 100MB)
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Preview if uploaded */}
          {newItem.fileUrl && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {newItem.mimeType.startsWith('video/') || newItem.fileUrl.endsWith('.mp4') ? (
                  <video src={newItem.fileUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={newItem.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="truncate text-xs space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{newItem.fileName || 'Asset Uploaded'}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate font-mono">{newItem.fileUrl}</div>
                <div className="text-[10px] text-indigo-500 font-semibold uppercase">
                  {newItem.mimeType} • {(newItem.fileSize / 1024).toFixed(0)} KB
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. hero-dashboard-preview.png"
              value={newItem.fileName}
              onChange={(e) => setNewItem({ ...newItem, fileName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Asset URL (or paste external link)
            </label>
            <input
              type="text"
              required
              placeholder="https://... or /uploads/..."
              value={newItem.fileUrl}
              onChange={(e) => setNewItem({ ...newItem, fileUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Folder
              </label>
              <select
                value={newItem.folder}
                onChange={(e) => setNewItem({ ...newItem, folder: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="product">product</option>
                <option value="features">features</option>
                <option value="blog">blog</option>
                <option value="testimonials">testimonials</option>
                <option value="branding">branding</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alt Text (Accessibility)
              </label>
              <input
                type="text"
                placeholder="Descriptive image summary"
                value={newItem.altText}
                onChange={(e) => setNewItem({ ...newItem, altText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
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
              <span>Register Media</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Media Metadata"
      >
        {editingItem && (
          <form onSubmit={handleUpdateMedia} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                File Name
              </label>
              <input
                type="text"
                required
                value={editingItem.fileName}
                onChange={(e) => setEditingItem({ ...editingItem, fileName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={editingItem.altText || ''}
                onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Folder
              </label>
              <select
                value={editingItem.folder}
                onChange={(e) => setEditingItem({ ...editingItem, folder: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="product">product</option>
                <option value="features">features</option>
                <option value="blog">blog</option>
                <option value="testimonials">testimonials</option>
                <option value="branding">branding</option>
              </select>
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Update Metadata</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
