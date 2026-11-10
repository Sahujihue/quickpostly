'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift, ArrowRight } from 'lucide-react';
import { CmsAnnouncementRecord } from '@/lib/cms/repository';

interface PromoPopupProps {
  announcements?: CmsAnnouncementRecord[];
}

export function PromoPopup({ announcements = [] }: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const popup = announcements.find((a) => a.type === 'POPUP' && a.isActive);

  useEffect(() => {
    if (!popup) return;
    const dismissedKey = `sh_popup_dismissed_${popup.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(dismissedKey)) {
      return;
    }
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [popup]);

  if (!popup || !isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sh_popup_dismissed_${popup.id}`, 'true');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <Gift className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          {popup.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {popup.content}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {popup.ctaText && popup.ctaLink && (
            <Link
              href={popup.ctaLink}
              onClick={handleClose}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-transform active:scale-95"
            >
              <span>{popup.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
