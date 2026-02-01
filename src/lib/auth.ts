import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getCoupleByUserId, getPartnerInfo } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await getUserByEmail(email);
                if (!user) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) {
                    return null;
                }

                // Get couple and partner info
                const couple = await getCoupleByUserId(user.id);
                let partner = null;
                if (couple) {
                    partner = await getPartnerInfo(couple.id, user.id);
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.profile_pic,
                    coupleId: couple?.id || null,
                    partnerId: partner?.id || null,
                    partnerName: partner?.name || null,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.coupleId = (user as any).coupleId;
                token.partnerId = (user as any).partnerId;
                token.partnerName = (user as any).partnerName;
            }

            // Handle session update (e.g., after joining a couple or profile update)
            if (trigger === "update" && session) {
                console.log('[AUTH] Session Update Trigger:', session);
                if (session.coupleId !== undefined) token.coupleId = session.coupleId;
                if (session.partnerId !== undefined) token.partnerId = session.partnerId;
                if (session.partnerName !== undefined) token.partnerName = session.partnerName;
                if (session.name) token.name = session.name;
                if (session.image) token.picture = session.image;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).coupleId = token.coupleId;
                (session.user as any).partnerId = token.partnerId;
                (session.user as any).partnerName = token.partnerName;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
});
