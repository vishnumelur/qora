import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const url = new URL('/admin/login', req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
