// src/components/dashboard/post-creator-modal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Video,
  Layers,
  Send,
  Save,
  Globe,
  Tag,
  Link2,
  Repeat,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Upload,
  FileUp,
  Film,
  Play,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SocialPlatformId, SocialPostType } from '@/modules/social/types';
import { SOCIAL_PLATFORMS_CATALOG } from '@/modules/social/platforms';
import { ContentCategoryDTO, RecurrenceRule } from '@/modules/scheduling/types';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

interface ConnectedAccount {
  id: string;
  platform: SocialPlatformId;
  accountName: string;
  accountHandle: string;
  profilePictureUrl?: string;
}

interface PostCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  initialDate?: string;
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'America/New_York', label: 'EST / EDT (New York, Eastern Time)' },
  { value: 'America/Chicago', label: 'CST / CDT (Chicago, Central Time)' },
  { value: 'America/Denver', label: 'MST / MDT (Denver, Mountain Time)' },
  { value: 'America/Los_Angeles', label: 'PST / PDT (Los Angeles, Pacific Time)' },
  { value: 'Europe/London', label: 'GMT / BST (London, UK)' },
  { value: 'Europe/Paris', label: 'CET / CEST (Paris, Berlin, Rome)' },
  { value: 'Asia/Dubai', label: 'GST (Dubai, UAE)' },
  { value: 'Asia/Kolkata', label: 'IST (India Standard Time)' },
  { value: 'Asia/Singapore', label: 'SGT (Singapore, Hong Kong)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo, Japan)' },
  { value: 'Australia/Sydney', label: 'AEST / AEDT (Sydney, Australia)' },
];

const CTA_OPTIONS = [
  'None',
  'Learn More',
  'Sign Up',
  'Shop Now',
  'Contact Us',
  'Book Now',
  'Subscribe',
  'Link in Bio',
  'Download App',
];

export function PostCreatorModal({
  isOpen,
  onClose,
  onPostCreated,
  initialDate,
}: PostCreatorModalProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<SocialPostType>('TEXT');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>(['twitter', 'linkedin']);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<ConnectedAccount[]>([]);
  const [categories, setCategories] = useState<ContentCategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Media URLs & Uploads
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Scheduling details
  const [action, setAction] = useState<'SCHEDULE' | 'PUBLISH_NOW' | 'SAVE_DRAFT'>('SCHEDULE');
  const [scheduleDate, setScheduleDate] = useState(
    initialDate || new Date(Date.now() + 2 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [scheduleTime, setScheduleTime] = useState('14:30');
  const [timezone, setTimezone] = useState('UTC');

  // Hashtags & CTA
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [callToAction, setCallToAction] = useState('None');

  // Recurrence & Evergreen
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('WEEKLY');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [isEvergreen, setIsEvergreen] = useState(false);

  // Preview tab
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatformId>('twitter');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCategories();
    }
  }, [isOpen]);

  const loadAccountsAndCategories = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        fetch('/api/v1/social/accounts').then((r) => r.json()),
        fetch('/api/v1/posts/categories').then((r) => r.json()),
      ]);

      if (accRes.success && Array.isArray(accRes.data)) {
        setAvailableAccounts(accRes.data);
        if (accRes.data.length > 0 && selectedAccounts.length === 0) {
          setSelectedAccounts(accRes.data.map((a: ConnectedAccount) => a.id));
        }
      }

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !selectedCategory) {
          setSelectedCategory(catRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load accounts or categories', err);
    }
  };

  const togglePlatform = (p: SocialPlatformId) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const toggleAccount = (accId: string) => {
    if (selectedAccounts.includes(accId)) {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== accId));
    } else {
      setSelectedAccounts([...selectedAccounts, accId]);
    }
  };

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(url) || url.includes('video');

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    setUploadError(null);
    setUploadProgressText(`Uploading ${files.length} item(s)...`);

    const newUrls: string[] = [];
    let containsVideo = false;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading ${file.name}...`);
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/v1/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.data?.url) {
          newUrls.push(data.data.url);
          if (data.data.mediaType === 'VIDEO') {
            containsVideo = true;
          }
        } else {
          setUploadError(data.error?.message || `Failed to upload ${file.name}`);
        }
      }

      if (newUrls.length > 0) {
        const combined = [...mediaUrls, ...newUrls];
        setMediaUrls(combined);

        // Auto-switch post format based on count and types
        if (combined.length > 1) {
          setPostType('CAROUSEL');
        } else if (containsVideo || isVideoUrl(newUrls[0])) {
          setPostType('VIDEO');
        } else {
          setPostType('IMAGE');
        }
      }
    } catch {
      setUploadError('Network error uploading media.');
    } finally {
      setIsUploadingMedia(false);
      setUploadProgressText('');
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddMedia = () => {
    if (!mediaInput.trim()) return;
    const url = mediaInput.trim();
    const updated = [...mediaUrls, url];
    setMediaUrls(updated);
    setMediaInput('');
    if (updated.length > 1) {
      setPostType('CAROUSEL');
    } else if (isVideoUrl(url)) {
      setPostType('VIDEO');
    } else {
      setPostType('IMAGE');
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    if (updated.length === 0) {
      setPostType('TEXT');
    } else if (updated.length === 1) {
      setPostType(isVideoUrl(updated[0]) ? 'VIDEO' : 'IMAGE');
    }
  };

  const handleAddHashtag = () => {
    if (!hashtagInput.trim()) return;
    const cleanTag = hashtagInput.trim().replace(/^#/, '');
    if (!hashtags.includes(cleanTag)) {
      setHashtags([...hashtags, cleanTag]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setErrorMessage('Please enter post content.');
      return;
    }

    if (action !== 'SAVE_DRAFT' && selectedAccounts.length === 0) {
      setErrorMessage('Please select at least one social account.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let combinedScheduledAt: string | undefined = undefined;
      if (action === 'SCHEDULE') {
        combinedScheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00Z`).toISOString();
      }

      const payload = {
        workspaceId: 'ws_peak_scale',
        content,
        mediaUrls,
        postType,
        platforms: selectedPlatforms,
        accountIds: selectedAccounts,
        action,
        scheduledAt: combinedScheduledAt,
        timezone,
        hashtags,
        callToAction: callToAction !== 'None' ? callToAction : undefined,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : 'NONE',
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        evergreen: isEvergreen,
        categoryId: selectedCategory || undefined,
      };

      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onPostCreated?.();
        onClose();
      } else {
        setErrorMessage(data.error?.message || 'Failed to schedule post');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while scheduling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentChars = content.length;
  const isOverTwitter = selectedPlatforms.includes('twitter') && currentChars > 280;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Create & Schedule Post</h2>
              <p className="text-xs text-slate-400">Publish immediately or schedule across official platforms.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 columns on desktop */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Post Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Platform Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS_CATALOG.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'text-white border-transparent shadow-xs'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ backgroundColor: isSelected ? p.brandColor : undefined }}
                    >
                      <SocialPlatformIcon platform={p.id} size="sm" showBackground={false} className="w-3.5 h-3.5" />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Selection */}
            {availableAccounts.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Connected Accounts</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAccounts.map((acc) => {
                    const isChecked = selectedAccounts.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccount(acc.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate">{acc.accountName}</div>
                          <div className="text-[10px] text-slate-500 truncate">{acc.accountHandle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Post Content Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Content</label>
                <span
                  className={`text-[11px] font-mono ${
                    isOverTwitter ? 'text-rose-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {currentChars} chars {selectedPlatforms.includes('twitter') && '/ 280'}
                </span>
              </div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? Share insights, case studies, or company news..."
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
              />
              {isOverTwitter && (
                <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>X (Twitter) 280 character limit exceeded. Please trim copy.</span>
                </div>
              )}
            </div>

            {/* Post Type Selector & Rich Media Upload (Photo & Video) */}
            <div className="space-y-3">
              {/* Hidden File Inputs */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleVideoSelect}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>Format</span>
                  {mediaUrls.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-normal">
                      ({mediaUrls.length} file{mediaUrls.length > 1 ? 's' : ''} attached)
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  {(['TEXT', 'IMAGE', 'VIDEO', 'CAROUSEL'] as SocialPostType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        postType === type ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() => photoInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-dashed border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Upload Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="col-span-2 sm:col-span-1 p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => photoInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                {isUploadingMedia ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-semibold py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadProgressText || 'Uploading media file...'}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>Drag &amp; drop photos or videos here, or click to browse</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (Photos up to 15MB, Videos up to 100MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Public URL Input (Toggleable) */}
              {showUrlInput && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste public image or video URL (https://...)"
                      value={mediaInput}
                      onChange={(e) => setMediaInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedia())}
                      className="grow px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedia}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              )}

              {/* Uploaded Media Gallery */}
              {mediaUrls.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Media ({mediaUrls.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mediaUrls.map((url, index) => {
                      const isVid = isVideoUrl(url);
                      return (
                        <div
                          key={url + index}
                          className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between"
                        >
                          <div className="relative h-24 bg-slate-900 flex items-center justify-center overflow-hidden">
                            {isVid ? (
                              <div className="w-full h-full flex items-center justify-center bg-black relative">
                                <video src={url} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Media asset ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Badge */}
                            <span
                              className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                isVid ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {isVid ? 'VIDEO' : 'PHOTO'}
                            </span>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(index)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                              title="Remove media"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-1.5 bg-slate-950 text-[10px] text-slate-400 truncate flex items-center justify-between">
                            <span className="truncate">{url.split('/').pop() || `Asset #${index + 1}`}</span>
                            <span className="text-slate-500 shrink-0 ml-1">#{index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Hashtags & CTA Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hashtags */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Hashtags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="tag (without #)"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                    className="grow px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHashtag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveHashtag(tag)}
                        className="hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Call To Action */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Call To Action (CTA)</label>
                <select
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {CTA_OPTIONS.map((cta) => (
                    <option key={cta} value={cta}>
                      {cta}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Selection */}
            {categories.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Queue Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isEvergreen ? '(Evergreen)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Column: Schedule Settings & Live Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-5 lg:border-l lg:border-slate-800 lg:pl-6">
            {/* Action Mode Pills */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Publishing Mode</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAction('SCHEDULE')}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    action === 'SCHEDULE' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setAction('PUBLISH_NOW')}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    action === 'PUBLISH_NOW' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Publish Now
                </button>
                <button
                  type="button"
                  onClick={() => setAction('SAVE_DRAFT')}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    action === 'SAVE_DRAFT' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Save Draft
                </button>
              </div>
            </div>

            {/* Date, Time & Timezone (When Action is SCHEDULE) */}
            {action === 'SCHEDULE' && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>Timezone</span>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Recurrence & Evergreen Controls */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">Recurring Post</span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <select
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="EVERY_X_DAYS">Every X Days</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value, 10) || 1)}
                    placeholder="Interval"
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Evergreen Recycling</span>
                </div>
                <input
                  type="checkbox"
                  checked={isEvergreen}
                  onChange={(e) => setIsEvergreen(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Real-Time Platform Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Preview</span>
                </label>
                <div className="flex gap-1">
                  {selectedPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreviewPlatform(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        previewPlatform === p ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                    S
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">SocialHive Agency</div>
                    <div className="text-[10px] text-slate-500">
                      {previewPlatform === 'twitter' ? '@socialhivehq • Just now' : 'Sponsored • Public'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {content || 'Your copy preview will render here in real-time...'}
                </div>

                {hashtags.length > 0 && (
                  <div className="text-xs text-indigo-400 space-x-1">
                    {hashtags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                )}

                {mediaUrls.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                    {isVideoUrl(mediaUrls[0]) ? (
                      <video
                        src={mediaUrls[0]}
                        controls
                        className="w-full max-h-44 object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={mediaUrls[0]}
                        alt="Media preview"
                        className="w-full h-36 object-cover"
                      />
                    )}
                    {mediaUrls.length > 1 && (
                      <div className="p-1.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Carousel: Item 1 of {mediaUrls.length}</span>
                        <span className="font-semibold text-indigo-400">+{mediaUrls.length - 1} more items</span>
                      </div>
                    )}
                  </div>
                )}

                {callToAction !== 'None' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">socialhive.app</span>
                    <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px]">
                      {callToAction}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {errorMessage ? (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict zero-simulation policy enforced by platform APIs.</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isOverTwitter}
              className="grow sm:grow-0 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : action === 'PUBLISH_NOW' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Now</span>
                </>
              ) : action === 'SAVE_DRAFT' ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Schedule Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
