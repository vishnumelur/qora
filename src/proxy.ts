import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/server/auth/session';

const PUBLIC_ADMIN_PATHS = new Set<string>(['/admin/login']);
const PUBLIC_API_ADMIN_PATHS = new Set<string>([
  '/api/admin/login',
  '/api/admin/logout',
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname) || PUBLIC_API_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifySession(token);

  if (!payload) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
