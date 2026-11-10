export type GatewayCategory = 'INDIAN' | 'INTERNATIONAL' | 'CRYPTO';

export type SupportedMethod =
  | 'UPI'
  | 'UPI_QR'
  | 'INDIAN_CARDS'
  | 'INTERNATIONAL_CARDS'
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'NET_BANKING'
  | 'WALLETS'
  | 'PAYPAL'
  | 'BTC'
  | 'ETH'
  | 'USDT'
  | 'USDC'
  | 'LTC';

export interface PaymentGatewayMeta {
  id: string;
  name: string;
  category: GatewayCategory;
  description: string;
  brandColor: string;
  badgeText: string;
  supportedCurrencies: string[];
  supportedMethods: SupportedMethod[];
  supportsRecurring: boolean;
  requiresMerchantApproval: boolean;
  supportedCountries: string[]; // e.g. ['IN'], ['GLOBAL'], ['US', 'EU']
  fields: {
    apiKeyLabel: string;
    secretKeyLabel: string;
    clientIdLabel?: string;
    webhookSecretLabel: string;
  };
}

export interface PaymentGatewayConfigDTO {
  id: string;
  name: string;
  category: GatewayCategory;
  isEnabled: boolean;
  isLiveMode: boolean;
  apiKey: string;
  secretKey: string;
  clientId?: string;
  webhookSecret: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'TESTING' | 'ERROR';
  supportsRecurring: boolean;
  supportedCurrencies: string[];
  supportedMethods: SupportedMethod[];
  lastTestedAt?: string;
  testError?: string;
  meta: PaymentGatewayMeta;
}

export const PAYMENT_GATEWAY_CATALOG: PaymentGatewayMeta[] = [
  // ================= INDIAN GATEWAYS =================
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'INDIAN',
    description: 'India’s leading payments powerhouse: UPI, QR, RuPay/Visa/Mastercard, Net Banking, and recurring subscriptions.',
    brandColor: '#0c2340',
    badgeText: 'UPI & e-NACH Subscriptions',
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'],
    supportedMethods: ['UPI', 'UPI_QR', 'INDIAN_CARDS', 'INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'NET_BANKING', 'WALLETS'],
    supportsRecurring: true,
    requiresMerchantApproval: true,
    supportedCountries: ['IN', 'GLOBAL'],
    fields: {
      apiKeyLabel: 'Key ID (rzp_test_... or rzp_live_...)',
      secretKeyLabel: 'Key Secret',
      webhookSecretLabel: 'Webhook Secret',
    },
  },
  {
    id: 'cashfree',
    name: 'Cashfree',
    category: 'INDIAN',
    description: 'High-speed payment processing with auto-collect UPI, BharatQR, Instant Mandates, and low-latency net banking.',
    brandColor: '#172554',
    badgeText: 'AutoCollect & UPI Mandates',
    supportedCurrencies: ['INR', 'USD', 'EUR'],
    supportedMethods: ['UPI', 'UPI_QR', 'INDIAN_CARDS', 'INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'NET_BANKING', 'WALLETS'],
    supportsRecurring: true,
    requiresMerchantApproval: true,
    supportedCountries: ['IN'],
    fields: {
      apiKeyLabel: 'App ID (CF-AppID)',
      secretKeyLabel: 'Secret Key (CF-Secret)',
      clientIdLabel: 'Merchant ID',
      webhookSecretLabel: 'Webhook Verification Salt',
    },
  },
  {
    id: 'payu',
    name: 'PayU',
    category: 'INDIAN',
    description: 'Enterprise Indian aggregator with multi-bank net banking routers, credit line EMIs, and cards.',
    brandColor: '#047857',
    badgeText: 'Enterprise Routing',
    supportedCurrencies: ['INR'],
    supportedMethods: ['UPI', 'INDIAN_CARDS', 'VISA', 'MASTERCARD', 'AMEX', 'NET_BANKING', 'WALLETS'],
    supportsRecurring: false,
    requiresMerchantApproval: true,
    supportedCountries: ['IN'],
    fields: {
      apiKeyLabel: 'Merchant Key',
      secretKeyLabel: 'Merchant Salt',
      clientIdLabel: 'PayU Merchant ID',
      webhookSecretLabel: 'Reverse Hash Salt',
    },
  },
  {
    id: 'phonepe',
    name: 'PhonePe Payment Gateway',
    category: 'INDIAN',
    description: 'Direct UPI deep-linking, PhonePe dynamic QR, wallet debit, and high-concurrency payment intents.',
    brandColor: '#5f259f',
    badgeText: 'Direct UPI & Dynamic QR',
    supportedCurrencies: ['INR'],
    supportedMethods: ['UPI', 'UPI_QR', 'WALLETS', 'INDIAN_CARDS'],
    supportsRecurring: false,
    requiresMerchantApproval: true,
    supportedCountries: ['IN'],
    fields: {
      apiKeyLabel: 'Merchant ID (MID)',
      secretKeyLabel: 'Salt Key',
      clientIdLabel: 'Salt Index (e.g. 1)',
      webhookSecretLabel: 'X-VERIFY Salt Index',
    },
  },
  {
    id: 'ccavenue',
    name: 'CCAvenue',
    category: 'INDIAN',
    description: 'Heritage Indian gateway supporting 200+ payment options, 55+ Net Banking partners, and multi-currency billing.',
    brandColor: '#b91c1c',
    badgeText: '55+ Bank Connectors',
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
    supportedMethods: ['NET_BANKING', 'INDIAN_CARDS', 'INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'AMEX', 'WALLETS'],
    supportsRecurring: false,
    requiresMerchantApproval: true,
    supportedCountries: ['IN'],
    fields: {
      apiKeyLabel: 'Merchant ID',
      secretKeyLabel: 'Working Key',
      clientIdLabel: 'Access Code',
      webhookSecretLabel: 'Checksum Encryption Key',
    },
  },

  // ================= INTERNATIONAL GATEWAYS =================
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'INTERNATIONAL',
    description: 'Gold-standard global payment infrastructure for recurring SaaS billing, 3D Secure 2 cards, and wallets.',
    brandColor: '#635bff',
    badgeText: 'Automated Global Subscriptions',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED', 'JPY'],
    supportedMethods: ['INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'AMEX', 'WALLETS'],
    supportsRecurring: true,
    requiresMerchantApproval: false,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Publishable Key (pk_test_... / pk_live_...)',
      secretKeyLabel: 'Secret Key (sk_test_... / sk_live_...)',
      webhookSecretLabel: 'Webhook Signing Secret (whsec_...)',
    },
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'INTERNATIONAL',
    description: 'Global consumer brand with 400M+ active wallets, recurring subscriptions, and buyer protection.',
    brandColor: '#003087',
    badgeText: 'Global Wallet & Vaulting',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD'],
    supportedMethods: ['PAYPAL', 'INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'AMEX'],
    supportsRecurring: true,
    requiresMerchantApproval: false,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Client ID',
      secretKeyLabel: 'Client Secret',
      webhookSecretLabel: 'Webhook ID',
    },
  },
  {
    id: 'twocheckout',
    name: '2Checkout / Verifone',
    category: 'INTERNATIONAL',
    description: 'Merchant-of-Record platform handling cross-border sales taxes, global cards, and European banking rails.',
    brandColor: '#0284c7',
    badgeText: 'Cross-Border Merchant of Record',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    supportedMethods: ['INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'],
    supportsRecurring: true,
    requiresMerchantApproval: true,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Merchant Code',
      secretKeyLabel: 'Buy-Link Secret Word',
      clientIdLabel: 'Publishable Key',
      webhookSecretLabel: 'INS Secret Key',
    },
  },
  {
    id: 'paddle',
    name: 'Paddle',
    category: 'INTERNATIONAL',
    description: 'SaaS Merchant of Record taking complete liability for international VAT, GST, and sales tax compliance.',
    brandColor: '#0d9488',
    badgeText: 'Global SaaS Tax MoR',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
    supportedMethods: ['INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'PAYPAL'],
    supportsRecurring: true,
    requiresMerchantApproval: true,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Vendor ID',
      secretKeyLabel: 'API Key',
      webhookSecretLabel: 'Webhook Secret Key (v2)',
    },
  },
  {
    id: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    category: 'INTERNATIONAL',
    description: 'Modern developer-first MoR with built-in European VAT management, subscription portals, and checkout overlays.',
    brandColor: '#eab308',
    badgeText: 'Developer-First MoR',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    supportedMethods: ['INTERNATIONAL_CARDS', 'VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'],
    supportsRecurring: true,
    requiresMerchantApproval: true,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Store ID',
      secretKeyLabel: 'API Key',
      webhookSecretLabel: 'Signing Secret',
    },
  },

  // ================= CRYPTO GATEWAYS =================
  {
    id: 'nowpayments',
    name: 'NOWPayments',
    category: 'CRYPTO',
    description: 'Non-custodial cryptocurrency payment gateway supporting 160+ tokens with instant fiat auto-conversion.',
    brandColor: '#0284c7',
    badgeText: 'Non-Custodial Multi-Crypto',
    supportedCurrencies: ['USD', 'EUR', 'BTC', 'ETH', 'USDT', 'USDC', 'LTC'],
    supportedMethods: ['BTC', 'ETH', 'USDT', 'USDC', 'LTC'],
    supportsRecurring: false,
    requiresMerchantApproval: false,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'API Key',
      secretKeyLabel: 'IPN Secret Key',
      webhookSecretLabel: 'IPN Webhook Secret',
    },
  },
  {
    id: 'coinpayments',
    name: 'CoinPayments',
    category: 'CRYPTO',
    description: 'Legacy crypto gateway operating since 2013 with wallet vaults, multi-coin invoices, and POS QR codes.',
    brandColor: '#1d4ed8',
    badgeText: 'Multi-Coin Vaulting',
    supportedCurrencies: ['USD', 'BTC', 'ETH', 'USDT', 'USDC', 'LTC'],
    supportedMethods: ['BTC', 'ETH', 'USDT', 'USDC', 'LTC'],
    supportsRecurring: false,
    requiresMerchantApproval: false,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Public Key',
      secretKeyLabel: 'Private Key',
      clientIdLabel: 'Merchant ID',
      webhookSecretLabel: 'IPN Secret',
    },
  },
  {
    id: 'coinbase',
    name: 'Coinbase Commerce',
    category: 'CRYPTO',
    description: 'Institutional web3 commerce protocol powered by smart contracts on Base, Polygon, and Ethereum.',
    brandColor: '#0052ff',
    badgeText: 'Web3 Institutional Protocol',
    supportedCurrencies: ['USD', 'USDC', 'BTC', 'ETH'],
    supportedMethods: ['USDC', 'BTC', 'ETH'],
    supportsRecurring: false,
    requiresMerchantApproval: false,
    supportedCountries: ['GLOBAL'],
    fields: {
      apiKeyLabel: 'Commerce API Key',
      secretKeyLabel: 'API Secret',
      webhookSecretLabel: 'Shared Webhook Secret',
    },
  },
];
