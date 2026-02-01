import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Initialize NextAuth with Edge-compatible config for middleware
const { auth } = NextAuth(authConfig);

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

export default auth(async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = (request as any).auth;
    const token = session?.user;

    // Check if route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    console.log(`[MIDDLEWARE] Path: ${pathname}, Session: ${token ? 'Found' : 'MISSING'}`);

    // 1. Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !token) {
        console.log(`[MIDDLEWARE] Unauthenticated -> /login`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Redirect logged-in users from public routes (login/register) to Home
    if (isPublicRoute && token) {
        console.log(`[MIDDLEWARE] Authenticated -> /`);
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Multi-tenant Pairing Check:
    // If authenticated but NO coupleId, and trying to access couple features, redirect to /pair
    // (Allow /pair and /profile as they are for setup)
    if (token && isProtectedRoute && !(token as any).coupleId && !['/pair', '/profile'].some(p => pathname.startsWith(p))) {
        console.log(`[MIDDLEWARE] Unpaired -> /pair`);
        return NextResponse.redirect(new URL('/pair', request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (handled separately)
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|_next).*)',
    ],
};
