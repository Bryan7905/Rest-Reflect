import { NextResponse } from 'next/server';
import { decrypt } from './lib/auth.js';

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('sanctuary_session')?.value;

  // Verify token
  let session = null;
  if (sessionToken) {
    session = await decrypt(sessionToken);
  }

  // Redirect logic
  if (!session && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to protect dashboard, journal, and bookshelf routes
export const config = {
  matcher: ['/', '/journal', '/journal/history', '/bookshelf', '/admin'],
};
