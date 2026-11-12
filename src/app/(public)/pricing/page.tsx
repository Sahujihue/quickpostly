import React from 'react';
import { CmsService } from '@/modules/cms';
import { CmsRepository } from '@/lib/cms/repository';
import { PricingView } from '@/components/public/pricing-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pricing & Plans | QuickPostly AI Social Media Management',
  description:
    'Choose the perfect social media management tier. Category scheduling, AI copilot, evergreen queues, and agency approval workflows.',
};

export default async function PricingPage() {
  const [plans, faqs, isFreePlanActive] = await Promise.all([
    CmsService.getPricingPlans(),
    CmsService.getFaqs(),
    CmsRepository.isFreePlanActive(),
  ]);

  const filteredPlans = isFreePlanActive
    ? plans
    : plans.filter((p) => p.slug !== 'free-trial' && p.slug !== 'free_trial' && p.monthlyPrice > 0);

  return <PricingView plans={filteredPlans} faqs={faqs} isFreePlanActive={isFreePlanActive} />;
}
