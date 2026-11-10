export * from './types';

export class AnalyticsAggregator {
  public static calculateEngagementRate(engagements: number, impressions: number): number {
    if (!impressions) return 0;
    return parseFloat(((engagements / impressions) * 100).toFixed(2));
  }
}
