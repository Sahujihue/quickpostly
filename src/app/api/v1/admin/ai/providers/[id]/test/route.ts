// src/app/api/v1/admin/ai/providers/[id]/test/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';
import { AIProviderDispatcher } from '@/lib/ai/providers';
import { AIProviderId } from '@/modules/ai/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const providerId = params.id as AIProviderId;
    const body = await req.json().catch(() => ({}));
    const provider = await AIRepository.getProvider(providerId);

    if (!provider) {
      return apiResponse.notFound(`Provider '${params.id}' not found`);
    }

    const apiKey = body.apiKey !== undefined ? body.apiKey : provider.apiKey;
    const endpoint = body.apiEndpoint || provider.apiEndpoint;

    // Test real or sandbox connection
    const testResult = await AIProviderDispatcher.testConnection(providerId, apiKey, endpoint);

    // Only mark connected if the test was successful
    const updated = await AIRepository.updateProvider(providerId, {
      connectionStatus: testResult.connected ? 'CONNECTED' : 'ERROR',
      latencyMs: testResult.latencyMs,
      lastTestedAt: new Date().toISOString(),
    });

    return apiResponse.success(
      {
        provider: updated,
        testResult,
      },
      testResult.message
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection test failed';
    return apiResponse.error({ message, code: 'ADMIN_PROVIDER_TEST_ERROR', status: 400 });
  }
}
