'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Hexagon, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { CmsHeaderRecord } from '@/lib/cms/repository';
import { BrandLogo } from '@/components/ui/brand-logo';

interface PublicHeaderProps {
  navItems?: Array<{ label: string; path: string }>;
  settings?: CmsHeaderRecord | null;
}

export function PublicHeader({ navItems = [], settings }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = navItems.length > 0 ? navItems : [
    { label: 'Features', path: '/#features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const logoText = settings?.logoText || 'SocialHive';
  const isSticky = settings?.isSticky ?? true;
  const showThemeToggle = settings?.showThemeToggle ?? true;
  const showCta = settings?.showCtaButton ?? true;
  const ctaText = settings?.ctaText || 'Start Free Trial';
  const ctaLink = settings?.ctaLink || '/signup';
  const showSignIn = settings?.showSignInButton ?? true;
  const signInText = settings?.signInText || 'Sign In';

  return (
    <header className={`${isSticky ? 'sticky top-0 z-40' : 'relative'} w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <BrandLogo
            size="md"
            brandName={logoText}
            showBadge={true}
            badgeText="AI SaaS"
            showTagline={true}
            taglineText="Create Smarter. Schedule Faster."
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Theme */}
          <div className="hidden md:flex items-center gap-3">
            {showThemeToggle && <ThemeToggle />}
            {showSignIn && (
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                {signInText}
              </Link>
            )}
            {showCta && (
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm shadow-amber-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {showThemeToggle && <ThemeToggle />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {showSignIn && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
              >
                {signInText}
              </Link>
            )}
            {showCta && (
              <Link
                href={ctaLink}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm"
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
