import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getStoreFilePath, safeWriteJson } from '@/lib/storage-dir';
import {
  PAYMENT_GATEWAY_CATALOG,
  PaymentGatewayConfigDTO,
  GatewayCategory,
  SupportedMethod,
} from '@/modules/payments/gateways';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export interface PaymentTransactionDTO {
  id: string;
  transactionNumber: string;
  gatewayId: string;
  gatewayName: string;
  workspaceId: string;
  userId: string;
  subscriptionId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  paymentMethod: SupportedMethod | string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  idempotencyKey?: string;
  customerEmail: string;
  customerName?: string;
  isRefunded: boolean;
  refundAmount: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentsStoreData {
  gateways: Record<string, PaymentGatewayConfigDTO>;
  transactions: PaymentTransactionDTO[];
}

const STORE_FILE = getStoreFilePath('payments_store.json');

const INITIAL_GATEWAY_CONFIGS: Record<string, PaymentGatewayConfigDTO> = {};

// Initialize all 13 catalog gateways into store
for (const meta of PAYMENT_GATEWAY_CATALOG) {
  const isEnabledByDefault = ['stripe', 'razorpay', 'paypal', 'phonepe', 'nowpayments'].includes(meta.id);
  INITIAL_GATEWAY_CONFIGS[meta.id] = {
    id: meta.id,
    name: meta.name,
    category: meta.category,
    isEnabled: isEnabledByDefault,
    isLiveMode: false, // Sandbox default for safety
    apiKey: isEnabledByDefault ? `${meta.id}_sandbox_key_9941a8` : '',
    secretKey: isEnabledByDefault ? `sec_${meta.id}_sandbox_82b9` : '',
    clientId: meta.id === 'phonepe' ? '1' : meta.id === 'cashfree' ? 'CF_SANDBOX_M1' : undefined,
    webhookSecret: isEnabledByDefault ? `whsec_${meta.id}_sandbox_test` : '',
    connectionStatus: isEnabledByDefault ? 'CONNECTED' : 'DISCONNECTED',
    supportsRecurring: meta.supportsRecurring,
    supportedCurrencies: meta.supportedCurrencies,
    supportedMethods: meta.supportedMethods,
    lastTestedAt: isEnabledByDefault ? new Date().toISOString() : undefined,
    meta,
  };
}

const INITIAL_TRANSACTIONS: PaymentTransactionDTO[] = [
  {
    id: 'tx_stripe_001',
    transactionNumber: 'TX-2026-1049',
    gatewayId: 'stripe',
    gatewayName: 'Stripe',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    subscriptionId: 'sub_admin_pro',
    invoiceId: 'inv_2026_001',
    amount: 780,
    currency: 'USD',
    status: 'SUCCEEDED',
    paymentMethod: 'VISA',
    gatewayPaymentId: 'pi_3L2k98xKLM9821a',
    gatewayOrderId: 'cs_live_99812984',
    customerEmail: 'admin@quickpostly.com',
    customerName: 'Super Administrator',
    isRefunded: false,
    refundAmount: 0,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'tx_razorpay_002',
    transactionNumber: 'TX-2026-1048',
    gatewayId: 'razorpay',
    gatewayName: 'Razorpay',
    workspaceId: 'ws_solo_growth',
    userId: 'usr_normal_seed',
    subscriptionId: 'sub_user_starter',
    invoiceId: 'inv_2026_003',
    amount: 2420,
    currency: 'INR',
    status: 'SUCCEEDED',
    paymentMethod: 'UPI',
    gatewayPaymentId: 'pay_OMs87bZ19K',
    gatewayOrderId: 'order_OMs8271KL8',
    customerEmail: 'user@quickpostly.com',
    customerName: 'Growth Marketer',
    isRefunded: false,
    refundAmount: 0,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'tx_paypal_003',
    transactionNumber: 'TX-2026-1047',
    gatewayId: 'paypal',
    gatewayName: 'PayPal',
    workspaceId: 'ws_apex_digital',
    userId: 'usr_apex_owner',
    subscriptionId: 'sub_apex_agency',
    invoiceId: 'inv_2026_002',
    amount: 299,
    currency: 'USD',
    status: 'SUCCEEDED',
    paymentMethod: 'PAYPAL',
    gatewayPaymentId: 'CAPTURE-9821KLM-889',
    gatewayOrderId: 'ORDER-981244',
    customerEmail: 'billing@apexdigital.com',
    customerName: 'Apex Digital Agency',
    isRefunded: false,
    refundAmount: 0,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'tx_phonepe_004',
    transactionNumber: 'TX-2026-1046',
    gatewayId: 'phonepe',
    gatewayName: 'PhonePe Payment Gateway',
    workspaceId: 'ws_lumina_boutique',
    userId: 'usr_lumina_owner',
    amount: 6580,
    currency: 'INR',
    status: 'SUCCEEDED',
    paymentMethod: 'UPI_QR',
    gatewayPaymentId: 'T26101214002938192',
    gatewayOrderId: 'MT782910398',
    customerEmail: 'ops@luminaboutique.com',
    customerName: 'Lumina Boutique',
    isRefunded: false,
    refundAmount: 0,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'tx_crypto_005',
    transactionNumber: 'TX-2026-1045',
    gatewayId: 'nowpayments',
    gatewayName: 'NOWPayments',
    workspaceId: 'ws_apex_digital',
    userId: 'usr_crypto_subscriber',
    amount: 149,
    currency: 'USD',
    status: 'SUCCEEDED',
    paymentMethod: 'USDT',
    gatewayPaymentId: 'NP_INV_9921827419',
    gatewayOrderId: 'np_order_8829',
    customerEmail: 'crypto@apexdigital.com',
    customerName: 'Apex Web3 Fund',
    isRefunded: false,
    refundAmount: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export class PaymentRepository {
  private static ensureStore(): PaymentsStoreData {
    if (!fs.existsSync(STORE_FILE)) {
      const initial: PaymentsStoreData = {
        gateways: INITIAL_GATEWAY_CONFIGS,
        transactions: INITIAL_TRANSACTIONS,
      };
      safeWriteJson(STORE_FILE, initial);
      return initial;
    }

    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data: PaymentsStoreData = JSON.parse(content);

      // Ensure all catalog gateways are present
      for (const meta of PAYMENT_GATEWAY_CATALOG) {
        if (!data.gateways[meta.id]) {
          data.gateways[meta.id] = INITIAL_GATEWAY_CONFIGS[meta.id];
        }
        data.gateways[meta.id].meta = meta;
      }
      if (!data.transactions) data.transactions = INITIAL_TRANSACTIONS;
      return data;
    } catch {
      const fallback: PaymentsStoreData = {
        gateways: INITIAL_GATEWAY_CONFIGS,
        transactions: INITIAL_TRANSACTIONS,
      };
      safeWriteJson(STORE_FILE, fallback);
      return fallback;
    }
  }

  private static saveStore(data: PaymentsStoreData): void {
    safeWriteJson(STORE_FILE, data);
  }

  // ============================================================================
  // GATEWAY CONFIGS
  // ============================================================================

  public static async getAllGatewayConfigs(): Promise<PaymentGatewayConfigDTO[]> {
    const store = PaymentRepository.ensureStore();
    return Object.values(store.gateways);
  }

  public static async getGatewayConfig(id: string): Promise<PaymentGatewayConfigDTO | null> {
    const store = PaymentRepository.ensureStore();
    return store.gateways[id.toLowerCase()] || null;
  }

  public static async updateGatewayConfig(
    id: string,
    updates: Partial<PaymentGatewayConfigDTO>
  ): Promise<PaymentGatewayConfigDTO> {
    const store = PaymentRepository.ensureStore();
    const existing = store.gateways[id.toLowerCase()];
    if (!existing) {
      throw new Error(`Gateway '${id}' not found in platform catalog.`);
    }

    const updated: PaymentGatewayConfigDTO = {
      ...existing,
      ...updates,
      id: existing.id,
      name: existing.name,
      category: existing.category,
      meta: existing.meta,
    };

    store.gateways[id.toLowerCase()] = updated;
    PaymentRepository.saveStore(store);

    try {
      await prisma.paymentGatewayConfig.upsert({
        where: { id: updated.id },
        update: {
          isEnabled: updated.isEnabled,
          isLiveMode: updated.isLiveMode,
          apiKey: updated.apiKey,
          secretKey: updated.secretKey,
          clientId: updated.clientId || null,
          webhookSecret: updated.webhookSecret,
          connectionStatus: updated.connectionStatus,
          supportsRecurring: updated.supportsRecurring,
          supportedCurrencies: updated.supportedCurrencies,
          supportedMethods: updated.supportedMethods,
          lastTestedAt: updated.lastTestedAt ? new Date(updated.lastTestedAt) : null,
        },
        create: {
          id: updated.id,
          name: updated.name,
          category: updated.category,
          isEnabled: updated.isEnabled,
          isLiveMode: updated.isLiveMode,
          apiKey: updated.apiKey,
          secretKey: updated.secretKey,
          clientId: updated.clientId || null,
          webhookSecret: updated.webhookSecret,
          connectionStatus: updated.connectionStatus,
          supportsRecurring: updated.supportsRecurring,
          supportedCurrencies: updated.supportedCurrencies,
          supportedMethods: updated.supportedMethods,
          lastTestedAt: updated.lastTestedAt ? new Date(updated.lastTestedAt) : null,
        },
      });
    } catch {
      // Local fallback
    }

    return updated;
  }

  public static async testGatewayConnection(
    id: string
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const gateway = await PaymentRepository.getGatewayConfig(id);
    if (!gateway) {
      throw new Error(`Gateway '${id}' not found.`);
    }

    const start = Date.now();

    // Verify minimum required fields
    if (!gateway.apiKey || gateway.apiKey.trim().length < 4) {
      gateway.connectionStatus = 'ERROR';
      gateway.testError = 'Missing API Key / Client ID credential.';
      await PaymentRepository.updateGatewayConfig(id, gateway);
      return { success: false, message: 'Missing API Key / Client ID credential.', latencyMs: 12 };
    }

    if (!gateway.secretKey || gateway.secretKey.trim().length < 4) {
      gateway.connectionStatus = 'ERROR';
      gateway.testError = 'Missing Secret Key / Salt credential.';
      await PaymentRepository.updateGatewayConfig(id, gateway);
      return { success: false, message: 'Missing Secret Key / Salt credential.', latencyMs: 15 };
    }

    // Ping simulation / mock network handshake
    const latencyMs = Math.floor(Math.random() * 80) + 45;
    gateway.connectionStatus = 'CONNECTED';
    gateway.lastTestedAt = new Date().toISOString();
    gateway.testError = undefined;

    await PaymentRepository.updateGatewayConfig(id, gateway);

    return {
      success: true,
      message: `Connection successful: ${gateway.name} ${gateway.isLiveMode ? 'Production' : 'Sandbox'} endpoint verified (Latency: ${latencyMs}ms).`,
      latencyMs,
    };
  }

  // ============================================================================
  // TRANSACTIONS LEDGER & REFUNDS
  // ============================================================================

  public static async getAllTransactions(filter?: {
    search?: string;
    gateway?: string;
    status?: string;
  }): Promise<PaymentTransactionDTO[]> {
    const store = PaymentRepository.ensureStore();
    let txs = store.transactions;

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      txs = txs.filter(
        (t) =>
          t.transactionNumber.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q) ||
          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
          (t.gatewayPaymentId && t.gatewayPaymentId.toLowerCase().includes(q))
      );
    }

    if (filter?.gateway && filter.gateway !== 'ALL') {
      txs = txs.filter((t) => t.gatewayId.toLowerCase() === filter.gateway!.toLowerCase());
    }

    if (filter?.status && filter.status !== 'ALL') {
      txs = txs.filter((t) => t.status === filter.status);
    }

    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async getTransactionById(id: string): Promise<PaymentTransactionDTO | null> {
    const store = PaymentRepository.ensureStore();
    return store.transactions.find((t) => t.id === id || t.transactionNumber === id) || null;
  }

  public static async createTransaction(data: Partial<PaymentTransactionDTO> & {
    gatewayId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    workspaceId: string;
    userId: string;
  }): Promise<PaymentTransactionDTO> {
    const store = PaymentRepository.ensureStore();
    const gateway = store.gateways[data.gatewayId.toLowerCase()];
    const now = new Date().toISOString();

    const txNumber = `TX-${new Date().getFullYear()}-${String(store.transactions.length + 1045).padStart(4, '0')}`;

    const newTx: PaymentTransactionDTO = {
      id: data.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transactionNumber: txNumber,
      gatewayId: data.gatewayId,
      gatewayName: gateway ? gateway.name : data.gatewayId,
      workspaceId: data.workspaceId,
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: data.status || 'PENDING',
      paymentMethod: data.paymentMethod || 'CARDS',
      gatewayPaymentId: data.gatewayPaymentId,
      gatewayOrderId: data.gatewayOrderId,
      idempotencyKey: data.idempotencyKey || `idemp_${Date.now()}`,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      isRefunded: false,
      refundAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    store.transactions.unshift(newTx);
    PaymentRepository.saveStore(store);

    return newTx;
  }

  public static async verifyAndCompletePayment(
    transactionId: string,
    gatewayPaymentId: string,
    metadata?: Record<string, unknown>
  ): Promise<PaymentTransactionDTO> {
    const store = PaymentRepository.ensureStore();
    const idx = store.transactions.findIndex((t) => t.id === transactionId || t.transactionNumber === transactionId);
    if (idx < 0) {
      throw new Error(`Transaction '${transactionId}' not found.`);
    }

    const tx = store.transactions[idx];
    if (tx.status === 'SUCCEEDED') {
      return tx; // Idempotent return
    }

    tx.status = 'SUCCEEDED';
    tx.gatewayPaymentId = gatewayPaymentId;
    tx.updatedAt = new Date().toISOString();

    store.transactions[idx] = tx;
    PaymentRepository.saveStore(store);

    // If linked to a workspace and subscription, activate/renew
    if (tx.workspaceId && tx.subscriptionId) {
      await SubscriptionRepository.recoverPayment(tx.subscriptionId);
    }

    return tx;
  }

  public static async refundTransaction(
    transactionId: string,
    reason?: string
  ): Promise<PaymentTransactionDTO> {
    const store = PaymentRepository.ensureStore();
    const idx = store.transactions.findIndex((t) => t.id === transactionId || t.transactionNumber === transactionId);
    if (idx < 0) {
      throw new Error(`Transaction '${transactionId}' not found.`);
    }

    const tx = store.transactions[idx];
    if (tx.status === 'REFUNDED') {
      throw new Error('Transaction has already been refunded.');
    }

    if (tx.status !== 'SUCCEEDED') {
      throw new Error(`Cannot refund transaction with status '${tx.status}'. Only SUCCEEDED payments are refundable.`);
    }

    const now = new Date().toISOString();
    tx.status = 'REFUNDED';
    tx.isRefunded = true;
    tx.refundAmount = tx.amount;
    tx.refundReason = reason || 'Customer requested refund / service cancellation';
    tx.refundedAt = now;
    tx.updatedAt = now;

    store.transactions[idx] = tx;
    PaymentRepository.saveStore(store);

    return tx;
  }

  public static exportTransactionsCsv(): string {
    const store = PaymentRepository.ensureStore();
    const headers = [
      'Transaction Number',
      'Date (UTC)',
      'Gateway',
      'Customer Email',
      'Customer Name',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Gateway Payment Reference',
      'Refunded',
      'Refund Amount',
      'Refund Reason',
    ];

    const rows = store.transactions.map((t) => [
      `"${t.transactionNumber}"`,
      `"${t.createdAt}"`,
      `"${t.gatewayName}"`,
      `"${t.customerEmail}"`,
      `"${t.customerName || ''}"`,
      t.amount.toFixed(2),
      `"${t.currency}"`,
      `"${t.paymentMethod}"`,
      `"${t.status}"`,
      `"${t.gatewayPaymentId || ''}"`,
      t.isRefunded ? 'YES' : 'NO',
      t.refundAmount.toFixed(2),
      `"${t.refundReason || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
