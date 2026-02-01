import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Define protected and public routes
            const isPublicRoute = ["/login", "/register"].some(path => pathname.startsWith(path));
            const isPairingRoute = pathname.startsWith("/pair");
            const isProfileRoute = pathname.startsWith("/profile");

            // Redirect logged-in users away from login/register
            if (isPublicRoute && isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl));
            }

            return true; // Use middleware for more complex logic
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.coupleId = (user as any).coupleId;
                token.partnerId = (user as any).partnerId;
                token.partnerName = (user as any).partnerName;
            }
            if (trigger === "update" && session) {
                if (session.coupleId !== undefined) token.coupleId = session.coupleId;
                if (session.partnerId !== undefined) token.partnerId = session.partnerId;
                if (session.partnerName !== undefined) token.partnerName = session.partnerName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).coupleId = token.coupleId;
                (session.user as any).partnerId = token.partnerId;
                (session.user as any).partnerName = token.partnerName;
            }
            return session;
        },
    },
    providers: [], // Providers are added in the Node.js auth file
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
} satisfies NextAuthConfig;
