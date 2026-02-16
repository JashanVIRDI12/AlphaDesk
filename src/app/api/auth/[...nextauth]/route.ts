import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/users";

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
