import React from 'react';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { AnnouncementBar } from '@/components/public/announcement-bar';
import { PromoPopup } from '@/components/public/promo-popup';
import { CmsService } from '@/modules/cms';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerNav, footerNav, headerSettings, footerSettings, announcements] = await Promise.all([
    CmsService.getHeaderNavigation(),
    CmsService.getFooterNavigation(),
    CmsService.getHeaderSettings(),
    CmsService.getFooterSettings(),
    CmsService.getAnnouncements(true),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar announcements={announcements} />
      <PublicHeader navItems={headerNav} settings={headerSettings} />
      <main className="flex-1">{children}</main>
      <PublicFooter primaryLinks={footerNav.primary} legalLinks={footerNav.legal} settings={footerSettings} />
      <PromoPopup announcements={announcements} />
    </div>
  );
}
