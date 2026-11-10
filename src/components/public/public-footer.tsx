'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Hexagon, Twitter, Linkedin, Facebook, Instagram, Youtube, ShieldCheck, Mail, Send, CheckCircle2 } from 'lucide-react';
import { CmsFooterRecord } from '@/lib/cms/repository';
import { BrandLogo } from '@/components/ui/brand-logo';

interface PublicFooterProps {
  primaryLinks?: Array<{ label: string; path: string }>;
  legalLinks?: Array<{ label: string; path: string }>;
  settings?: CmsFooterRecord | null;
}

export function PublicFooter({ primaryLinks = [], legalLinks = [], settings }: PublicFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const brandDesc = settings?.brandDescription || 'AI-Powered Social Media Management SaaS engineered for creators, modern agencies, and fast-growing businesses.';
  const copyright = settings?.copyrightText || '© 2026 QuickPostly. All rights reserved. Create Smarter. Schedule Faster. Grow Everywhere.';
  const showNewsletter = settings?.showNewsletter ?? true;
  const showSocials = settings?.showSocialLinks ?? true;
  const columns = settings?.columnsJson || [];
  const socialLinks = settings?.socialLinksJson || {};

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showTagline={false} />
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {brandDesc}
            </p>

            {/* Newsletter */}
            {showNewsletter && (
              <div className="pt-2 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
                  {settings?.newsletterTitle || 'Subscribe to Social Growth'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {settings?.newsletterSubtitle || 'Weekly actionable evergreen distribution tactics.'}
                </p>
                {subscribed ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>You are subscribed! Welcome to Social Growth Weekly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter work email..."
                      required
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social Icons */}
            {showSocials && (
              <div className="flex items-center gap-2 pt-2 text-slate-400 dark:text-slate-500">
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {columns.length > 0 ? (
            columns.map((col) => (
              <div key={col.id} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : undefined}
                        className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Product Links Fallback */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Platform & Solution
                </h4>
                <ul className="space-y-2 text-sm">
                  {primaryLinks.map((link) => (
                    <li key={link.path}>
                      <Link href={link.path} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/dashboard" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
                      Launch App Dashboard &rarr;
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Fallback */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Trust & Legal
                </h4>
                <ul className="space-y-2 text-sm">
                  {legalLinks.map((link) => (
                    <li key={link.path}>
                      <Link href={link.path} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Contact & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Compliance & HQ
            </h4>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GDPR & SOC2 Certified</span>
              </div>
              <p>Email: {settings?.contactInfoJson?.supportEmail || 'support@quickpostly.com'}</p>
              <p>Phone: {settings?.contactInfoJson?.phone || '+1 (800) 555-0199'}</p>
              <p className="line-clamp-2">{settings?.contactInfoJson?.address || 'San Francisco, CA 94105'}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-200">
              Terms of Service
            </Link>
            <Link href="/api/health" className="hover:text-slate-800 dark:hover:text-slate-200">
              API Health
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
