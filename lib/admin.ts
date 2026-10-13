// GitHub account ids (not usernames, which can be renamed and re-registered) allowed into /admin
export const ADMIN_GITHUB_IDS: readonly string[] = ["80430068"];

/** True only for an allowlisted GitHub id; GitHub sends ids as numbers, sessions store them as strings. */
export function isAdminGithubId(id: unknown, allowlist: readonly string[] = ADMIN_GITHUB_IDS): boolean {
  if (typeof id !== "string" && typeof id !== "number") return false;
  return allowlist.includes(String(id));
}

/** What the sign-in page says after Auth.js sends someone back with an error code. */
export function signInError(code: unknown): string | undefined {
  if (code === undefined) return undefined;
  if (code === "AccessDenied") return "That GitHub account isn't allowed in.";
  return "Sign-in didn't work. Try again.";
}
