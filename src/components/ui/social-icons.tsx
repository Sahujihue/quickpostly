// src/components/ui/social-icons.tsx
import React from 'react';

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

// 1. X (formerly Twitter)
export function XTwitterIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="X (Twitter) logo"
      className={className}
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// 2. LinkedIn
export function LinkedInIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="LinkedIn logo"
      className={className}
      {...props}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

// 3. Facebook
export function FacebookIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="Facebook logo"
      className={className}
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// 4. Instagram
export function InstagramIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Instagram logo"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// 5. TikTok
export function TikTokIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="TikTok logo"
      className={className}
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.55c.01 2.22-.84 4.41-2.4 5.96-1.72 1.75-4.22 2.65-6.68 2.37-2.32-.23-4.47-1.57-5.69-3.56-1.35-2.1-1.47-4.84-.33-7.07 1.13-2.29 3.49-3.88 6.03-4.14.34-.04.68-.05 1.02-.04v4.06c-.46.04-.92.14-1.34.34-1.07.49-1.87 1.52-2.07 2.69-.26 1.34.36 2.77 1.52 3.48 1.07.67 2.48.65 3.56-.03.88-.54 1.45-1.5 1.46-2.54V.02z" />
    </svg>
  );
}

// 6. Pinterest
export function PinterestIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="Pinterest logo"
      className={className}
      {...props}
    >
      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.99-.1-2.52.02-3.61l.73-3.12s-.18-.38-.18-.94c0-.88.51-1.54 1.15-1.54.54 0 .8.41.8.9 0 .55-.35 1.37-.53 2.13-.15.64.32 1.16.95 1.16 1.14 0 2.02-1.2 2.02-2.94 0-1.54-1.11-2.61-2.69-2.61-1.83 0-2.91 1.38-2.91 2.8 0 .55.21 1.15.48 1.48.05.06.06.12.04.18l-.18.74c-.03.12-.1.17-.23.11-1.01-.47-1.64-1.95-1.64-3.14 0-2.56 1.86-4.91 5.37-4.91 2.82 0 5.01 2.01 5.01 4.7 0 2.8-1.77 5.06-4.22 5.06-.82 0-1.6-.43-1.87-.94l-.51 1.94c-.18.71-.68 1.6-1.01 2.14A12 12 0 1 0 12 0z" />
    </svg>
  );
}

// 7. YouTube
export function YouTubeIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="YouTube logo"
      className={className}
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// 8. Threads
export function ThreadsIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label="Threads logo"
      className={className}
      {...props}
    >
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.222-8.184-3.56-1.673-2.112-2.518-5.06-2.518-8.766 0-4.137.986-7.317 2.93-9.453C6.31 0.05 9.034-.01 12.025.002c3.085.012 5.748.88 7.705 2.509 2.052 1.708 3.197 4.225 3.313 7.28l-3.32.14c-.085-2.298-.865-4.093-2.318-5.336-1.424-1.218-3.385-1.854-5.83-1.864-2.28-.01-4.29.626-5.81 1.84-1.637 1.305-2.484 3.39-2.518 6.196-.035 2.92.766 5.253 2.38 6.937 1.517 1.583 3.655 2.42 6.353 2.487 2.274.056 4.152-.486 5.584-1.613.682-.537 1.223-1.233 1.611-2.072-1.488-.865-3.084-1.458-4.743-1.76-2.926-.534-4.885-1.577-5.823-3.1-.798-1.298-.857-2.85-.175-4.37.747-1.666 2.23-2.784 4.073-3.068.796-.123 1.603-.098 2.398.075 2.13.46 3.654 1.597 4.53 3.38.487.99.73 2.153.738 3.518v.538c0 .248-.008.498-.024.75 1.05.592 1.916 1.4 2.54 2.378.89 1.4 1.34 3.082 1.34 5.002 0 3.865-1.295 6.945-3.85 9.155-2.404 2.08-5.617 3.14-9.553 3.15zm.255-8.08c1.696.193 3.3.69 4.764 1.474-.035-1.594-.482-2.856-1.328-3.75-.845-.895-1.996-1.35-3.42-1.35-.453 0-.9.055-1.33.163-1.048.263-1.83.844-2.2 1.63-.38.808-.344 1.57.108 2.268.494.763 1.604 1.365 3.406 1.565z" />
    </svg>
  );
}

// 9. Google Business Profile (Official G Logo)
export function GoogleBusinessIcon({ className = 'w-5 h-5', size, ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label="Google Business Profile logo"
      className={className}
      {...props}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.36 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.42l4.01-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

// Multi-platform Badge / Avatar component with official brand styling
export interface SocialPlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBackground?: boolean;
}

export function SocialPlatformIcon({
  platform,
  size = 'md',
  className = '',
  showBackground = true,
}: SocialPlatformBadgeProps) {
  const normKey = (platform || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  }[size];

  // Map to official logo and background colors
  let iconNode: React.ReactNode = null;
  let bgClass = 'bg-slate-900 text-white';

  if (normKey.includes('twitter') || normKey === 'x' || normKey === 'xtwitter') {
    iconNode = <XTwitterIcon className={iconSizes} />;
    bgClass = 'bg-black text-white dark:bg-slate-900 border border-slate-800';
  } else if (normKey.includes('linkedin')) {
    iconNode = <LinkedInIcon className={iconSizes} />;
    bgClass = 'bg-[#0077b5] text-white';
  } else if (normKey.includes('facebook') || normKey === 'fb') {
    iconNode = <FacebookIcon className={iconSizes} />;
    bgClass = 'bg-[#1877f2] text-white';
  } else if (normKey.includes('instagram') || normKey === 'ig') {
    iconNode = <InstagramIcon className={iconSizes} />;
    bgClass = 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white';
  } else if (normKey.includes('tiktok')) {
    iconNode = <TikTokIcon className={iconSizes} />;
    bgClass = 'bg-black text-white border border-slate-800 shadow-sm';
  } else if (normKey.includes('pinterest')) {
    iconNode = <PinterestIcon className={iconSizes} />;
    bgClass = 'bg-[#e60023] text-white';
  } else if (normKey.includes('youtube') || normKey === 'yt') {
    iconNode = <YouTubeIcon className={iconSizes} />;
    bgClass = 'bg-[#ff0000] text-white';
  } else if (normKey.includes('threads')) {
    iconNode = <ThreadsIcon className={iconSizes} />;
    bgClass = 'bg-slate-950 text-white border border-slate-800';
  } else if (normKey.includes('google') || normKey.includes('business')) {
    iconNode = <GoogleBusinessIcon className={iconSizes} />;
    bgClass = 'bg-white text-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs';
  } else {
    iconNode = <span className="font-bold uppercase">{(platform || '?').charAt(0)}</span>;
    bgClass = 'bg-indigo-600 text-white';
  }

  if (!showBackground) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{iconNode}</span>;
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 transition-transform shadow-xs ${sizeClasses} ${bgClass} ${className}`}
    >
      {iconNode}
    </div>
  );
}
