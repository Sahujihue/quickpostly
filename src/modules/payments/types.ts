import { SubscriptionBillingInterval, SubscriptionStatus } from '../subscriptions/types';

export type SupportedPaymentProvider = 'INTERNAL' | 'STRIPE' | 'PAYPAL' | 'LEMONSQUEEZY' | 'MANUAL';

export interface BillingCustomer {
  id: string;
  userId: string;
  email: string;
  name: string;
  provider: SupportedPaymentProvider;
  providerCustomerId?: string;
  defaultPaymentMethod?: string;
  createdAt: string;
}

export interface CreateSubscriptionInput {
  workspaceId: string;
  userId: string;
  planSlug: string;
  interval: SubscriptionBillingInterval;
  customIntervalDays?: number;
  couponCode?: string;
  paymentMethodToken?: string;
  isTrial?: boolean;
}

export interface UpdateSubscriptionInput {
  subscriptionId: string;
  newPlanSlug: string;
  interval?: SubscriptionBillingInterval;
  couponCode?: string;
  immediate?: boolean;
}

export interface CancelSubscriptionInput {
  subscriptionId: string;
  reason?: string;
  cancelImmediately?: boolean;
}

export interface InvoicePreviewResult {
  planName: string;
  interval: SubscriptionBillingInterval;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  couponCode?: string;
  periodStart: string;
  periodEnd: string;
}

export interface BillingTransactionResult {
  success: boolean;
  transactionId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  message?: string;
  nextBillingDate?: string;
}

export interface IBillingProvider {
  readonly providerName: SupportedPaymentProvider;

  createCustomer(user: { id: string; email: string; name: string }): Promise<BillingCustomer>;

  previewInvoice(
    planSlug: string,
    interval: SubscriptionBillingInterval,
    couponCode?: string
  ): Promise<InvoicePreviewResult>;

  createSubscription(input: CreateSubscriptionInput): Promise<BillingTransactionResult>;

  updateSubscription(input: UpdateSubscriptionInput): Promise<BillingTransactionResult>;

  cancelSubscription(input: CancelSubscriptionInput): Promise<BillingTransactionResult>;

  renewSubscription(subscriptionId: string): Promise<BillingTransactionResult>;

  handleFailedPayment(subscriptionId: string, reason?: string): Promise<BillingTransactionResult>;

  retryFailedPayment(subscriptionId: string): Promise<BillingTransactionResult>;

  getPortalUrl?(customerId: string, returnUrl: string): Promise<string>;
}
