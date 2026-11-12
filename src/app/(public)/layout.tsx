import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { AnnouncementBar } from '@/components/public/announcement-bar';
import { PromoPopup } from '@/components/public/promo-popup';
import { CmsService } from '@/modules/cms';
import { CmsRepository } from '@/lib/cms/repository';
import { decodeEdgeSessionToken } from '@/lib/auth/jwt-edge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fail-safe Maintenance Mode Enforcement
  const maintenance = await CmsRepository.isMaintenanceMode();
  let isAdminViewing = false;

  if (maintenance.enabled) {
    try {
      const cookieStore = await cookies();
      const token =
        cookieStore.get('quickpostly_session')?.value ||
        cookieStore.get('socialhive_session')?.value;
      const session = token ? decodeEdgeSessionToken(token) : null;
      isAdminViewing = Boolean(
        session?.isSuperAdmin ||
        session?.role === 'SUPER_ADMIN' ||
        session?.role === 'ADMIN' ||
        session?.role === 'CONTENT_MANAGER' ||
        session?.role === 'SUPPORT'
      );
    } catch {
      isAdminViewing = false;
    }

    if (!isAdminViewing) {
      redirect('/maintenance');
    }
  }

  const [headerNav, footerNav, headerSettings, footerSettings, announcements, isFreePlanActive] = await Promise.all([
    CmsService.getHeaderNavigation(),
    CmsService.getFooterNavigation(),
    CmsService.getHeaderSettings(),
    CmsService.getFooterSettings(),
    CmsService.getAnnouncements(true),
    CmsRepository.isFreePlanActive(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {isAdminViewing && maintenance.enabled && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>
              GLOBAL MAINTENANCE MODE IS ACTIVE: Public visitors are seeing the maintenance page.
            </span>
            <Link
              href="/admin/security"
              className="underline ml-2 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
            >
              Disable in Security Settings &rarr;
            </Link>
          </div>
        </div>
      )}
      <AnnouncementBar announcements={announcements} />
      <PublicHeader navItems={headerNav} settings={headerSettings} isFreePlanActive={isFreePlanActive} />
      <main className="flex-1">{children}</main>
      <PublicFooter primaryLinks={footerNav.primary} legalLinks={footerNav.legal} settings={footerSettings} />
      <PromoPopup announcements={announcements} />
    </div>
  );
}
