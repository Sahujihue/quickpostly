import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'System Maintenance | QuickPostly',
  description: 'QuickPostly is undergoing scheduled system upgrades. We will be back online shortly.',
};

export default async function MaintenancePage() {
  const { message } = await CmsRepository.isMaintenanceMode();
  const displayMessage =
    message ||
    'QuickPostly is currently undergoing scheduled platform upgrades to enhance system reliability, queue throughput, and AI generation performance. We will be back online shortly.';

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 md:p-10 transition-colors">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <BrandLogo size="md" brandName="QuickPostly" href="/" />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Scheduled Maintenance</span>
          </span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-2xl mx-auto w-full my-auto py-12 text-center space-y-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-2xl transform scale-150" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 p-[1px] shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full rounded-[23px] bg-white dark:bg-slate-900 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            We&apos;re Upgrading QuickPostly
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Status Points Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left space-y-3.5 max-w-lg mx-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            System Operational Status
          </div>
          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Scheduled Queues:</strong> Posts and automated queues remain safely buffered.
            </span>
          </div>
          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Estimated Duration:</strong> Maintenance usually concludes within 15–30 minutes.
            </span>
          </div>
          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Data Security:</strong> All accounts, credentials, and assets are fully protected.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Platform Status</span>
          </a>

          <a
            href="mailto:support@quickpostly.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Contact Support</span>
          </a>
        </div>
      </main>

      {/* Footer & Admin Bypass Link */}
      <footer className="max-w-5xl mx-auto w-full pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} QuickPostly SaaS. All rights reserved.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 font-semibold transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Staff / Administrator Login</span>
        </Link>
      </footer>
    </div>
  );
}
