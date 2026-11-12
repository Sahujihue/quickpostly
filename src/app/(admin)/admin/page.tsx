'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Globe,
  Shield,
  Layers,
  ArrowUpRight,
  Database,
  Server,
} from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System performance, multi-tenant workspace growth, and dynamic CMS controls.
          </p>
        </div>
        <Link
          href="/admin/cms"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Globe className="w-4 h-4" />
          <span>Manage Website CMS &rarr;</span>
        </Link>
      </div>

      {/* 4 Platform KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Total Workspaces</span>
            <Building2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">428</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+36 new this month</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">1,240</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+14.2% MoM growth</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Platform MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">$42,850</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Net retention: 112%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>BullMQ Jobs Dispatched</span>
            <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">184,200</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">99.99% success rate</p>
        </div>
      </div>

      {/* Grid: CMS Quick Access & Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Website CMS Control Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Dynamic Website CMS Architecture</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Zero source-code website and marketing management</p>
              </div>
            </div>
            <Link
              href="/admin/cms"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline"
            >
              Open Full CMS Editor
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Navigation Menus</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage Header links, Legal links & Footer columns dynamically.
              </p>
              <Link href="/admin/cms" className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block pt-1 hover:underline">
                Edit Menus &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pricing Plans</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update prices, feature badges, and plan limits without rebuilding.
              </p>
              <Link href="/admin/cms" className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block pt-1 hover:underline">
                Edit Pricing &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Theme & Global SEO</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure brand primary colors, font families, OG images, and tags.
              </p>
              <Link href="/admin/cms" className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block pt-1 hover:underline">
                Edit Theme & SEO &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* System & Telemetry Health */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">System Infrastructure</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">PostgreSQL (Prisma)</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 dark:border-emerald-800/40">
                Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Redis & BullMQ Queues</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 dark:border-emerald-800/40">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Security Headers (CSP/HSTS)</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 dark:border-emerald-800/40">
                Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
