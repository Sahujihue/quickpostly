'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Plus, Layers, Filter, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function PostsSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Content Queues & Publishing Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Category-based timetable and scheduled posts for Peak Scale Agency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Categories</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Post to Queue</span>
          </button>
        </div>
      </div>

      {/* Interactive Mock Schedule */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Calendar Active</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          42 posts queued across 4 categories. The BullMQ publishing worker automatically triggers at scheduled time slots.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            &larr; Back to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
