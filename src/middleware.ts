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
