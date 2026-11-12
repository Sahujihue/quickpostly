import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeEdgeSessionToken } from '@/lib/auth/jwt-edge';

const SESSION_COOKIE_NAME = 'socialhive_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const token =
    request.cookies.get('quickpostly_session')?.value ||
    request.cookies.get(SESSION_COOKIE_NAME)?.value ||
    bearerToken;
  const session = token ? decodeEdgeSessionToken(token) : null;
  const isAdmin = Boolean(
    session?.isSuperAdmin ||
    session?.role === 'SUPER_ADMIN' ||
    session?.role === 'ADMIN' ||
    session?.role === 'CONTENT_MANAGER' ||
    session?.role === 'SUPPORT'
  );

  // =========================================================================
  // 0. GLOBAL MAINTENANCE MODE ENFORCEMENT
  // =========================================================================
  const isMaintenanceActive =
    request.cookies.get('quickpostly_maintenance_mode')?.value === 'true';

  if (isMaintenanceActive) {
    const isWhitelisted =
      pathname.startsWith('/admin') ||
      pathname === '/login' ||
      pathname.startsWith('/api/v1/auth') ||
      pathname.startsWith('/api/v1/admin') ||
      pathname === '/maintenance';

    // Allow whitelisted routes for admin operations and login
    if (isWhitelisted) {
      return NextResponse.next();
    }

    // Authenticated administrators can bypass maintenance mode
    if (isAdmin) {
      return NextResponse.next();
    }

    // All public traffic and regular users are redirected to /maintenance
    return NextResponse.redirect(new URL('/maintenance', request.url));
  } else {
    // If maintenance mode is OFF, redirect anyone on /maintenance back to homepage
    if (pathname === '/maintenance') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 1. Protected Admin Panel Routes (/admin, /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only SUPER_ADMIN, ADMIN, CONTENT_MANAGER, or SUPPORT can access /admin
    if (session.role === 'USER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // 2. Protected Dashboard Routes (/dashboard, /dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Guest Only Routes (/login, /signup, /forgot-password, /reset-password)
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some((p) =>
    pathname.startsWith(p)
  );

  if (isAuthPage && session) {
    if (session.isSuperAdmin || session.role === 'ADMIN' || session.role === 'CONTENT_MANAGER' || session.role === 'SUPPORT') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon|apple-icon).*)',
  ],
};
