'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  variant?: 'full' | 'mark' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
  href?: string;
  brandName?: string;
}

export function BrandLogoMark({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }[size];

  return (
    <div
      className={`relative ${sizeMap[size]} rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-[1px] shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200 ${className}`}
    >
      <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent" />
        
        {/* QuickPostly High-Speed Social Dispatch Emblem */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Outer dynamic orbital arc */}
          <path
            d="M5 16C5 9.925 9.925 5 16 5C20.5 5 24.3 7.7 25.9 11.5"
            stroke="url(#quickpostly_grad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Quick Speed Arrow / Lightning Bolt Send Shape */}
          <path
            d="M27 8L15 17L19 27L21 20L27 18L27 8Z"
            fill="url(#quickpostly_grad2)"
          />
          <path
            d="M13 14L8 18L13 22"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="quickpostly_grad1" x1="5" y1="5" x2="26" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="quickpostly_grad2" x1="15" y1="8" x2="27" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FCD34D" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  showBadge = true,
  badgeText = 'AI SaaS',
  showTagline = false,
  taglineText = 'Create Smarter. Schedule Faster. Grow Everywhere.',
  className = '',
  href = '/',
  brandName = 'QuickPostly',
}: BrandLogoProps) {
  const textSizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeSizeMap = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {variant !== 'text' && <BrandLogoMark size={size} />}

      {variant !== 'mark' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizeMap[size]}`}>
              Quick<span className="text-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Postly</span>
            </span>

            {showBadge && (
              <span
                className={`font-bold tracking-wide uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 rounded ${badgeSizeMap[size]}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {showTagline && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight -mt-0.5">
              {taglineText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
