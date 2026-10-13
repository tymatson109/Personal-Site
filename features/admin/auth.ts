import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminGithubId } from "@/lib/admin";

// Reads AUTH_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET from the environment
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/admin/sign-in", error: "/admin/sign-in" },
  callbacks: {
    // Any other GitHub account is refused before a session exists
    signIn: ({ profile }) => isAdminGithubId(profile?.id),
    jwt: ({ token, profile }) => {
      if (profile) token.githubId = String(profile.id);
      return token;
    },
    session: ({ session, token }) => ({ ...session, githubId: token.githubId }),
  },
});
