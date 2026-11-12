import { NextResponse } from 'next/server';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const isFreePlanActive = await CmsRepository.isFreePlanActive();
  return NextResponse.json(
    { success: true, isFreePlanActive },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
