import { NextRequest, NextResponse } from 'next/server';
import { incrementVisitCount } from '@/lib/visit-count';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  // Increment visit count in the background so we don't block the response
  void incrementVisitCount();
  return res;
}

export const config = {
  // Run only on page navigations (exclude /api, _next, static files)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)'],
};
