import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { Button } from "@/components/ui/Button";
import { signInWithGitHub } from "@/features/admin/actions";
import { getAdmin } from "@/features/admin/session";
import { signInError } from "@/lib/admin";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage(props: PageProps<"/admin/sign-in">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await props.searchParams;
  return (
    <AdminFrame
      title="Sign in"
      note="Only Ty's GitHub account can sign in here."
      error={signInError(error)}
      actions={
        <form action={signInWithGitHub}>
          <Button submit variant="primary">
            Sign in with GitHub
          </Button>
        </form>
      }
    />
  );
}
