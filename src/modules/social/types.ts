// src/modules/social/types.ts
// Official Social Media API Types & Specifications

export type SocialPlatformId =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'twitter'
  | 'google_business';

export type SocialAccountStatus =
  | 'CONNECTED'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'REQUIRES_REAUTH'
  | 'DISCONNECTED';

export type SocialAccountType =
  | 'PROFILE'
  | 'PAGE'
  | 'GROUP'
  | 'BUSINESS_ACCOUNT'
  | 'CREATOR_ACCOUNT'
  | 'ORGANIZATION'
  | 'CHANNEL'
  | 'BOARD'
  | 'LOCATION';

export type SocialPostType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'CAROUSEL'
  | 'REELS'
  | 'SHORTS';

export interface PlatformMediaRules {
  maxCharacters: number;
  supportedPostTypes: SocialPostType[];
  supportsCarousels: boolean;
  maxCarouselItems?: number;
  supportedImageFormats: string[]; // ['image/jpeg', 'image/png', 'image/webp']
  supportedAspectRatios: string[]; // ['1:1', '4:5', '16:9', '9:16']
  maxVideoDurationSeconds?: number;
  minVideoDurationSeconds?: number;
  maxVideoSizeBytes?: number;
  maxImageSizeBytes?: number;
}

export interface SocialPlatformMeta {
  id: SocialPlatformId;
  name: string;
  brandColor: string;
  badgeText: string;
  description: string;
  requiresAppReview: boolean;
  appReviewNotes: string;
  accountPrerequisites: string;
  defaultScopes: string[];
  docsUrl: string;
  developerPortalUrl: string;
  authEndpoint: string;
  tokenEndpoint: string;
  rules: PlatformMediaRules;
}

export interface SocialPlatformConfigDTO {
  id: SocialPlatformId;
  name: string;
  isEnabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  requiresAppReview: boolean;
  appReviewStatus: 'APPROVED' | 'PENDING_REVIEW' | 'IN_DEVELOPMENT' | 'REJECTED';
  connectionStatus: 'CONFIGURED' | 'NOT_CONFIGURED' | 'ERROR';
  latencyMs?: number;
  lastTestedAt?: string;
  meta?: SocialPlatformMeta;
}

export interface ConnectedSocialAccountDTO {
  id: string;
  workspaceId: string;
  userId: string;
  platform: SocialPlatformId;
  platformAccountId: string;
  accountName: string;
  accountHandle: string;
  accountType: SocialAccountType;
  profilePictureUrl?: string;
  followersCount: number;
  tokenExpiresAt?: string;
  scopesGranted: string[];
  connectionStatus: SocialAccountStatus;
  lastSyncAt?: string;
  lastErrorReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PostValidationResult {
  valid: boolean;
  platform: SocialPlatformId;
  errors: string[];
  warnings: string[];
  charCount: number;
  maxChars: number;
}

export interface SocialPublishInput {
  workspaceId: string;
  userId: string;
  accountIds: string[];
  content: string;
  mediaUrls?: string[];
  postType: SocialPostType;
  scheduledTime?: string;
}

export interface SocialPublishResult {
  accountId: string;
  platform: SocialPlatformId;
  accountName: string;
  success: boolean;
  platformPostId?: string;
  permalink?: string;
  errorMessage?: string;
  rateLimitRemaining?: number;
  publishedAt: string;
}

// Backwards compatibility aliases
export type SocialPlatform = SocialPlatformId | 'threads';

export interface SocialAccountDto {
  id: string;
  workspaceId: string;
  platform: SocialPlatformId;
  platformAccountId: string;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  tokenExpiresAt?: Date;
  status: 'connected' | 'disconnected' | 'expired';
}

export interface SocialPostPayload {
  text: string;
  mediaUrls?: string[];
  linkUrl?: string;
  firstComment?: string;
  scheduledTime?: Date;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalUrl?: string;
  error?: string;
}
