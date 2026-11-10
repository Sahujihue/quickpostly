// src/lib/social/validator.ts
// Platform Rules & Media Specifications Validator

import {
  SocialPlatformId,
  SocialPostType,
  PostValidationResult,
} from '@/modules/social/types';
import { SOCIAL_PLATFORMS_CATALOG } from '@/modules/social/platforms';

export class SocialMediaValidator {
  /**
   * Validates content length, post type, and media constraints against platform rules
   */
  public static validatePost(
    platformId: SocialPlatformId,
    content: string,
    postType: SocialPostType,
    mediaUrls: string[] = []
  ): PostValidationResult {
    const meta = SOCIAL_PLATFORMS_CATALOG.find((p) => p.id === platformId);
    if (!meta) {
      return {
        valid: false,
        platform: platformId,
        errors: [`Platform '${platformId}' not recognized.`],
        warnings: [],
        charCount: content.length,
        maxChars: 0,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const charCount = content.length;
    const maxChars = meta.rules.maxCharacters;

    // 1. Character Limit Check
    if (charCount > maxChars) {
      errors.push(
        `Character count (${charCount}) exceeds ${meta.name}'s maximum limit of ${maxChars.toLocaleString()} characters.`
      );
    }

    // 2. Post Type Compatibility Check
    if (!meta.rules.supportedPostTypes.includes(postType)) {
      errors.push(
        `${meta.name} does not support '${postType}' post type. Supported types: ${meta.rules.supportedPostTypes.join(', ')}.`
      );
    }

    // 3. Media Requirement Check for Media-First Platforms
    if (platformId === 'instagram' && postType === 'TEXT' && mediaUrls.length === 0) {
      errors.push(
        `Instagram Graph API does not support text-only posts. An image or video asset is mandatory.`
      );
    }

    if (platformId === 'youtube' && (postType === 'TEXT' || postType === 'IMAGE')) {
      errors.push(
        `YouTube Data API only supports Video and Shorts uploads. Community posts are not available via public upload API.`
      );
    }

    // 4. Carousel Constraints
    if (postType === 'CAROUSEL') {
      if (!meta.rules.supportsCarousels) {
        errors.push(`${meta.name} does not support carousel multi-card posts.`);
      } else if (mediaUrls.length < 2) {
        errors.push(`Carousel posts require at least 2 media items (found: ${mediaUrls.length}).`);
      } else if (meta.rules.maxCarouselItems && mediaUrls.length > meta.rules.maxCarouselItems) {
        errors.push(
          `Carousel item count (${mediaUrls.length}) exceeds ${meta.name}'s limit of ${meta.rules.maxCarouselItems} items.`
        );
      }
    }

    // 5. Warnings & Best Practices
    if (platformId === 'twitter' && charCount > 250 && charCount <= 280) {
      warnings.push(`Close to X (Twitter) character limit (${charCount}/280). Consider trimming for engagement.`);
    }

    if (platformId === 'linkedin' && content.split('#').length > 6) {
      warnings.push(`LinkedIn algorithms favor 3-5 targeted hashtags. High hashtag counts may reduce feed reach.`);
    }

    return {
      valid: errors.length === 0,
      platform: platformId,
      errors,
      warnings,
      charCount,
      maxChars,
    };
  }
}
