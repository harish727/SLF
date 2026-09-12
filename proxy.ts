import { NextRequest, NextResponse } from 'next/server';
import type { SessionPayload } from '@/lib/auth/session';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/verify-email', '/reset-password', '/invite'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const raw = req.cookies.get('slf_session')?.value;
  const session: SessionPayload | null = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isOnboarding = pathname.startsWith('/onboarding');

  // ── Not authenticated
  if (!session) {
    if (!isPublic) return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.next();
  }

  // ── Authenticated — run state machine
  const { emailVerified, onboardingComplete, role } = session;

  // Already logged in, don't let them back to auth pages
  if (isPublic && !pathname.startsWith('/verify-email')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Email not verified → only /verify-email allowed
  if (!emailVerified && !pathname.startsWith('/verify-email')) {
    return NextResponse.redirect(new URL('/verify-email', req.url));
  }

  // Verified but onboarding incomplete → only /onboarding allowed (athletes only)
  if (emailVerified && !onboardingComplete && role === 'athlete' && !isOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Fully set up → don't let them back to onboarding
  if (onboardingComplete && isOnboarding) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
