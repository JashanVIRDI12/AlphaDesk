import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/users";

const CANONICAL_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXTAUTH_URL || "https://gettradingbias.com"
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Terminal ID", type: "text" },
        password: { label: "Access Code", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        const terminalId = credentials?.name?.trim();
        const accessCode = credentials?.password;

        if (!terminalId) {
          throw new Error("NAME_REQUIRED");
        }

        if (!accessCode) {
          throw new Error("PASSWORD_REQUIRED");
        }

        // Try authenticating against stored users first
        const user = await authenticateUser(terminalId, accessCode);
        if (user) {
          return {
            id: user.terminalId,
            name: user.fullName,
            email: user.email,
          };
        }

        // Fallback: check legacy AUTH_PASSWORD (for backward compatibility)
        const legacyPassword = process.env.AUTH_PASSWORD;
        if (legacyPassword && accessCode === legacyPassword) {
          return {
            id: terminalId.toLowerCase().replace(/\s+/g, "-"),
            name: terminalId,
          };
        }

        throw new Error("INVALID_PASSWORD");
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url }) {
      // Avoid misconfigured NEXTAUTH_URL (e.g. localhost) in production deployments.
      // Always redirect users back to the canonical host.
      try {
        const target = new URL(url, CANONICAL_BASE_URL);
        const canonical = new URL(CANONICAL_BASE_URL);

        if (target.origin === canonical.origin) return target.toString();

        // If NextAuth passes a full external URL, ignore it and force dashboard.
        return new URL("/dashboard", CANONICAL_BASE_URL).toString();
      } catch {
        return new URL("/dashboard", CANONICAL_BASE_URL).toString();
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email ?? undefined;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
