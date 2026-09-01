import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

if (
  !process.env.NEXT_PUBLIC_API_URL &&
  process.env.VERCEL_ENV === "production"
) {
  process.env.NEXTAUTH_URL = "https://codascript.vercel.app";
} else {
  console.warn(
    "⚠️ WARNING: NEXT_PUBLIC_API_URL is not set in NextAuth route, falling back to localhost - this will fail in production ⚠️",
  );
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // First sign in
      if (account && user) {
        try {
          const res = await fetch(`${API_URL}/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name:
                user.name || (user.email ? user.email.split("@")[0] : "User"),
              provider: account.provider,
              avatar: user.image || "",
            }),
          });
          const data = await res.json();
          if (data.success) {
            token.accessToken = data.data.accessToken;
            token.refreshToken = data.data.refreshToken;
          } else {
            console.error("OAuth backend error:", data);
          }
        } catch (e) {
          console.error("Failed to authenticate with backend via OAuth", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "codascript_secret_jwt",
});

export { handler as GET, handler as POST };
