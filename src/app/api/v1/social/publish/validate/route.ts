// src/app/api/v1/social/publish/validate/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialPlatformId, SocialPostType } from '@/modules/social/types';
import { SocialMediaValidator } from '@/lib/social/validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platforms, content, postType, mediaUrls } = body;

    if (!platforms || !Array.isArray(platforms) || !content) {
      return apiResponse.badRequest('Missing platforms array or content string');
    }

    const validations = platforms.map((p: SocialPlatformId) =>
      SocialMediaValidator.validatePost(p, content, (postType as SocialPostType) || 'TEXT', mediaUrls || [])
    );

    const allValid = validations.every((v) => v.valid);

    return apiResponse.success({
      allValid,
      validations,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return apiResponse.error({ message, code: 'VALIDATION_ERROR', status: 400 });
  }
}
