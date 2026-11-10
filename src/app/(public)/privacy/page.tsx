import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CmsRepository } from '@/lib/cms/repository';
import { sanitizeHtml } from '@/lib/sanitize';

export const revalidate = 60;

export async function generateMetadata() {
  const page = await CmsRepository.getPageBySlug('privacy');
  return {
    title: page?.metaTitle || 'Privacy Policy | QuickPostly',
    description: page?.metaDescription || 'Learn how QuickPostly collects, protects, and handles your data and social media tokens.',
  };
}

export default async function PrivacyPage() {
  const page = await CmsRepository.getPageBySlug('privacy');
  const customHtml = page?.contentJson?.bodyHtml as string | undefined;
  const safeHtml = customHtml ? sanitizeHtml(customHtml) : null;

  return (
    <div className="flex flex-col w-full py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Link href="/" className="hover:text-amber-500">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Legal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {page?.title || 'Privacy Policy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'November 2026'} &bull; Effective Date: Immediately
          </p>
        </div>

        {/* Dynamic CMS or Default Content */}
        {safeHtml ? (
          <div
            className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Introduction & Scope</h2>
              <p>
                QuickPostly Technologies Inc. (&quot;QuickPostly&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy and ensuring transparency regarding how we handle your personal data. This Privacy Policy governs the collection, use, and disclosure of information obtained when you access or use our websites, APIs, mobile applications, and software-as-a-service platform (collectively, the &quot;Service&quot;).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
              <p>We collect information in three ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account Information:</strong> When you register for QuickPostly, we collect your name, email address, password hash, company name, and billing details (processed through secure PCI-DSS Level 1 compliant processors like Stripe).
                </li>
                <li>
                  <strong>Social Media Profile Data & Tokens:</strong> When you authorize QuickPostly to access your social media accounts (such as X, LinkedIn, Facebook, Instagram, Pinterest, or TikTok), we store the OAuth access tokens required to publish posts, schedule updates, and synchronize engagement analytics on your behalf.
                </li>
                <li>
                  <strong>User Content & Media:</strong> We store the post copy, hashtags, images, and videos you upload or draft within your workspace queues.
                </li>
                <li>
                  <strong>Technical & Telemetry Data:</strong> We automatically record IP addresses, browser types, device identifiers, and platform logs to ensure security, prevent malicious activities, and optimize performance.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. How We Use Your Data</h2>
              <p>We use your information exclusively to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Deliver, operate, and maintain our category-based social scheduling and queue services.</li>
                <li>Authenticate your identity and manage team workspace permissions and client approvals.</li>
                <li>Execute AI-assisted content drafting using vetted privacy-conscious language model providers.</li>
                <li>Monitor API limits and queue health across connected social networks.</li>
                <li>Provide responsive customer support and communicate essential platform updates.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Social Network API Compliance</h2>
              <p>
                QuickPostly adheres strictly to the Developer Terms and API policies of all connected social networks, including the X Developer Agreement, Meta Platform Terms, LinkedIn API Terms of Use, and Pinterest Developer Guidelines. We never sell your social tokens, follower data, or analytics to data brokers or third-party advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Security & Data Retention</h2>
              <p>
                We employ industry-standard AES-256 encryption for stored tokens and credentials, TLS 1.3 encryption for data in transit, automated database backups, and rigorous role-based access controls. Your content and profile tokens are retained only as long as your workspace remains active. When you disconnect a social profile or terminate your workspace, associated OAuth tokens are immediately revoked and deleted from our databases.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Your Rights Under GDPR & CCPA</h2>
              <p>
                Depending on your location, you may have the right to request access to the personal data we hold about you, request corrections, demand deletion of your account, or export your scheduled content and analytics in standard formats. To exercise any of these rights, contact our Data Protection Officer at{' '}
                <a href="mailto:privacy@quickpostly.com" className="text-amber-600 dark:text-amber-400 font-semibold underline">
                  privacy@quickpostly.com
                </a>.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
