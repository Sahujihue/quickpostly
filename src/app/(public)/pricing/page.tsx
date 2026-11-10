import React from 'react';
import { CmsService } from '@/modules/cms';
import { PricingView } from '@/components/public/pricing-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pricing & Plans | QuickPostly AI Social Media Management',
  description:
    'Choose the perfect social media management tier. Category scheduling, AI copilot, evergreen queues, and agency approval workflows.',
};

export default async function PricingPage() {
  const [plans, faqs] = await Promise.all([
    CmsService.getPricingPlans(),
    CmsService.getFaqs(),
  ]);

  return <PricingView plans={plans} faqs={faqs} />;
}
