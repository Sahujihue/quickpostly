import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await context.params;
    const body = await req.json();

    const updated = await SubscriptionRepository.updateSubscription(id, {
      planSlug: body.planSlug,
      status: body.status,
      billingInterval: body.billingInterval,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      currency: body.currency,
      currentPeriodEnd: body.currentPeriodEnd,
      trialEnd: body.trialEnd || body.trialEndsAt,
      customNotes: body.customNotes,
    });

    if (!updated) {
      return apiResponse.notFound('Subscription record not found');
    }

    return apiResponse.success(updated, 'Subscriber updated successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Subscriber');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await context.params;

    const success = await SubscriptionRepository.deleteSubscription(id);
    if (!success) {
      return apiResponse.notFound('Subscription record not found');
    }

    return apiResponse.success({ id, deleted: true }, 'Subscriber record deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Subscriber');
  }
}
