import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionEnforcementService } from '@/lib/subscriptions/enforcement';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';

    const overview = await SubscriptionEnforcementService.getUsageOverview(workspaceId);
    const plans = await SubscriptionRepository.getAllPlans();
    const invoices = await SubscriptionRepository.getInvoicesByWorkspace(workspaceId);

    return apiResponse.success({
      subscription: overview.subscription,
      usage: overview.usage,
      metrics: overview.metrics,
      features: overview.features,
      canOperate: overview.canOperate,
      statusMessage: overview.statusMessage,
      availablePlans: plans,
      invoices,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve subscription overview';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_FETCH_ERROR', status: 500 });
  }
}
