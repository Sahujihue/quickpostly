export * from './types';

export class SocialPlatformRegistry {
  private static supportedPlatforms: Record<string, { name: string; characterLimit: number; videoSupport: boolean }> = {
    twitter: { name: 'X / Twitter', characterLimit: 280, videoSupport: true },
    linkedin: { name: 'LinkedIn', characterLimit: 3000, videoSupport: true },
    facebook: { name: 'Facebook Pages', characterLimit: 63206, videoSupport: true },
    instagram: { name: 'Instagram', characterLimit: 2200, videoSupport: true },
    pinterest: { name: 'Pinterest', characterLimit: 500, videoSupport: true },
    tiktok: { name: 'TikTok', characterLimit: 2200, videoSupport: true },
  };

  public static getPlatformConfig(platform: string) {
    return this.supportedPlatforms[platform];
  }
}
