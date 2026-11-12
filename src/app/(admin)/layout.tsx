'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    // Check maintenance mode state from cookie or API
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/quickpostly_maintenance_mode=([^;]+)/);
      if (match) {
        setIsMaintenanceActive(match[1] === 'true');
      }
    }

    fetch('/api/v1/admin/cms/security')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data?.maintenanceMode !== undefined) {
          setIsMaintenanceActive(Boolean(data.data.maintenanceMode));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw]">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Admin Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {isMaintenanceActive && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 mx-auto text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>
                GLOBAL MAINTENANCE MODE IS ACTIVE: Public visitors and regular users are redirected to /maintenance.
              </span>
              <Link
                href="/admin/security"
                className="underline hover:opacity-80 ml-2 bg-white/20 px-2 py-0.5 rounded transition-colors whitespace-nowrap"
              >
                Disable in Security Settings &rarr;
              </Link>
            </div>
          </div>
        )}
        <AdminHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
