import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isAdminGithubId } from "@/lib/admin";
import { auth } from "./auth";

export type Admin = { githubId: string; name: string };

/** The signed-in admin, or null; re-checks the allowlist on every request, not only at sign-in. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const session = await auth();
  if (!session?.githubId || !isAdminGithubId(session.githubId)) return null;
  return { githubId: session.githubId, name: session.user?.name ?? "" };
});

/** Every admin page and server action starts here; anyone else is sent to sign in. */
export async function requireAdmin(): Promise<Admin> {
  return (await getAdmin()) ?? redirect("/admin/sign-in");
}
