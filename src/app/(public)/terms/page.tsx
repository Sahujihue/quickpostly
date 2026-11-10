import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CmsRepository } from '@/lib/cms/repository';
import { sanitizeHtml } from '@/lib/sanitize';

export const revalidate = 60;

export async function generateMetadata() {
  const page = await CmsRepository.getPageBySlug('terms');
  return {
    title: page?.metaTitle || 'Terms and Conditions | QuickPostly',
    description: page?.metaDescription || 'Terms of service, subscription policies, and legal agreements for QuickPostly SaaS.',
  };
}

export default async function TermsPage() {
  const page = await CmsRepository.getPageBySlug('terms');
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
            <span className="text-slate-900 dark:text-white font-semibold">Terms and Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {page?.title || 'Terms and Conditions'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'November 2026'} &bull; Commercial Terms of Service
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
              <p>
                By accessing or creating an account on QuickPostly (&quot;Service&quot;), operated by QuickPostly Technologies Inc. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms and Conditions. If you are entering into this agreement on behalf of a company, marketing agency, or other legal entity, you represent that you have the authority to bind such entity to these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. User Accounts & Workspaces</h2>
              <p>
                You must provide accurate, complete, and updated information during registration. You are responsible for safeguarding your login credentials and maintaining the confidentiality of your workspace API keys and connected social accounts. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Acceptable Use Policy</h2>
              <p>You agree not to use QuickPostly to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate the terms of service or API developer policies of any third-party social platform (including X, Meta, LinkedIn, Pinterest, or TikTok).</li>
                <li>Publish, broadcast, or queue unsolicited mass spam, malware, phishing links, or deceptive advertising.</li>
                <li>Engage in abusive automated behavior that places excessive load on our publishing queues or third-party rate limits.</li>
                <li>Attempt to reverse-engineer, decompile, or copy the underlying algorithms of our category queue scheduler or AI engine.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Subscriptions, Billing & Cancellations</h2>
              <p>
                QuickPostly provides subscription-based software services billed in advance on a recurring monthly or annual basis. 
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Free Trials:</strong> If you register for a 14-day free trial, you will not be billed until the trial period concludes. You may cancel at any moment during the trial without charge.
                </li>
                <li>
                  <strong>Cancellations:</strong> You can cancel your subscription at any time via your workspace billing settings. Cancellation takes effect at the end of the current billing cycle.
                </li>
                <li>
                  <strong>Refunds:</strong> Payments are generally non-refundable except where required by mandatory law or specified in a signed Enterprise Master Services Agreement.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Intellectual Property & User Content</h2>
              <p>
                You retain 100% full ownership and copyright of all text, media, graphics, and video content you schedule or publish through QuickPostly. QuickPostly does not claim any proprietary rights to your brand assets or social post copy. QuickPostly and its associated logos, designs, queue algorithms, and software code are the intellectual property of QuickPostly Technologies Inc.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, QuickPostly Technologies Inc. shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from downtime of third-party social media APIs, rate limiting enforced by social networks, or temporary service interruptions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
