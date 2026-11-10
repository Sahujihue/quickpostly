import React from 'react';
import { CmsService } from '@/modules/cms';
import { HomepageView } from '@/components/public/homepage-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const content = await CmsService.getHomepageContent();

  return <HomepageView content={content} />;
}
