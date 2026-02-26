import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const CANONICAL_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXTAUTH_URL || "https://gettradingbias.com"
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/dashboard",
  },
  callbacks: {
    async redirect({ url }) {
      try {
        const target = new URL(url, CANONICAL_BASE_URL);
        const canonical = new URL(CANONICAL_BASE_URL);
        if (target.origin === canonical.origin) return target.toString();
        return new URL("/dashboard", CANONICAL_BASE_URL).toString();
      } catch {
        return new URL("/dashboard", CANONICAL_BASE_URL).toString();
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email ?? undefined;
        session.user.image = (token.picture as string | null) ?? session.user.image ?? undefined;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
