export * from './types';

export class SocialInboxService {
  public static async markAsRead(_messageId: string): Promise<boolean> {
    return true;
  }
}
