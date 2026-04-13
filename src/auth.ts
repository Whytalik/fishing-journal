import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/db/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
  providers: [

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const identifier = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email or name (since we want to support username login)
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { name: identifier }
            ]
          },
        });

        console.log("User found:", user ? user.id : "Not found");

        if (!user || !user.password) {
          console.log("User not found or has no password");
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("Password invalid");
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    session({ session, user, token }) {
      if (session.user && (user?.id || token?.sub)) {
        session.user.id = user?.id || (token?.sub as string);
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
