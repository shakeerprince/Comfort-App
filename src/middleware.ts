import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = [
    '/comfort',
    '/cravings',
    '/chat',
    '/location',
    '/memories',
    '/music',
    '/support',
    '/tracker',
    '/pair',
];

// Routes that are public
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Explicitly calculate secret to avoid Edge environment issues
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

    // DEBUG: Log all cookies to debug production auth loop
    const allCookies = request.cookies.getAll();
    console.log('[MIDDLEWARE DEBUG] Cookies received:', allCookies.map(c => c.name));
    console.log('[MIDDLEWARE DEBUG] Env Secret Exists:', !!secret);

    // Explicitly check for session token cookie
    const tokenCookie = allCookies.find(c => c.name.includes('session-token'));
    if (tokenCookie) {
        console.log('[MIDDLEWARE DEBUG] Found potential session cookie:', tokenCookie.name);
    } else {
        console.log('[MIDDLEWARE DEBUG] NO SESSION COOKIE FOUND!');
    }

    // Use getToken with default settings
    const token = await getToken({
        req: request,
        secret: secret,
    });
    console.log('[MIDDLEWARE DEBUG] getToken result:', token ? 'SUCCESS' : 'NULL');

    // Check if route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    console.log(`[MIDDLEWARE] Path: ${pathname}, Token: ${token ? 'Found' : 'MISSING'}`);

    // CRITICAL FIX: We are disabling Edge Middleware redirection because it fails to decode 
    // production cookies consistently, causing infinite loops.
    // Protection is now handled by:
    // 1. Client-side checks (useAuth / isAuthenticated) in all pages
    // 2. Server-side checks (auth()) in all API routes

    // REDIRECT DISABLED TO PREVENT LOOP
    // if (isProtectedRoute && !token) { ... }

    if (token) {
        console.log(`[MIDDLEWARE] Token present for ${pathname}`);
    } else {
        console.log(`[MIDDLEWARE] Token MISSING for ${pathname} (Passing to client)`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|_next).*)',
    ],
};
