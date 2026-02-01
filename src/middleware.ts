import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

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

    // Redirect logged-in users away from login/register pages
    if (isPublicRoute && token) {
        console.log(`[MIDDLEWARE] Redirecting logged-in user away from public route: ${pathname}`);
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !token) {
        console.log(`[MIDDLEWARE] Redirecting unauthenticated user from protected route: ${pathname}`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Harden multi-tenant check: If user is authenticated but not paired, 
    // and trying to access couple-specific features, redirect to /pair
    // (Except for /pair and /profile which are used for setup)
    if (token && isProtectedRoute && !(token as any).coupleId && !['/pair', '/profile'].some(p => pathname.startsWith(p))) {
        console.log(`[MIDDLEWARE] User is authenticated but not paired. Redirecting to /pair`);
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
