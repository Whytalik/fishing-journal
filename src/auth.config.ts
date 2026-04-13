import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedPath = ["/sessions", "/stats", "/settings", "/species"].some(
        (path) => nextUrl.pathname.startsWith(path)
      )

      if (isOnProtectedPath) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
  providers: [], // providers are added in auth.ts
} satisfies NextAuthConfig

export default authConfig;
