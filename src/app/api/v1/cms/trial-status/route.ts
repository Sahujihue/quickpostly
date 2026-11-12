import { NextResponse } from 'next/server';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const isFreePlanActive = await CmsRepository.isFreePlanActive();
  const response = NextResponse.json(
    { success: true, isFreePlanActive },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
  response.cookies.set('quickpostly_free_plan_active', String(isFreePlanActive), {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}
