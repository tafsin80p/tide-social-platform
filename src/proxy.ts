import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  // Check if the user is authenticated securely
  const token = request.cookies.get('tido_auth')?.value;
  let isAuthenticated = false;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      isAuthenticated = true;
    }
  }

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';

  if (!isAuthenticated && !isAuthPage) {
    // Redirect to login if not authenticated and trying to access a protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && isAuthPage) {
    // Redirect to home if authenticated and trying to access login/register
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     * - manifest.json
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
