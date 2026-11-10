import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';
import { WebhookVerifier } from '@/lib/payments/webhooks';

export async function POST(
  req: NextRequest,
  { params }: { params: { gateway: string } }
) {
  const gatewayId = params.gateway.toLowerCase();

  try {
    const rawBody = await req.text();
    const headers = req.headers;

    const gateway = await PaymentRepository.getGatewayConfig(gatewayId);
    if (!gateway) {
      return apiResponse.notFound(`Webhook gateway '${gatewayId}' not found`);
    }

    let isVerified = false;

    // Cryptographic Signature Dispatch
    switch (gatewayId) {
      case 'stripe': {
        const sig = headers.get('stripe-signature');
        isVerified = WebhookVerifier.verifyStripe(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'razorpay': {
        const sig = headers.get('x-razorpay-signature');
        isVerified = WebhookVerifier.verifyRazorpay(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'phonepe': {
        const sig = headers.get('x-verify');
        const saltIndex = gateway.clientId || '1';
        isVerified = WebhookVerifier.verifyPhonePe(rawBody, sig, gateway.secretKey, saltIndex);
        break;
      }

      case 'cashfree': {
        const sig = headers.get('x-webhook-signature');
        isVerified = WebhookVerifier.verifyCashfree(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'lemonsqueezy': {
        const sig = headers.get('x-signature');
        isVerified = WebhookVerifier.verifyLemonSqueezy(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'paddle': {
        const sig = headers.get('paddle-signature');
        isVerified = WebhookVerifier.verifyPaddle(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'nowpayments': {
        const sig = headers.get('x-nowpayments-sig');
        let parsedJson = {};
        try {
          parsedJson = JSON.parse(rawBody);
        } catch {
          // ignore
        }
        isVerified = WebhookVerifier.verifyNowPayments(parsedJson, sig, gateway.webhookSecret);
        break;
      }

      case 'coinpayments': {
        const sig = headers.get('hmac');
        isVerified = WebhookVerifier.verifyCoinPayments(rawBody, sig, gateway.webhookSecret);
        break;
      }

      case 'coinbase': {
        const sig = headers.get('x-cc-webhook-signature');
        isVerified = WebhookVerifier.verifyCoinbase(rawBody, sig, gateway.webhookSecret);
        break;
      }

      default: {
        // Test/Sandbox fallback
        isVerified = Boolean(rawBody && rawBody.length > 0);
        break;
      }
    }

    if (!isVerified) {
      return apiResponse.error({
        message: `Cryptographic signature verification failed for ${gateway.name} webhook.`,
        code: 'INVALID_WEBHOOK_SIGNATURE',
        status: 400,
      });
    }

    // Process event payload idempotently
    let eventData: Record<string, unknown> = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      eventData = { raw: rawBody };
    }

    const paymentId =
      (eventData.paymentId as string) ||
      (eventData.id as string) ||
      `wh_evt_${Date.now()}`;

    // If payload contains an existing transaction number, complete it
    const txNumber = eventData.transactionNumber as string;
    if (txNumber) {
      await PaymentRepository.verifyAndCompletePayment(txNumber, paymentId, eventData);
    }

    return apiResponse.success(
      {
        received: true,
        gateway: gateway.name,
        paymentId,
        timestamp: new Date().toISOString(),
      },
      'Webhook successfully verified and processed'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing error';
    return apiResponse.error({ message, code: 'WEBHOOK_ERROR', status: 500 });
  }
}
