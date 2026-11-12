'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Menu, Shield, Activity, Bell, LogOut, Settings } from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function AdminHeader({ onOpenMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.user) {
          setAdminUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
  };

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 text-slate-900 dark:text-white transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Open admin navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
            Platform Operations
          </span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">&bull;</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Core Services Nominal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" />

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/settings"
            title="Admin & Staff Profile Settings"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 group-hover:ring-2 group-hover:ring-indigo-400 text-white flex items-center justify-center font-bold text-xs transition-all">
              {adminUser?.name ? adminUser.name.slice(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {adminUser?.name || 'Super Admin'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {adminUser?.email || 'admin@quickpostly.com'}
              </span>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            title="Profile & Settings"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of Admin"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
