// src/app/api/v1/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsRepository } from '@/lib/analytics/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const timeRange = searchParams.get('timeRange') || '30d';
    const format = searchParams.get('format') || 'csv';

    if (format === 'csv') {
      const csv = await AnalyticsRepository.exportMetricsCsv(workspaceId, timeRange);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="socialhive-analytics-${workspaceId}-${timeRange}.csv"`,
        },
      });
    }

    const data = await AnalyticsRepository.getAnalyticsOverview(workspaceId, timeRange as any);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
