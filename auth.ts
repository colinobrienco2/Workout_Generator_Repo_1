import type { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID as string,
          clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
          authorization: {
            params: {
              scope: "openid email profile",
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}
