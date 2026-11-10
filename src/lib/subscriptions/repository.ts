import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
  SubscriptionPlanDTO,
  SubscriptionDTO,
  CouponDTO,
  InvoiceDTO,
  WorkspaceUsageDTO,
  SubscriptionAuditLogDTO,
  DEFAULT_COMMERCIAL_PLANS,
  SubscriptionStatus,
  SubscriptionBillingInterval,
  CouponType,
  InvoiceStatus,
} from '@/modules/subscriptions/types';

interface SubscriptionStoreData {
  plans: SubscriptionPlanDTO[];
  subscriptions: SubscriptionDTO[];
  coupons: CouponDTO[];
  invoices: InvoiceDTO[];
  usages: Record<string, WorkspaceUsageDTO>;
  auditLogs: SubscriptionAuditLogDTO[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'subscription_store.json');

const INITIAL_COUPONS: CouponDTO[] = [
  {
    id: 'coup_welcome20',
    code: 'WELCOME20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    currency: 'USD',
    maxRedemptions: 500,
    redemptionsCount: 42,
    perUserLimit: 1,
    applicablePlanSlugs: ['all'],
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'coup_annual50',
    code: 'ANNUAL50',
    discountType: 'FIXED',
    discountValue: 50,
    currency: 'USD',
    maxRedemptions: 200,
    redemptionsCount: 18,
    perUserLimit: 1,
    applicablePlanSlugs: ['professional', 'business', 'agency'],
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'coup_agencypro',
    code: 'AGENCYVIP',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    currency: 'USD',
    maxRedemptions: 50,
    redemptionsCount: 7,
    perUserLimit: 1,
    applicablePlanSlugs: ['agency', 'business'],
    expiresAt: new Date(Date.now() + 120 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_SUBSCRIPTIONS: SubscriptionDTO[] = [
  {
    id: 'sub_admin_pro',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    planId: 'plan_professional',
    planSlug: 'professional',
    planName: 'Professional',
    status: 'ACTIVE',
    billingInterval: 'YEARLY',
    currentPeriodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 335 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    failedPaymentCount: 0,
    discountPercent: 0,
    amount: 780,
    currency: 'USD',
    limits: DEFAULT_COMMERCIAL_PLANS.find((p) => p.slug === 'professional')!.limits,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_user_starter',
    workspaceId: 'ws_solo_growth',
    userId: 'usr_normal_seed',
    planId: 'plan_starter',
    planSlug: 'starter',
    planName: 'Starter',
    status: 'ACTIVE',
    billingInterval: 'MONTHLY',
    currentPeriodStart: new Date(Date.now() - 10 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    failedPaymentCount: 0,
    discountPercent: 0,
    amount: 29,
    currency: 'USD',
    limits: DEFAULT_COMMERCIAL_PLANS.find((p) => p.slug === 'starter')!.limits,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_apex_agency',
    workspaceId: 'ws_apex_digital',
    userId: 'usr_apex_owner',
    planId: 'plan_agency',
    planSlug: 'agency',
    planName: 'Agency',
    status: 'ACTIVE',
    billingInterval: 'MONTHLY',
    currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    failedPaymentCount: 0,
    discountPercent: 0,
    amount: 299,
    currency: 'USD',
    limits: DEFAULT_COMMERCIAL_PLANS.find((p) => p.slug === 'agency')!.limits,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_trial_lumina',
    workspaceId: 'ws_lumina_boutique',
    userId: 'usr_lumina_owner',
    planId: 'plan_free_trial',
    planSlug: 'free-trial',
    planName: 'Free Trial',
    status: 'TRIALING',
    billingInterval: 'MONTHLY',
    currentPeriodStart: new Date(Date.now() - 4 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 10 * 86400000).toISOString(),
    trialStart: new Date(Date.now() - 4 * 86400000).toISOString(),
    trialEnd: new Date(Date.now() + 10 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    failedPaymentCount: 0,
    discountPercent: 0,
    amount: 0,
    currency: 'USD',
    limits: DEFAULT_COMMERCIAL_PLANS.find((p) => p.slug === 'free-trial')!.limits,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_INVOICES: InvoiceDTO[] = [
  {
    id: 'inv_2026_001',
    invoiceNumber: 'INV-2026-001',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    subscriptionId: 'sub_admin_pro',
    planName: 'Professional (Annual)',
    subtotal: 780,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 780,
    currency: 'USD',
    billingInterval: 'YEARLY',
    status: 'PAID',
    periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
    periodEnd: new Date(Date.now() + 335 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    paymentMethod: 'Visa ending in 4242',
    downloadUrl: '/api/v1/subscriptions/invoices/inv_2026_001/download',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'inv_2026_002',
    invoiceNumber: 'INV-2026-002',
    workspaceId: 'ws_apex_digital',
    userId: 'usr_apex_owner',
    subscriptionId: 'sub_apex_agency',
    planName: 'Agency (Monthly)',
    subtotal: 299,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 299,
    currency: 'USD',
    billingInterval: 'MONTHLY',
    status: 'PAID',
    periodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
    periodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    paymentMethod: 'Mastercard ending in 8899',
    downloadUrl: '/api/v1/subscriptions/invoices/inv_2026_002/download',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'inv_2026_003',
    invoiceNumber: 'INV-2026-003',
    workspaceId: 'ws_solo_growth',
    userId: 'usr_normal_seed',
    subscriptionId: 'sub_user_starter',
    planName: 'Starter (Monthly)',
    subtotal: 29,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 29,
    currency: 'USD',
    billingInterval: 'MONTHLY',
    status: 'PAID',
    periodStart: new Date(Date.now() - 10 * 86400000).toISOString(),
    periodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    paymentMethod: 'Amex ending in 1004',
    downloadUrl: '/api/v1/subscriptions/invoices/inv_2026_003/download',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_USAGES: Record<string, WorkspaceUsageDTO> = {
  ws_peak_scale: {
    workspaceId: 'ws_peak_scale',
    socialAccountsCount: 6,
    scheduledPostsCount: 142,
    aiGenerationsUsed: 84,
    aiImageCreditsUsed: 18,
    aiVideoCreditsUsed: 3,
    teamMembersCount: 4,
    clientsCount: 2,
    storageUsedBytes: 4294967296, // 4 GB
    storageUsedMb: 4096,
    lastResetAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  ws_solo_growth: {
    workspaceId: 'ws_solo_growth',
    socialAccountsCount: 2,
    scheduledPostsCount: 28,
    aiGenerationsUsed: 19,
    aiImageCreditsUsed: 4,
    aiVideoCreditsUsed: 0,
    teamMembersCount: 1,
    clientsCount: 0,
    storageUsedBytes: 524288000, // 500 MB
    storageUsedMb: 500,
    lastResetAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  ws_apex_digital: {
    workspaceId: 'ws_apex_digital',
    socialAccountsCount: 28,
    scheduledPostsCount: 1890,
    aiGenerationsUsed: 720,
    aiImageCreditsUsed: 145,
    aiVideoCreditsUsed: 22,
    teamMembersCount: 18,
    clientsCount: 12,
    storageUsedBytes: 42949672960, // 40 GB
    storageUsedMb: 40960,
    lastResetAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  ws_lumina_boutique: {
    workspaceId: 'ws_lumina_boutique',
    socialAccountsCount: 1,
    scheduledPostsCount: 8,
    aiGenerationsUsed: 6,
    aiImageCreditsUsed: 1,
    aiVideoCreditsUsed: 0,
    teamMembersCount: 1,
    clientsCount: 0,
    storageUsedBytes: 104857600, // 100 MB
    storageUsedMb: 100,
    lastResetAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
};

export class SubscriptionRepository {
  private static isInitialized = false;

  private static ensureStore(): SubscriptionStoreData {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      const initial: SubscriptionStoreData = {
        plans: DEFAULT_COMMERCIAL_PLANS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        coupons: INITIAL_COUPONS,
        invoices: INITIAL_INVOICES,
        usages: INITIAL_USAGES,
        auditLogs: [
          {
            id: 'log_seed_1',
            subscriptionId: 'sub_admin_pro',
            action: 'CREATED',
            performedBy: 'SUPER_ADMIN',
            toPlan: 'professional',
            notes: 'Initial seed platform subscription',
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
        ],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      SubscriptionRepository.isInitialized = true;
      return initial;
    }

    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data: SubscriptionStoreData = JSON.parse(content);
      // Ensure all initial plans exist
      if (!data.plans || data.plans.length === 0) {
        data.plans = DEFAULT_COMMERCIAL_PLANS;
      }
      if (!data.coupons) data.coupons = INITIAL_COUPONS;
      if (!data.subscriptions) data.subscriptions = INITIAL_SUBSCRIPTIONS;
      if (!data.invoices) data.invoices = INITIAL_INVOICES;
      if (!data.usages) data.usages = INITIAL_USAGES;
      if (!data.auditLogs) data.auditLogs = [];
      return data;
    } catch {
      const fallback: SubscriptionStoreData = {
        plans: DEFAULT_COMMERCIAL_PLANS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        coupons: INITIAL_COUPONS,
        invoices: INITIAL_INVOICES,
        usages: INITIAL_USAGES,
        auditLogs: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
  }

  private static saveStore(data: SubscriptionStoreData): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ============================================================================
  // PLANS MANAGEMENT
  // ============================================================================

  public static async getAllPlans(): Promise<SubscriptionPlanDTO[]> {
    try {
      const dbPlans = await prisma.subscriptionPlan.findMany({
        orderBy: { order: 'asc' },
      });
      if (dbPlans && dbPlans.length > 0) {
        return dbPlans.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          badge: p.badge || undefined,
          monthlyPrice: p.monthlyPrice,
          annualPrice: p.annualPrice,
          customPrice: p.customPrice || undefined,
          customIntervalDays: p.customIntervalDays || undefined,
          currency: p.currency,
          trialDays: p.trialDays,
          isActive: p.isActive,
          isPopular: p.isPopular,
          order: p.order,
          limits: {
            maxSocialAccounts: p.maxSocialAccounts,
            maxScheduledPosts: p.maxScheduledPosts,
            aiGenerationsMonthly: p.aiGenerationsMonthly,
            aiImageCreditsMonthly: p.aiImageCreditsMonthly,
            aiVideoCreditsMonthly: p.aiVideoCreditsMonthly,
            maxTeamMembers: p.maxTeamMembers,
            maxWorkspaces: p.maxWorkspaces,
            maxClients: p.maxClients,
            storageMb: p.storageMb,
            analyticsRetentionDays: p.analyticsRetentionDays,
            hasSocialInbox: p.hasSocialInbox,
          },
          features: Array.isArray(p.features) ? (p.features as string[]) : [],
        }));
      }
    } catch {
      // Prisma offline or schema migration pending
    }

    const store = SubscriptionRepository.ensureStore();
    return store.plans.sort((a, b) => a.order - b.order);
  }

  public static async getPlanBySlug(slug: string): Promise<SubscriptionPlanDTO | null> {
    const plans = await SubscriptionRepository.getAllPlans();
    return plans.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  public static async savePlan(planData: Partial<SubscriptionPlanDTO> & { name: string }): Promise<SubscriptionPlanDTO> {
    const slug = planData.slug || planData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const store = SubscriptionRepository.ensureStore();

    const existingIdx = store.plans.findIndex((p) => p.slug === slug || (planData.id && p.id === planData.id));

    const limits = {
      maxSocialAccounts: planData.limits?.maxSocialAccounts ?? 5,
      maxScheduledPosts: planData.limits?.maxScheduledPosts ?? 100,
      aiGenerationsMonthly: planData.limits?.aiGenerationsMonthly ?? 50,
      aiImageCreditsMonthly: planData.limits?.aiImageCreditsMonthly ?? 10,
      aiVideoCreditsMonthly: planData.limits?.aiVideoCreditsMonthly ?? 2,
      maxTeamMembers: planData.limits?.maxTeamMembers ?? 2,
      maxWorkspaces: planData.limits?.maxWorkspaces ?? 1,
      maxClients: planData.limits?.maxClients ?? 1,
      storageMb: planData.limits?.storageMb ?? 2048,
      analyticsRetentionDays: planData.limits?.analyticsRetentionDays ?? 30,
      hasSocialInbox: planData.limits?.hasSocialInbox ?? false,
    };

    const newPlan: SubscriptionPlanDTO = {
      id: planData.id || `plan_${Date.now()}`,
      name: planData.name,
      slug,
      description: planData.description || 'Flexible social media management plan.',
      badge: planData.badge || undefined,
      monthlyPrice: Number(planData.monthlyPrice) || 0,
      annualPrice: Number(planData.annualPrice) || 0,
      customPrice: planData.customPrice !== undefined ? Number(planData.customPrice) : undefined,
      customIntervalDays: planData.customIntervalDays !== undefined ? Number(planData.customIntervalDays) : undefined,
      currency: planData.currency || 'USD',
      trialDays: planData.trialDays !== undefined ? Number(planData.trialDays) : 14,
      isActive: planData.isActive ?? true,
      isPopular: planData.isPopular ?? false,
      order: planData.order || (existingIdx >= 0 ? store.plans[existingIdx].order : store.plans.length + 1),
      limits,
      features: planData.features || ['Complete Social Media Smart Queues'],
      ctaText: planData.ctaText || 'Get Started',
      ctaLink: planData.ctaLink || `/signup?plan=${slug}`,
    };

    if (existingIdx >= 0) {
      store.plans[existingIdx] = newPlan;
    } else {
      store.plans.push(newPlan);
    }
    SubscriptionRepository.saveStore(store);

    try {
      await prisma.subscriptionPlan.upsert({
        where: { slug: newPlan.slug },
        update: {
          name: newPlan.name,
          description: newPlan.description,
          badge: newPlan.badge || null,
          monthlyPrice: newPlan.monthlyPrice,
          annualPrice: newPlan.annualPrice,
          customPrice: newPlan.customPrice || null,
          customIntervalDays: newPlan.customIntervalDays || null,
          currency: newPlan.currency,
          trialDays: newPlan.trialDays,
          isActive: newPlan.isActive,
          isPopular: newPlan.isPopular,
          order: newPlan.order,
          maxSocialAccounts: newPlan.limits.maxSocialAccounts,
          maxScheduledPosts: newPlan.limits.maxScheduledPosts,
          aiGenerationsMonthly: newPlan.limits.aiGenerationsMonthly,
          aiImageCreditsMonthly: newPlan.limits.aiImageCreditsMonthly,
          aiVideoCreditsMonthly: newPlan.limits.aiVideoCreditsMonthly,
          maxTeamMembers: newPlan.limits.maxTeamMembers,
          maxWorkspaces: newPlan.limits.maxWorkspaces,
          maxClients: newPlan.limits.maxClients,
          storageMb: newPlan.limits.storageMb,
          analyticsRetentionDays: newPlan.limits.analyticsRetentionDays,
          hasSocialInbox: newPlan.limits.hasSocialInbox,
          features: newPlan.features,
        },
        create: {
          name: newPlan.name,
          slug: newPlan.slug,
          description: newPlan.description,
          badge: newPlan.badge || null,
          monthlyPrice: newPlan.monthlyPrice,
          annualPrice: newPlan.annualPrice,
          customPrice: newPlan.customPrice || null,
          customIntervalDays: newPlan.customIntervalDays || null,
          currency: newPlan.currency,
          trialDays: newPlan.trialDays,
          isActive: newPlan.isActive,
          isPopular: newPlan.isPopular,
          order: newPlan.order,
          maxSocialAccounts: newPlan.limits.maxSocialAccounts,
          maxScheduledPosts: newPlan.limits.maxScheduledPosts,
          aiGenerationsMonthly: newPlan.limits.aiGenerationsMonthly,
          aiImageCreditsMonthly: newPlan.limits.aiImageCreditsMonthly,
          aiVideoCreditsMonthly: newPlan.limits.aiVideoCreditsMonthly,
          maxTeamMembers: newPlan.limits.maxTeamMembers,
          maxWorkspaces: newPlan.limits.maxWorkspaces,
          maxClients: newPlan.limits.maxClients,
          storageMb: newPlan.limits.storageMb,
          analyticsRetentionDays: newPlan.limits.analyticsRetentionDays,
          hasSocialInbox: newPlan.limits.hasSocialInbox,
          features: newPlan.features,
        },
      });
    } catch {
      // Prisma offline
    }

    return newPlan;
  }

  public static async deletePlan(idOrSlug: string): Promise<boolean> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.plans.findIndex((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (idx < 0) return false;

    // Soft delete or remove if unused
    const isUsed = store.subscriptions.some((s) => s.planSlug === store.plans[idx].slug);
    if (isUsed) {
      store.plans[idx].isActive = false;
    } else {
      store.plans.splice(idx, 1);
    }
    SubscriptionRepository.saveStore(store);

    try {
      if (isUsed) {
        await prisma.subscriptionPlan.updateMany({
          where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
          data: { isActive: false },
        });
      } else {
        await prisma.subscriptionPlan.deleteMany({
          where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        });
      }
    } catch {
      // Ignore
    }

    return true;
  }

  public static async togglePlanActive(
    identifier: string,
    forceState?: boolean
  ): Promise<SubscriptionPlanDTO | null> {
    const store = SubscriptionRepository.ensureStore();
    const cleanId = identifier.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const idx = store.plans.findIndex(
      (p) =>
        p.slug === identifier ||
        p.id === identifier ||
        p.slug === cleanId ||
        p.slug.replace(/_/g, '-') === identifier.replace(/_/g, '-')
    );
    if (idx < 0) return null;

    const newState = forceState !== undefined ? forceState : !store.plans[idx].isActive;
    store.plans[idx].isActive = newState;
    SubscriptionRepository.saveStore(store);

    try {
      await prisma.subscriptionPlan.updateMany({
        where: { OR: [{ id: store.plans[idx].id }, { slug: store.plans[idx].slug }] },
        data: { isActive: newState },
      });
    } catch {
      // Prisma offline
    }

    return store.plans[idx];
  }

  // ============================================================================
  // SUBSCRIPTIONS MANAGEMENT
  // ============================================================================

  public static async getSubscriptionByWorkspace(workspaceId: string): Promise<SubscriptionDTO | null> {
    const store = SubscriptionRepository.ensureStore();
    let sub = store.subscriptions.find((s) => s.workspaceId === workspaceId);
    if (!sub) {
      // Default fallback for any workspace: return Starter or Free Trial
      sub = store.subscriptions[0];
    }
    return sub || null;
  }

  public static async getAllSubscriptions(): Promise<SubscriptionDTO[]> {
    const store = SubscriptionRepository.ensureStore();
    return store.subscriptions;
  }

  public static async createSubscription(
    input: {
      workspaceId: string;
      userId: string;
      planSlug: string;
      interval: SubscriptionBillingInterval;
      customIntervalDays?: number;
      couponCode?: string;
      isTrial?: boolean;
    }
  ): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const plan = await SubscriptionRepository.getPlanBySlug(input.planSlug);
    if (!plan) {
      throw new Error(`Plan '${input.planSlug}' not found.`);
    }

    // Check Coupon
    let discountPercent = 0;
    let basePrice = input.interval === 'YEARLY' ? plan.annualPrice * 12 : plan.monthlyPrice;
    if (input.interval === 'CUSTOM' && plan.customPrice) {
      basePrice = plan.customPrice;
    }

    let finalAmount = basePrice;
    if (input.couponCode) {
      const couponEval = await SubscriptionRepository.validateCoupon(input.couponCode, plan.slug, basePrice);
      if (couponEval.valid) {
        finalAmount = couponEval.finalAmount;
        discountPercent = couponEval.discountPercent;
        await SubscriptionRepository.recordRedemption(input.couponCode, input.userId, input.workspaceId, couponEval.discountAmount);
      }
    }

    const now = new Date();
    let periodEnd: Date;
    let status: SubscriptionStatus = 'ACTIVE';
    let trialStart: string | undefined = undefined;
    let trialEnd: string | undefined = undefined;

    if (input.isTrial || plan.monthlyPrice === 0) {
      status = 'TRIALING';
      const days = plan.trialDays || 14;
      periodEnd = new Date(now.getTime() + days * 86400000);
      trialStart = now.toISOString();
      trialEnd = periodEnd.toISOString();
      finalAmount = 0;
    } else if (input.interval === 'YEARLY') {
      periodEnd = new Date(now.getTime() + 365 * 86400000);
    } else if (input.interval === 'CUSTOM' && input.customIntervalDays) {
      periodEnd = new Date(now.getTime() + input.customIntervalDays * 86400000);
    } else {
      periodEnd = new Date(now.getTime() + 30 * 86400000);
    }

    // Replace or update existing
    const existingIdx = store.subscriptions.findIndex((s) => s.workspaceId === input.workspaceId);

    const newSub: SubscriptionDTO = {
      id: existingIdx >= 0 ? store.subscriptions[existingIdx].id : `sub_${Date.now()}`,
      workspaceId: input.workspaceId,
      userId: input.userId,
      planId: plan.id,
      planSlug: plan.slug,
      planName: plan.name,
      status,
      billingInterval: input.interval,
      customIntervalDays: input.customIntervalDays,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialStart,
      trialEnd,
      failedPaymentCount: 0,
      activeCouponCode: input.couponCode || undefined,
      discountPercent,
      amount: finalAmount,
      currency: plan.currency,
      limits: plan.limits,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (existingIdx >= 0) {
      store.subscriptions[existingIdx] = newSub;
    } else {
      store.subscriptions.push(newSub);
    }

    // Create Invoice if non-zero
    if (finalAmount > 0) {
      const invNumber = `INV-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(3, '0')}`;
      const newInvoice: InvoiceDTO = {
        id: `inv_${Date.now()}`,
        invoiceNumber: invNumber,
        workspaceId: input.workspaceId,
        userId: input.userId,
        subscriptionId: newSub.id,
        planName: `${plan.name} (${input.interval})`,
        subtotal: basePrice,
        discountAmount: basePrice - finalAmount,
        taxAmount: 0,
        totalAmount: finalAmount,
        currency: plan.currency,
        billingInterval: input.interval,
        status: 'PAID',
        periodStart: now.toISOString(),
        periodEnd: periodEnd.toISOString(),
        paidAt: now.toISOString(),
        paymentMethod: 'Visa ending in 4242',
        downloadUrl: `/api/v1/subscriptions/invoices/inv_${Date.now()}/download`,
        createdAt: now.toISOString(),
      };
      store.invoices.unshift(newInvoice);
    }

    // Audit Log
    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: newSub.id,
      action: status === 'TRIALING' ? 'TRIAL_STARTED' : 'SUBSCRIPTION_CREATED',
      performedBy: 'USER',
      toPlan: plan.slug,
      notes: `Started subscription on ${plan.name} (${input.interval}) for $${finalAmount}`,
      createdAt: now.toISOString(),
    });

    SubscriptionRepository.saveStore(store);
    return newSub;
  }

  public static async upgradeOrDowngradePlan(
    subscriptionId: string,
    newPlanSlug: string,
    interval?: SubscriptionBillingInterval,
    couponCode?: string
  ): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const subIdx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (subIdx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const currentSub = store.subscriptions[subIdx];
    const newPlan = await SubscriptionRepository.getPlanBySlug(newPlanSlug);
    if (!newPlan) {
      throw new Error(`Target plan '${newPlanSlug}' not found.`);
    }

    const currentPlan = await SubscriptionRepository.getPlanBySlug(currentSub.planSlug);
    const oldPrice = currentSub.amount;
    const chosenInterval = interval || currentSub.billingInterval;

    let basePrice = chosenInterval === 'YEARLY' ? newPlan.annualPrice * 12 : newPlan.monthlyPrice;
    let discountPercent = 0;

    if (couponCode) {
      const couponEval = await SubscriptionRepository.validateCoupon(couponCode, newPlan.slug, basePrice);
      if (couponEval.valid) {
        basePrice = couponEval.finalAmount;
        discountPercent = couponEval.discountPercent;
        await SubscriptionRepository.recordRedemption(couponCode, currentSub.userId, currentSub.workspaceId, couponEval.discountAmount);
      }
    }

    const isUpgrade = basePrice >= oldPrice;
    const now = new Date();
    const periodEnd = chosenInterval === 'YEARLY'
      ? new Date(now.getTime() + 365 * 86400000)
      : new Date(now.getTime() + 30 * 86400000);

    const updatedSub: SubscriptionDTO = {
      ...currentSub,
      planId: newPlan.id,
      planSlug: newPlan.slug,
      planName: newPlan.name,
      status: 'ACTIVE',
      billingInterval: chosenInterval,
      amount: basePrice,
      discountPercent,
      activeCouponCode: couponCode || currentSub.activeCouponCode,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      canceledAt: undefined,
      cancellationReason: undefined,
      limits: newPlan.limits,
      updatedAt: now.toISOString(),
    };

    store.subscriptions[subIdx] = updatedSub;

    // Generate Invoice for Upgrade/Renewal
    if (basePrice > 0) {
      const invNumber = `INV-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(3, '0')}`;
      store.invoices.unshift({
        id: `inv_${Date.now()}`,
        invoiceNumber: invNumber,
        workspaceId: currentSub.workspaceId,
        userId: currentSub.userId,
        subscriptionId: currentSub.id,
        planName: `${newPlan.name} (${chosenInterval})`,
        subtotal: basePrice,
        discountAmount: discountPercent > 0 ? (basePrice * discountPercent) / 100 : 0,
        taxAmount: 0,
        totalAmount: basePrice,
        currency: newPlan.currency,
        billingInterval: chosenInterval,
        status: 'PAID',
        periodStart: now.toISOString(),
        periodEnd: periodEnd.toISOString(),
        paidAt: now.toISOString(),
        paymentMethod: 'Visa ending in 4242',
        downloadUrl: `/api/v1/subscriptions/invoices/inv_${Date.now()}/download`,
        createdAt: now.toISOString(),
      });
    }

    // Audit Log
    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: currentSub.id,
      action: isUpgrade ? 'UPGRADED' : 'DOWNGRADED',
      performedBy: 'USER',
      fromPlan: currentPlan?.slug || currentSub.planSlug,
      toPlan: newPlan.slug,
      notes: `${isUpgrade ? 'Upgraded' : 'Downgraded'} from ${currentSub.planName} to ${newPlan.name} ($${basePrice}/${chosenInterval})`,
      createdAt: now.toISOString(),
    });

    SubscriptionRepository.saveStore(store);
    return updatedSub;
  }

  public static async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    immediate = false
  ): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const sub = store.subscriptions[idx];
    const now = new Date();

    if (immediate) {
      sub.status = 'CANCELED';
      sub.canceledAt = now.toISOString();
      sub.cancellationReason = reason || 'Customer requested immediate cancellation';
      sub.cancelAtPeriodEnd = false;
    } else {
      sub.cancelAtPeriodEnd = true;
      sub.canceledAt = now.toISOString();
      sub.cancellationReason = reason || 'Cancellation scheduled at end of billing cycle';
    }

    sub.updatedAt = now.toISOString();
    store.subscriptions[idx] = sub;

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: sub.id,
      action: 'CANCELED',
      performedBy: 'USER',
      notes: `Cancellation registered: ${sub.cancellationReason} (Immediate: ${immediate})`,
      createdAt: now.toISOString(),
    });

    SubscriptionRepository.saveStore(store);
    return sub;
  }

  public static async renewSubscription(subscriptionId: string): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const sub = store.subscriptions[idx];
    const now = new Date();
    const nextPeriodStart = new Date(sub.currentPeriodEnd);
    const daysToAdd = sub.billingInterval === 'YEARLY' ? 365 : 30;
    const nextPeriodEnd = new Date(nextPeriodStart.getTime() + daysToAdd * 86400000);

    sub.currentPeriodStart = nextPeriodStart.toISOString();
    sub.currentPeriodEnd = nextPeriodEnd.toISOString();
    sub.status = 'ACTIVE';
    sub.failedPaymentCount = 0;
    sub.gracePeriodEnd = undefined;
    sub.updatedAt = now.toISOString();

    // Create renewal invoice
    const invNumber = `INV-${now.getFullYear()}-${String(store.invoices.length + 1).padStart(3, '0')}`;
    store.invoices.unshift({
      id: `inv_${Date.now()}`,
      invoiceNumber: invNumber,
      workspaceId: sub.workspaceId,
      userId: sub.userId,
      subscriptionId: sub.id,
      planName: `${sub.planName} Renewal (${sub.billingInterval})`,
      subtotal: sub.amount,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: sub.amount,
      currency: sub.currency,
      billingInterval: sub.billingInterval,
      status: 'PAID',
      periodStart: nextPeriodStart.toISOString(),
      periodEnd: nextPeriodEnd.toISOString(),
      paidAt: now.toISOString(),
      paymentMethod: 'Visa ending in 4242',
      downloadUrl: `/api/v1/subscriptions/invoices/inv_${Date.now()}/download`,
      createdAt: now.toISOString(),
    });

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: sub.id,
      action: 'RENEWED',
      performedBy: 'SYSTEM',
      notes: `Subscription renewed through ${nextPeriodEnd.toDateString()} for $${sub.amount}`,
      createdAt: now.toISOString(),
    });

    store.subscriptions[idx] = sub;
    SubscriptionRepository.saveStore(store);
    return sub;
  }

  public static async handlePaymentFailure(subscriptionId: string, reason?: string): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const sub = store.subscriptions[idx];
    const now = new Date();
    sub.failedPaymentCount = (sub.failedPaymentCount || 0) + 1;

    // 7-day grace period
    const graceEnd = new Date(now.getTime() + 7 * 86400000);
    sub.gracePeriodEnd = graceEnd.toISOString();
    sub.status = 'GRACE_PERIOD';
    sub.updatedAt = now.toISOString();

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: sub.id,
      action: 'PAYMENT_FAILED',
      performedBy: 'SYSTEM',
      notes: `Billing charge failed (Attempt ${sub.failedPaymentCount}). Entered 7-day grace period ending ${graceEnd.toDateString()}. Reason: ${reason || 'Card declined'}`,
      createdAt: now.toISOString(),
    });

    store.subscriptions[idx] = sub;
    SubscriptionRepository.saveStore(store);
    return sub;
  }

  public static async recoverPayment(subscriptionId: string): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const sub = store.subscriptions[idx];
    sub.status = 'ACTIVE';
    sub.failedPaymentCount = 0;
    sub.gracePeriodEnd = undefined;
    sub.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: sub.id,
      action: 'PAYMENT_RECOVERED',
      performedBy: 'SUPER_ADMIN',
      notes: `Payment retried successfully. Restored active status.`,
      createdAt: new Date().toISOString(),
    });

    store.subscriptions[idx] = sub;
    SubscriptionRepository.saveStore(store);
    return sub;
  }

  public static async extendTrial(subscriptionId: string, additionalDays: number): Promise<SubscriptionDTO> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.subscriptions.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) {
      throw new Error(`Subscription '${subscriptionId}' not found.`);
    }

    const sub = store.subscriptions[idx];
    const currentEnd = new Date(sub.trialEnd || sub.currentPeriodEnd);
    const newEnd = new Date(currentEnd.getTime() + additionalDays * 86400000);

    sub.trialEnd = newEnd.toISOString();
    sub.currentPeriodEnd = newEnd.toISOString();
    sub.status = 'TRIALING';
    sub.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      subscriptionId: sub.id,
      action: 'TRIAL_EXTENDED',
      performedBy: 'SUPER_ADMIN',
      notes: `Extended free trial by ${additionalDays} days until ${newEnd.toDateString()}`,
      createdAt: new Date().toISOString(),
    });

    store.subscriptions[idx] = sub;
    SubscriptionRepository.saveStore(store);
    return sub;
  }

  // ============================================================================
  // COUPONS MANAGEMENT
  // ============================================================================

  public static async getAllCoupons(): Promise<CouponDTO[]> {
    const store = SubscriptionRepository.ensureStore();
    return store.coupons;
  }

  public static async getCouponByCode(code: string): Promise<CouponDTO | null> {
    const store = SubscriptionRepository.ensureStore();
    return (
      store.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase()) || null
    );
  }

  public static async saveCoupon(couponData: Partial<CouponDTO> & { code: string; discountValue: number }): Promise<CouponDTO> {
    const store = SubscriptionRepository.ensureStore();
    const code = couponData.code.trim().toUpperCase();
    const existingIdx = store.coupons.findIndex((c) => c.code === code || (couponData.id && c.id === couponData.id));

    const coupon: CouponDTO = {
      id: couponData.id || `coup_${Date.now()}`,
      code,
      discountType: couponData.discountType || 'PERCENTAGE',
      discountValue: Number(couponData.discountValue),
      currency: couponData.currency || 'USD',
      maxRedemptions: Number(couponData.maxRedemptions) || 100,
      redemptionsCount: existingIdx >= 0 ? store.coupons[existingIdx].redemptionsCount : 0,
      perUserLimit: Number(couponData.perUserLimit) || 1,
      applicablePlanSlugs: couponData.applicablePlanSlugs || ['all'],
      expiresAt: couponData.expiresAt || undefined,
      isActive: couponData.isActive ?? true,
      createdAt: existingIdx >= 0 ? store.coupons[existingIdx].createdAt : new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      store.coupons[existingIdx] = coupon;
    } else {
      store.coupons.push(coupon);
    }

    SubscriptionRepository.saveStore(store);
    return coupon;
  }

  public static async deleteCoupon(idOrCode: string): Promise<boolean> {
    const store = SubscriptionRepository.ensureStore();
    const idx = store.coupons.findIndex((c) => c.id === idOrCode || c.code === idOrCode.toUpperCase());
    if (idx < 0) return false;

    store.coupons.splice(idx, 1);
    SubscriptionRepository.saveStore(store);
    return true;
  }

  public static async validateCoupon(
    code: string,
    planSlug: string,
    amount: number
  ): Promise<{
    valid: boolean;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  }> {
    const coupon = await SubscriptionRepository.getCouponByCode(code);
    if (!coupon) {
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, message: 'Invalid coupon code.' };
    }

    if (!coupon.isActive) {
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, message: 'This coupon is no longer active.' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, message: 'This coupon has expired.' };
    }

    if (coupon.redemptionsCount >= coupon.maxRedemptions) {
      return { valid: false, discountPercent: 0, discountAmount: 0, finalAmount: amount, message: 'Coupon maximum redemptions reached.' };
    }

    // Check Plan restrictions
    const isPlanAllowed =
      coupon.applicablePlanSlugs.includes('all') ||
      coupon.applicablePlanSlugs.includes(planSlug.toLowerCase());

    if (!isPlanAllowed) {
      return {
        valid: false,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: amount,
        message: `This coupon is not valid for the ${planSlug} tier.`,
      };
    }

    let discountAmount = 0;
    let discountPercent = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountPercent = coupon.discountValue;
      discountAmount = Math.round(((amount * coupon.discountValue) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(amount, coupon.discountValue);
      discountPercent = Math.round((discountAmount / amount) * 100);
    }

    const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);

    return {
      valid: true,
      discountPercent,
      discountAmount,
      finalAmount,
      message: `Coupon '${coupon.code}' applied! You save $${discountAmount}.`,
    };
  }

  public static async recordRedemption(code: string, userId: string, workspaceId: string, discountAmount: number): Promise<void> {
    const store = SubscriptionRepository.ensureStore();
    const coupon = store.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.redemptionsCount += 1;
      SubscriptionRepository.saveStore(store);
    }
  }

  // ============================================================================
  // INVOICES MANAGEMENT
  // ============================================================================

  public static async getInvoicesByWorkspace(workspaceId: string): Promise<InvoiceDTO[]> {
    const store = SubscriptionRepository.ensureStore();
    return store.invoices.filter((i) => i.workspaceId === workspaceId || workspaceId === 'ALL');
  }

  public static async getAllInvoices(): Promise<InvoiceDTO[]> {
    const store = SubscriptionRepository.ensureStore();
    return store.invoices;
  }

  public static async getInvoiceById(id: string): Promise<InvoiceDTO | null> {
    const store = SubscriptionRepository.ensureStore();
    return store.invoices.find((i) => i.id === id || i.invoiceNumber === id) || null;
  }

  // ============================================================================
  // WORKSPACE USAGE & LIMITS
  // ============================================================================

  public static async getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsageDTO> {
    const store = SubscriptionRepository.ensureStore();
    if (!store.usages[workspaceId]) {
      store.usages[workspaceId] = {
        workspaceId,
        socialAccountsCount: 2,
        scheduledPostsCount: 15,
        aiGenerationsUsed: 12,
        aiImageCreditsUsed: 2,
        aiVideoCreditsUsed: 0,
        teamMembersCount: 1,
        clientsCount: 0,
        storageUsedBytes: 104857600, // 100 MB
        storageUsedMb: 100,
        lastResetAt: new Date().toISOString(),
      };
      SubscriptionRepository.saveStore(store);
    }
    return store.usages[workspaceId];
  }

  public static async incrementUsage(
    workspaceId: string,
    metric: keyof Omit<WorkspaceUsageDTO, 'workspaceId' | 'lastResetAt'>,
    amount = 1
  ): Promise<WorkspaceUsageDTO> {
    const store = SubscriptionRepository.ensureStore();
    const usage = await SubscriptionRepository.getWorkspaceUsage(workspaceId);
    (usage[metric] as number) = ((usage[metric] as number) || 0) + amount;
    if (metric === 'storageUsedBytes') {
      usage.storageUsedMb = Math.round(usage.storageUsedBytes / (1024 * 1024));
    }
    store.usages[workspaceId] = usage;
    SubscriptionRepository.saveStore(store);
    return usage;
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  public static async getSubscriptionLogs(subscriptionId?: string): Promise<SubscriptionAuditLogDTO[]> {
    const store = SubscriptionRepository.ensureStore();
    if (subscriptionId) {
      return store.auditLogs.filter((l) => l.subscriptionId === subscriptionId);
    }
    return store.auditLogs;
  }
}
