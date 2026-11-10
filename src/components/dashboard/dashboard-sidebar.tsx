'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Hexagon,
  LayoutDashboard,
  Sparkles,
  Calendar,
  Share2,
  Layers,
  BarChart2,
  Inbox,
  Building2,
  CreditCard,
  Settings,
  ChevronDown,
  X,
  Plus,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Content Studio', path: '/dashboard/ai-studio', icon: Sparkles, badge: 'AI' },
    { label: 'Content Calendar', path: '/dashboard/calendar', icon: Calendar },
    { label: 'Social Accounts', path: '/dashboard/accounts', icon: Share2 },
    { label: 'Publishing Queue', path: '/dashboard/queue', icon: Layers },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { label: 'Social Inbox', path: '/dashboard/inbox', icon: Inbox },
    { label: 'Workspaces', path: '/dashboard/workspaces', icon: Building2 },
    { label: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <BrandLogo size="sm" showBadge={true} badgeText="Studio" href="/dashboard" />
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Multi-Tenant Workspace Selector */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 relative">
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                P
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Peak Scale Agency
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Pro Growth Plan
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                workspaceMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Workspace Switcher */}
          {workspaceMenuOpen && (
            <div className="absolute top-16 left-3 right-3 z-30 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-1 animate-in fade-in-0 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Switch Workspace
              </div>
              <button
                onClick={() => setWorkspaceMenuOpen(false)}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    P
                  </div>
                  <span>Peak Scale Agency</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500">Active</span>
              </button>
              <button
                onClick={() => setWorkspaceMenuOpen(false)}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                    C
                  </div>
                  <span>Cyberdyne Brand</span>
                </div>
              </button>
              <Link
                href="/dashboard/workspaces"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onCloseMobile?.();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage All Workspaces</span>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.label}
                href={item.path}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Fast-Switch & Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Switch to Admin Panel</span>
        </Link>
      </div>
    </aside>
  );
}
