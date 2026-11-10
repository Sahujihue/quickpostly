import { MetadataRoute } from 'next';
import { CmsRepository } from '@/lib/cms/repository';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await CmsRepository.getSeoSettings();
  const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://quickpostly.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/dashboard', '/dashboard/*', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
