import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const plans = await CmsRepository.getPricingPlans();
    return apiResponse.success(plans);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Pricing Plans');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();

    if (!body.name || body.monthlyPrice === undefined || body.annualPrice === undefined) {
      return apiResponse.badRequest('Plan name, monthlyPrice, and annualPrice are required');
    }

    const saved = await CmsRepository.savePricingPlan(body);

    // Sync to SubscriptionRepository
    try {
      const limits = body.limitsJson || {};
      await SubscriptionRepository.savePlan({
        id: saved.id,
        slug: saved.slug,
        name: saved.name,
        description: saved.description,
        badge: saved.badge || undefined,
        monthlyPrice: saved.monthlyPrice,
        annualPrice: saved.annualPrice,
        currency: saved.currency,
        features: saved.features,
        isActive: saved.isActive,
        isPopular: saved.isPopular,
        order: saved.order,
        trialDays: body.trialDays ? Number(body.trialDays) : 14,
        customPrice: body.customPrice !== undefined ? Number(body.customPrice) : undefined,
        customIntervalDays: body.customIntervalDays !== undefined ? Number(body.customIntervalDays) : undefined,
        limits: {
          maxSocialAccounts: limits.maxSocialAccounts ?? limits.maxAccounts ?? 5,
          maxScheduledPosts: limits.maxScheduledPosts ?? 100,
          aiGenerationsMonthly: limits.aiGenerationsMonthly ?? limits.aiCredits ?? 50,
          aiImageCreditsMonthly: limits.aiImageCreditsMonthly ?? 10,
          aiVideoCreditsMonthly: limits.aiVideoCreditsMonthly ?? 2,
          maxTeamMembers: limits.maxTeamMembers ?? 2,
          maxWorkspaces: limits.maxWorkspaces ?? 1,
          maxClients: limits.maxClients ?? 1,
          storageMb: limits.storageMb ?? 2048,
          analyticsRetentionDays: limits.analyticsRetentionDays ?? 30,
          hasSocialInbox: limits.hasSocialInbox ?? false,
        },
      });
    } catch {
      // Ignore if sync error
    }

    return apiResponse.success(saved, 'Pricing plan saved successfully', 200);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Save Pricing Plan');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiResponse.badRequest('Missing plan id');

    await CmsRepository.deletePricingPlan(id);
    await SubscriptionRepository.deletePlan(id);
    return apiResponse.success({ id }, 'Pricing plan deleted successfully');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Pricing Plan');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);
    const body = await req.json();
    const { id, slug, isActive } = body;

    const identifier = id || slug || 'free-trial';
    let updatedCms = await CmsRepository.togglePricingPlanActive(identifier, isActive);
    let updatedSub = await SubscriptionRepository.togglePlanActive(identifier, isActive);

    if (
      !updatedCms &&
      !updatedSub &&
      (identifier === 'plan_free_trial' || identifier === 'free-trial' || identifier === 'free_trial')
    ) {
      // Auto-provision Free Trial tier in CMS if missing
      await CmsRepository.savePricingPlan({
        id: 'plan_free_trial',
        slug: 'free-trial',
        name: 'Free Trial',
        description: '14-day fully featured sandbox trial for exploring SocialHive automation.',
        badge: '14 Days Free',
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',
        features: [
          '3 Social Media Profiles',
          '30 Scheduled Queue Slots',
          '25 AI Copilot Text Generations',
          '5 AI Social Image Credits',
          'Basic Performance Analytics (14 Days)',
          'Evergreen Category Recycling',
          'Single User Workspace',
        ],
        limitsJson: {
          maxSocialAccounts: 3,
          maxScheduledPosts: 30,
          aiGenerationsMonthly: 25,
          aiImageCreditsMonthly: 5,
          aiVideoCreditsMonthly: 0,
          maxTeamMembers: 1,
          maxWorkspaces: 1,
          maxClients: 0,
          storageMb: 500,
          analyticsRetentionDays: 14,
          hasSocialInbox: false,
        },
        isPopular: false,
        isActive: isActive !== undefined ? isActive : true,
        order: 1,
        ctaText: 'Start 14-Day Free Trial',
        ctaLink: '/signup?plan=free-trial',
      });
      updatedCms = await CmsRepository.togglePricingPlanActive(identifier, isActive);
      updatedSub = await SubscriptionRepository.togglePlanActive(identifier, isActive);
    }

    if (!updatedCms && !updatedSub) {
      return apiResponse.notFound('Pricing plan not found');
    }

    const currentStatus = (updatedCms || updatedSub)?.isActive;
    const response = apiResponse.success(
      updatedCms || updatedSub,
      `Plan '${identifier}' is now ${currentStatus ? 'Active (ON)' : 'Disabled (OFF)'}`
    );

    if (
      identifier.toLowerCase().includes('free') ||
      identifier.toLowerCase().includes('trial') ||
      updatedCms?.monthlyPrice === 0
    ) {
      (globalThis as any).__QUICKPOSTLY_FREE_PLAN_ACTIVE__ = Boolean(currentStatus);
      response.cookies.set('quickpostly_free_plan_active', String(Boolean(currentStatus)), {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    return apiResponse.handle(error, 'Admin Toggle Pricing Plan Status');
  }
}
