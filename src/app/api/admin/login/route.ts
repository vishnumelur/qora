import { NextResponse, type NextRequest } from 'next/server';
import {
  signSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/server/auth/session';
import { checkPassword, checkRateLimit, clearRateLimit } from '@/server/auth/password';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get('password') ?? '');
  const redirectTo = String(form.get('redirect') ?? '/admin');

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const rate = checkRateLimit(ip);
  if (rate.blocked) {
    return redirectWithError(req, redirectTo, 'Too many attempts. Please wait a few minutes.');
  }

  if (!checkPassword(password)) {
    return redirectWithError(req, redirectTo, 'Wrong password.');
  }

  clearRateLimit(ip);
  const token = await signSession();
  const url = new URL(safeRedirect(redirectTo), req.url);

  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

function redirectWithError(req: NextRequest, redirectTo: string, msg: string) {
  const url = new URL('/admin/login', req.url);
  url.searchParams.set('redirect', safeRedirect(redirectTo));
  url.searchParams.set('error', msg);
  return NextResponse.redirect(url, { status: 303 });
}

function safeRedirect(p: string): string {
  // Only allow same-origin redirects starting with /admin
  if (!p.startsWith('/admin')) return '/admin';
  return p;
}
