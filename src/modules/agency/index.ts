export * from './types';

export class AgencyService {
  public static isWhiteLabelEnabled(plan: string): boolean {
    return plan === 'AGENCY' || plan === 'ENTERPRISE';
  }
}
