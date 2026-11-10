export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'CANCELED'
  | 'EXPIRED';

export type SubscriptionBillingInterval = 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface PlanLimits {
  maxSocialAccounts: number;
  maxScheduledPosts: number;
  aiGenerationsMonthly: number;
  aiImageCreditsMonthly: number;
  aiVideoCreditsMonthly: number;
  maxTeamMembers: number;
  maxWorkspaces: number;
  maxClients: number;
  storageMb: number;
  analyticsRetentionDays: number;
  hasSocialInbox: boolean;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number; // Price billed monthly equivalent or full annual
  customPrice?: number;
  customIntervalDays?: number;
  currency: string;
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  order: number;
  limits: PlanLimits;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
}

export interface SubscriptionDTO {
  id: string;
  workspaceId: string;
  userId: string;
  planId: string;
  planSlug: string;
  planName: string;
  status: SubscriptionStatus;
  billingInterval: SubscriptionBillingInterval;
  customIntervalDays?: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancellationReason?: string;
  trialStart?: string;
  trialEnd?: string;
  gracePeriodEnd?: string;
  failedPaymentCount: number;
  activeCouponCode?: string;
  discountPercent: number;
  amount: number;
  currency: string;
  limits: PlanLimits;
  createdAt: string;
  updatedAt: string;
}

export interface CouponDTO {
  id: string;
  code: string;
  discountType: CouponType;
  discountValue: number;
  currency: string;
  maxRedemptions: number;
  redemptionsCount: number;
  perUserLimit: number;
  applicablePlanSlugs: string[]; // ['all'] or specific slugs
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  workspaceId: string;
  userId: string;
  subscriptionId?: string;
  planName: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  billingInterval: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  paymentMethod?: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface WorkspaceUsageDTO {
  workspaceId: string;
  socialAccountsCount: number;
  scheduledPostsCount: number;
  aiGenerationsUsed: number;
  aiImageCreditsUsed: number;
  aiVideoCreditsUsed: number;
  teamMembersCount: number;
  clientsCount: number;
  storageUsedBytes: number;
  storageUsedMb: number;
  lastResetAt: string;
}

export interface SubscriptionAuditLogDTO {
  id: string;
  subscriptionId: string;
  action: string;
  performedBy: string;
  fromPlan?: string;
  toPlan?: string;
  notes?: string;
  createdAt: string;
}

export const DEFAULT_COMMERCIAL_PLANS: SubscriptionPlanDTO[] = [
  {
    id: 'plan_free_trial',
    name: 'Free Trial',
    slug: 'free-trial',
    description: '14-day fully featured sandbox trial for exploring SocialHive automation.',
    badge: '14 Days Free',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    order: 1,
    limits: {
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
    features: [
      '3 Social Media Profiles',
      '30 Scheduled Queue Slots',
      '25 AI Copilot Text Generations',
      '5 AI Social Image Credits',
      'Basic Performance Analytics (14 Days)',
      'Evergreen Category Recycling',
      'Single User Workspace',
    ],
    ctaText: 'Start 14-Day Free Trial',
    ctaLink: '/signup',
  },
  {
    id: 'plan_starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for solo creators, consultants, and emerging brands launching smart queues.',
    badge: 'Essential',
    monthlyPrice: 29,
    annualPrice: 24, // $288 / year
    currency: 'USD',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    order: 2,
    limits: {
      maxSocialAccounts: 5,
      maxScheduledPosts: 150,
      aiGenerationsMonthly: 75,
      aiImageCreditsMonthly: 15,
      aiVideoCreditsMonthly: 2,
      maxTeamMembers: 2,
      maxWorkspaces: 1,
      maxClients: 1,
      storageMb: 2048,
      analyticsRetentionDays: 30,
      hasSocialInbox: false,
    },
    features: [
      '5 Connected Social Accounts',
      '150 Scheduled Posts in Queue',
      '75 AI Text Generations / month',
      '15 AI Graphic Credits / month',
      '2 AI Video Clip Credits / month',
      '2 Team Member Seats',
      '1 Client Brand Portal',
      '2 GB Cloud Asset Storage',
      '30-Day Historical Analytics',
    ],
    ctaText: 'Choose Starter',
    ctaLink: '/signup?plan=starter',
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    slug: 'professional',
    description: 'High-velocity growth engine for growing businesses and content marketing teams.',
    badge: 'Most Popular',
    monthlyPrice: 79,
    annualPrice: 65, // $780 / year
    currency: 'USD',
    trialDays: 14,
    isActive: true,
    isPopular: true,
    order: 3,
    limits: {
      maxSocialAccounts: 15,
      maxScheduledPosts: 750,
      aiGenerationsMonthly: 300,
      aiImageCreditsMonthly: 60,
      aiVideoCreditsMonthly: 15,
      maxTeamMembers: 5,
      maxWorkspaces: 3,
      maxClients: 5,
      storageMb: 10240,
      analyticsRetentionDays: 90,
      hasSocialInbox: true,
    },
    features: [
      '15 Connected Social Accounts',
      '750 Scheduled Posts in Queue',
      '300 AI Copilot Generations / mo',
      '60 AI Graphic Credits / mo',
      '15 AI Video Clip Credits / mo',
      '5 Team Member Seats',
      '3 Isolated Workspaces',
      '5 Dedicated Client Portals',
      'Unified Social Inbox (Comments & DMs)',
      '10 GB Cloud Asset Storage',
      '90-Day Advanced ROI Analytics',
    ],
    ctaText: 'Choose Professional',
    ctaLink: '/signup?plan=professional',
  },
  {
    id: 'plan_business',
    name: 'Business',
    slug: 'business',
    description: 'Engineered for scaling enterprises, multi-brand ventures, and high-frequency publishers.',
    badge: 'Best Value',
    monthlyPrice: 149,
    annualPrice: 119, // $1,428 / year
    currency: 'USD',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    order: 4,
    limits: {
      maxSocialAccounts: 35,
      maxScheduledPosts: 2500,
      aiGenerationsMonthly: 800,
      aiImageCreditsMonthly: 200,
      aiVideoCreditsMonthly: 40,
      maxTeamMembers: 15,
      maxWorkspaces: 10,
      maxClients: 15,
      storageMb: 51200,
      analyticsRetentionDays: 180,
      hasSocialInbox: true,
    },
    features: [
      '35 Connected Social Accounts',
      '2,500 Scheduled Posts in Queue',
      '800 AI Generations / mo',
      '200 AI Graphic Credits / mo',
      '40 AI Video Clip Credits / mo',
      '15 Team Member Seats',
      '10 Isolated Workspaces',
      '15 Client Brand Portals',
      'Priority Multi-Network Inbox',
      'Client Review & Approval Workflows',
      '50 GB Cloud Asset Storage',
      '180-Day Analytics & CSV Export',
    ],
    ctaText: 'Choose Business',
    ctaLink: '/signup?plan=business',
  },
  {
    id: 'plan_agency',
    name: 'Agency',
    slug: 'agency',
    description: 'Unlimited agency scalability with white-label portals, client approvals, and bespoke quotas.',
    badge: 'Agency Scale',
    monthlyPrice: 299,
    annualPrice: 239, // $2,868 / year
    currency: 'USD',
    trialDays: 14,
    isActive: true,
    isPopular: false,
    order: 5,
    limits: {
      maxSocialAccounts: 100,
      maxScheduledPosts: 10000,
      aiGenerationsMonthly: 2500,
      aiImageCreditsMonthly: 600,
      aiVideoCreditsMonthly: 120,
      maxTeamMembers: 50,
      maxWorkspaces: 30,
      maxClients: 50,
      storageMb: 256000,
      analyticsRetentionDays: 365,
      hasSocialInbox: true,
    },
    features: [
      '100 Connected Social Accounts',
      '10,000 Scheduled Posts in Queue',
      '2,500 AI Copilot Generations / mo',
      '600 AI Graphic Credits / mo',
      '120 AI Video Clip Credits / mo',
      '50 Team Member Seats',
      '30 Isolated Workspaces',
      '50 White-Label Client Portals',
      'Real-Time Omnichannel Social Inbox',
      'Custom Multi-Stage Approvals',
      '250 GB Cloud Asset Storage',
      '365-Day Historical Analytics & White-Label Reports',
      'Dedicated Slack Support & Account Executive',
    ],
    ctaText: 'Choose Agency',
    ctaLink: '/signup?plan=agency',
  },
];
