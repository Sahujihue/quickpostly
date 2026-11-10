'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { CmsAnnouncementRecord } from '@/lib/cms/repository';

interface AnnouncementBarProps {
  announcements?: CmsAnnouncementRecord[];
}

export function AnnouncementBar({ announcements = [] }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  const bar = announcements.find((a) => a.type === 'BAR' && a.isActive);

  if (!bar || dismissed) return null;

  return (
    <div
      style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
      className="relative z-50 px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto text-center sm:text-left">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse hidden sm:inline" />
          <span>{bar.content}</span>
          {bar.ctaText && bar.ctaLink && (
            <Link
              href={bar.ctaLink}
              className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 transition-opacity ml-1.5"
            >
              <span>{bar.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
