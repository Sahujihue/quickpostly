import {
  BillingCustomer,
  BillingTransactionResult,
  CancelSubscriptionInput,
  CreateSubscriptionInput,
  IBillingProvider,
  InvoicePreviewResult,
  SupportedPaymentProvider,
  UpdateSubscriptionInput,
} from './types';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';
import { SubscriptionBillingInterval } from '../subscriptions/types';

export * from './types';

export class InternalBillingProvider implements IBillingProvider {
  public readonly providerName: SupportedPaymentProvider = 'INTERNAL';

  public async createCustomer(user: { id: string; email: string; name: string }): Promise<BillingCustomer> {
    return {
      id: `cust_${user.id}`,
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: 'INTERNAL',
      providerCustomerId: `int_cust_${user.id}`,
      defaultPaymentMethod: 'Visa ending in 4242',
      createdAt: new Date().toISOString(),
    };
  }

  public async previewInvoice(
    planSlug: string,
    interval: SubscriptionBillingInterval,
    couponCode?: string
  ): Promise<InvoicePreviewResult> {
    const plan = await SubscriptionRepository.getPlanBySlug(planSlug);
    if (!plan) {
      throw new Error(`Plan '${planSlug}' not found.`);
    }

    let subtotal = interval === 'YEARLY' ? plan.annualPrice * 12 : plan.monthlyPrice;
    if (interval === 'CUSTOM' && plan.customPrice) {
      subtotal = plan.customPrice;
    }

    let discountAmount = 0;
    if (couponCode) {
      const evalResult = await SubscriptionRepository.validateCoupon(couponCode, plan.slug, subtotal);
      if (evalResult.valid) {
        discountAmount = evalResult.discountAmount;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const now = new Date();
    const days = interval === 'YEARLY' ? 365 : interval === 'CUSTOM' && plan.customIntervalDays ? plan.customIntervalDays : 30;
    const periodEnd = new Date(now.getTime() + days * 86400000);

    return {
      planName: plan.name,
      interval,
      subtotal,
      discountAmount,
      taxAmount: 0,
      totalAmount,
      currency: plan.currency,
      couponCode,
      periodStart: now.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  public async createSubscription(input: CreateSubscriptionInput): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.createSubscription({
      workspaceId: input.workspaceId,
      userId: input.userId,
      planSlug: input.planSlug,
      interval: input.interval,
      customIntervalDays: input.customIntervalDays,
      couponCode: input.couponCode,
      isTrial: input.isTrial,
    });

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: sub.amount,
      currency: sub.currency,
      message: `Subscription successfully initiated on ${sub.planName}.`,
      nextBillingDate: sub.currentPeriodEnd,
    };
  }

  public async updateSubscription(input: UpdateSubscriptionInput): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.upgradeOrDowngradePlan(
      input.subscriptionId,
      input.newPlanSlug,
      input.interval,
      input.couponCode
    );

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: sub.amount,
      currency: sub.currency,
      message: `Subscription modified to ${sub.planName}.`,
      nextBillingDate: sub.currentPeriodEnd,
    };
  }

  public async cancelSubscription(input: CancelSubscriptionInput): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.cancelSubscription(
      input.subscriptionId,
      input.reason,
      input.cancelImmediately
    );

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: 0,
      currency: sub.currency,
      message: input.cancelImmediately
        ? 'Subscription canceled immediately.'
        : 'Subscription cancellation scheduled at billing period end.',
    };
  }

  public async renewSubscription(subscriptionId: string): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.renewSubscription(subscriptionId);
    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: sub.amount,
      currency: sub.currency,
      message: 'Subscription successfully renewed.',
      nextBillingDate: sub.currentPeriodEnd,
    };
  }

  public async handleFailedPayment(subscriptionId: string, reason?: string): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.handlePaymentFailure(subscriptionId, reason);
    return {
      success: false,
      transactionId: `tx_failed_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: sub.amount,
      currency: sub.currency,
      message: `Payment failed. Workspace entered 7-day grace period.`,
    };
  }

  public async retryFailedPayment(subscriptionId: string): Promise<BillingTransactionResult> {
    const sub = await SubscriptionRepository.recoverPayment(subscriptionId);
    return {
      success: true,
      transactionId: `tx_retry_${Date.now()}`,
      subscriptionId: sub.id,
      status: sub.status,
      amount: sub.amount,
      currency: sub.currency,
      message: `Payment charge recovered successfully. Active status restored.`,
    };
  }
}

export class BillingManager {
  private static instance: BillingManager;
  private providers: Map<SupportedPaymentProvider, IBillingProvider> = new Map();
  private activeProvider: SupportedPaymentProvider = 'INTERNAL';

  private constructor() {
    this.providers.set('INTERNAL', new InternalBillingProvider());
    this.providers.set('MANUAL', new InternalBillingProvider());
  }

  public static getInstance(): BillingManager {
    if (!BillingManager.instance) {
      BillingManager.instance = new BillingManager();
    }
    return BillingManager.instance;
  }

  public registerProvider(provider: IBillingProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  public setActiveProvider(name: SupportedPaymentProvider): void {
    if (!this.providers.has(name)) {
      throw new Error(`Billing provider '${name}' is not registered.`);
    }
    this.activeProvider = name;
  }

  public getProvider(name?: SupportedPaymentProvider): IBillingProvider {
    const providerName = name || this.activeProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      return this.providers.get('INTERNAL')!;
    }
    return provider;
  }
}

export const billingManager = BillingManager.getInstance();
