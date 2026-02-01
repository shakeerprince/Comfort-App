import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getUserByEmail, getCoupleByUserId, getPartnerInfo } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await getUserByEmail(credentials.email.toString().toLowerCase());
                if (!user || !user.password_hash) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password.toString(),
                    user.password_hash
                );

                if (!isPasswordValid) return null;

                // Fetch couple info during auth to populate initial token
                const couple = await getCoupleByUserId(user.id);
                let partnerId = null;
                let partnerName = null;

                if (couple) {
                    const partner = await getPartnerInfo(user.id, couple.id);
                    if (partner) {
                        partnerId = partner.id;
                        partnerName = partner.name;
                    }
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    coupleId: couple?.id || null,
                    partnerId,
                    partnerName,
                };
            },
        }),
    ],
});
