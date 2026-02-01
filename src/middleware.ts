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

    // Use getToken with default settings. It automatically handles secure/non-secure cookies
    // and looks for AUTH_SECRET/NEXTAUTH_SECRET.
    const token = await getToken({
        req: request,
        secret: secret,
    });

    // Check if route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    console.log(`[MIDDLEWARE] Path: ${pathname}, Token: ${token ? 'Found' : 'MISSING'}`);

    // LOGIC:
    // 1. If trying to access a protected route and not logged in -> Login
    if (isProtectedRoute && !token) {
        console.log(`[MIDDLEWARE] Unauthorized -> Redirect to /login`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. If logged in and trying to access /login or /register -> Home
    if (isPublicRoute && token) {
        console.log(`[MIDDLEWARE] Already Logged In -> Redirect to /`);
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Multi-tenant Pairing Check:
    // If authenticated but NO coupleId, and trying to access couple features, redirect to /pair
    // (Allow /pair and /profile as they are for setup)
    if (token && isProtectedRoute && !token.coupleId && !['/pair', '/profile'].some(p => pathname.startsWith(p))) {
        console.log(`[MIDDLEWARE] Unpaired -> Redirect to /pair`);
        return NextResponse.redirect(new URL('/pair', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*|_next).*)',
    ],
};
