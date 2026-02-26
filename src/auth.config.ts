import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible Auth.js config — NO Drizzle adapter, NO Node.js imports.
 * Used by middleware.ts (Edge Runtime) for route protection.
 *
 * The full config in auth.ts imports this and adds the Drizzle adapter
 * for Route Handlers and Server Components (Node.js runtime).
 */
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // Credentials provider declared here for the middleware to recognize it,
    // but authorize() is only in the full auth.ts config (needs DB access).
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize() {
        // Stub — real logic is in auth.ts which overrides this provider.
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;
