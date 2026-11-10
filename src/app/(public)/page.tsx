import React from 'react';
import { CmsService } from '@/modules/cms';
import { HomepageView } from '@/components/public/homepage-view';

export const revalidate = 60; // Revalidate every minute for dynamic CMS updates

export default async function HomePage() {
  const content = await CmsService.getHomepageContent();

  return <HomepageView content={content} />;
}
