// src/app/api/v1/ai/credits/purchase/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, userId, packType } = body;

    if (!workspaceId || !packType) {
      return apiResponse.badRequest('Missing workspaceId or packType');
    }

    if (!['STARTER_BOOST', 'CREATIVE_PACK', 'AGENCY_SCALE'].includes(packType)) {
      return apiResponse.badRequest('Invalid packType. Valid options: STARTER_BOOST, CREATIVE_PACK, AGENCY_SCALE');
    }

    const updatedCredits = await AIRepository.addCreditPack(
      workspaceId,
      userId || 'usr_current',
      packType
    );

    return apiResponse.success(
      updatedCredits,
      `Credit pack '${packType}' activated successfully.`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Credit pack purchase failed';
    return apiResponse.error({ message, code: 'CREDIT_PURCHASE_ERROR', status: 400 });
  }
}
