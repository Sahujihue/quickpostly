import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || 'ALL';
    const plan = searchParams.get('plan') || 'ALL';

    const allSubs = await SubscriptionRepository.getAllSubscriptions();

    const filtered = allSubs.filter((s) => {
      const matchesSearch =
        !search ||
        s.workspaceId.toLowerCase().includes(search) ||
        s.planName.toLowerCase().includes(search) ||
        s.userId.toLowerCase().includes(search);

      const matchesStatus = status === 'ALL' || s.status === status;
      const matchesPlan = plan === 'ALL' || s.planSlug === plan || s.planName.toLowerCase() === plan.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });

    // Compute platform telemetry
    const totalSubscribers = allSubs.length;
    const activeSubs = allSubs.filter((s) => s.status === 'ACTIVE');
    const trialingSubs = allSubs.filter((s) => s.status === 'TRIALING');
    const pastDueSubs = allSubs.filter((s) => s.status === 'PAST_DUE' || s.status === 'GRACE_PERIOD');
    const canceledSubs = allSubs.filter((s) => s.status === 'CANCELED');

    const totalMRR = allSubs.reduce((acc, s) => {
      if (s.status !== 'ACTIVE' && s.status !== 'GRACE_PERIOD') return acc;
      if (s.billingInterval === 'YEARLY') {
        return acc + Math.round(s.amount / 12);
      }
      return acc + s.amount;
    }, 0);

    const churnRate = totalSubscribers > 0
      ? Math.round((canceledSubs.length / totalSubscribers) * 100 * 10) / 10
      : 0;

    return apiResponse.success({
      subscriptions: filtered,
      telemetry: {
        totalSubscribers,
        activeCount: activeSubs.length,
        trialingCount: trialingSubs.length,
        pastDueCount: pastDueSubs.length,
        canceledCount: canceledSubs.length,
        totalMRR,
        churnRate,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin subscriptions';
    return apiResponse.error({ message, code: 'ADMIN_SUBSCRIPTIONS_ERROR', status: 500 });
  }
}
