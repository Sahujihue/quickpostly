import crypto from 'crypto';

export class WebhookVerifier {
  /**
   * Verifies Stripe Webhook (RFC HMAC-SHA256 timestamp signature)
   */
  public static verifyStripe(payload: string, signatureHeader: string | null, secret: string): boolean {
    if (!signatureHeader || !secret) return false;
    try {
      const parts = signatureHeader.split(',');
      let timestamp = '';
      let signature = '';

      for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === 't') timestamp = v;
        if (k === 'v1') signature = v;
      }

      if (!timestamp || !signature) return false;

      const signedPayload = `${timestamp}.${payload}`;
      const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Verifies Razorpay Webhook (HMAC-SHA256 signature)
   */
  public static verifyRazorpay(payload: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Verifies PhonePe X-VERIFY checksum (SHA256(base64Payload + apiEndpoint + saltKey) + "###" + saltIndex)
   */
  public static verifyPhonePe(
    base64Payload: string,
    xVerifyHeader: string | null,
    saltKey: string,
    saltIndex: string
  ): boolean {
    if (!xVerifyHeader || !saltKey) return false;
    try {
      const hash = crypto.createHash('sha256').update(`${base64Payload}${saltKey}`).digest('hex');
      const expected = `${hash}###${saltIndex}`;
      return xVerifyHeader === expected;
    } catch {
      return false;
    }
  }

  /**
   * Verifies Cashfree Webhook (HMAC-SHA256)
   */
  public static verifyCashfree(payload: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64');
      return signature === expected;
    } catch {
      return false;
    }
  }

  /**
   * Verifies PayU reverse hash (SHA512)
   */
  public static verifyPayU(
    params: {
      status: string;
      email: string;
      firstname: string;
      productinfo: string;
      amount: string;
      txnid: string;
      key: string;
    },
    receivedHash: string | null,
    salt: string
  ): boolean {
    if (!receivedHash || !salt) return false;
    try {
      const hashString = `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;
      const expected = crypto.createHash('sha512').update(hashString).digest('hex');
      return receivedHash.toLowerCase() === expected.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Verifies Lemon Squeezy Webhook (HMAC-SHA256)
   */
  public static verifyLemonSqueezy(payload: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Verifies Paddle Webhook (HMAC-SHA256 with timestamp)
   */
  public static verifyPaddle(payload: string, signatureHeader: string | null, secret: string): boolean {
    if (!signatureHeader || !secret) return false;
    try {
      const parts = signatureHeader.split(';');
      let ts = '';
      let h1 = '';
      for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === 'ts') ts = v;
        if (k === 'h1') h1 = v;
      }
      if (!ts || !h1) return false;
      const expected = crypto.createHmac('sha256', secret).update(`${ts}:${payload}`).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(h1), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Verifies NOWPayments IPN (HMAC-SHA512 on sorted JSON keys)
   */
  public static verifyNowPayments(payload: Record<string, unknown>, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const sortedKeys = Object.keys(payload).sort();
      const sortedObj: Record<string, unknown> = {};
      for (const key of sortedKeys) {
        sortedObj[key] = payload[key];
      }
      const raw = JSON.stringify(sortedObj);
      const expected = crypto.createHmac('sha512', secret).update(raw).digest('hex');
      return signature === expected;
    } catch {
      return false;
    }
  }

  /**
   * Verifies CoinPayments IPN (HMAC-SHA512)
   */
  public static verifyCoinPayments(rawBody: string, hmacHeader: string | null, secret: string): boolean {
    if (!hmacHeader || !secret) return false;
    try {
      const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
      return hmacHeader === expected;
    } catch {
      return false;
    }
  }

  /**
   * Verifies Coinbase Commerce Webhook (HMAC-SHA256)
   */
  public static verifyCoinbase(payload: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}
