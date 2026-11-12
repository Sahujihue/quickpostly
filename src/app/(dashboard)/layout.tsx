'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    // Check maintenance mode state
    const isMaintenance =
      typeof document !== 'undefined' &&
      document.cookie.includes('quickpostly_maintenance_mode=true');

    if (isMaintenance) {
      setIsMaintenanceActive(true);
      // Verify if current user is admin
      fetch('/api/v1/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const user = data?.data?.user;
          const isAdmin =
            user?.role === 'SUPER_ADMIN' ||
            user?.role === 'ADMIN' ||
            user?.role === 'CONTENT_MANAGER' ||
            user?.role === 'SUPPORT';
          if (!isAdmin) {
            router.push('/maintenance');
          }
        })
        .catch(() => {
          router.push('/maintenance');
        });
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw]">
            <DashboardSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {isMaintenanceActive && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 mx-auto text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>
                GLOBAL MAINTENANCE MODE IS ACTIVE: Regular users are redirected to /maintenance.
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
        <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
