import type { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import { refreshGoogleAccessToken } from "@/lib/google/tracker-provisioning"

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
const GOOGLE_OAUTH_SCOPE = [
  "openid",
  "email",
  "profile",
  // Tracker provisioning copies a pre-existing template spreadsheet by ID.
  // `drive.file` is too narrow for Drive to read arbitrary existing templates
  // that were not created or explicitly opened by this app, which can surface
  // as a misleading 404 "File not found" from files.copy.
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ")

async function refreshGoogleJwtToken(token: JWT): Promise<JWT> {
  if (!token.googleRefreshToken) {
    return {
      ...token,
      googleTokenError: "RefreshAccessTokenError",
    }
  }

  try {
    const refreshedToken = await refreshGoogleAccessToken(token.googleRefreshToken)

    return {
      ...token,
      googleAccessToken: refreshedToken.accessToken,
      googleAccessTokenExpiresAt: refreshedToken.expiresAt,
      googleRefreshToken: refreshedToken.refreshToken,
      googleTokenError: undefined,
    }
  } catch {
    return {
      ...token,
      googleTokenError: "RefreshAccessTokenError",
    }
  }
}

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
              scope: GOOGLE_OAUTH_SCOPE,
              access_type: "offline",
              prompt: "consent",
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.googleAccessToken = account.access_token
        token.googleRefreshToken = account.refresh_token ?? token.googleRefreshToken
        token.googleAccessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : undefined
        token.googleTokenError = undefined
      }

      if (
        token.googleAccessToken &&
        token.googleAccessTokenExpiresAt &&
        Date.now() < token.googleAccessTokenExpiresAt - 60_000
      ) {
        return token
      }

      if (!token.googleRefreshToken) {
        return token
      }

      return refreshGoogleJwtToken(token)
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}
