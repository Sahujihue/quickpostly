import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { CmsRepository } from '@/lib/cms/repository';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://quickpostly.com';
const CANONICAL_URL = process.env.NEXT_PUBLIC_CANONICAL_URL || 'https://quickpostly.com';

export async function generateMetadata(): Promise<Metadata> {
  let theme: any = null;
  let seo: any = null;
  try {
    [theme, seo] = await Promise.all([
      CmsRepository.getThemeSettings(),
      CmsRepository.getSeoSettings(),
    ]);
  } catch {
    // fallback
  }

  const siteTitle = seo?.defaultMetaTitle || (theme?.siteName ? `${theme.siteName} – AI Social Media Platform` : 'QuickPostly – AI Social Media Management Platform');
  const siteDesc = seo?.defaultMetaDescription || 'Create AI-powered social media content, schedule posts, manage multiple accounts and grow your brand with QuickPostly.';
  const ogImageUrl = seo?.defaultOgImage || `${CANONICAL_URL}/og-image.png`;
  const twitterHandle = seo?.twitterHandle || '@QuickPostly';

  const iconsConfig: Metadata['icons'] = theme?.favicon
    ? {
        icon: [
          { url: theme.favicon },
          { url: '/favicon.ico', sizes: 'any' },
        ],
        apple: [{ url: theme.favicon }],
      }
    : {
        icon: [
          { url: '/favicon.ico', sizes: 'any' },
          { url: '/icon', type: 'image/png', sizes: '32x32' },
        ],
        apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
      };

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: siteTitle,
      template: `%s | ${theme?.siteName || 'QuickPostly'}`,
    },
    description: siteDesc,
    applicationName: theme?.siteName || 'QuickPostly',
    authors: [{ name: `${theme?.siteName || 'QuickPostly'} Team`, url: CANONICAL_URL }],
    generator: 'QuickPostly SaaS Engine',
    keywords: [
      theme?.siteName || 'QuickPostly',
      'AI social media management',
      'social media scheduler',
      'auto post social media',
      'AI caption generator',
      'Instagram scheduler',
      'LinkedIn post automation',
      'Twitter X scheduling',
      'social inbox',
      'multi-account social manager',
      'social analytics dashboard',
    ],
    alternates: {
      canonical: CANONICAL_URL,
      languages: {
        'en-US': CANONICAL_URL,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: CANONICAL_URL,
      siteName: theme?.siteName || 'QuickPostly',
      title: siteTitle,
      description: siteDesc,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: (seo?.twitterCardType as 'summary_large_image') || 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      creator: twitterHandle,
      site: twitterHandle,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: iconsConfig,
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${CANONICAL_URL}/#organization`,
      name: 'QuickPostly',
      url: CANONICAL_URL,
      logo: `${CANONICAL_URL}/icon`,
      sameAs: [
        'https://twitter.com/QuickPostly',
        'https://linkedin.com/company/quickpostly',
        'https://facebook.com/quickpostly',
        'https://instagram.com/quickpostly',
        'https://youtube.com/@quickpostly',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@quickpostly.com',
        contactType: 'Customer Support',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${CANONICAL_URL}/#software`,
      name: 'QuickPostly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Cloud / Web Browser',
      description:
        'Create AI-powered social media content, schedule posts, manage multiple accounts and grow your brand with QuickPostly.',
      url: CANONICAL_URL,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '149',
        offerCount: '5',
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let faviconUrl = '/favicon.ico';
  try {
    const theme = await CmsRepository.getThemeSettings();
    if (theme?.favicon) faviconUrl = theme.favicon;
  } catch {
    // fallback
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={faviconUrl} sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
