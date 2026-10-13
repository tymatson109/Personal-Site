import { AdminFrame } from "@/components/admin/AdminFrame";
import { Button } from "@/components/ui/Button";
import { signOutAdmin } from "@/features/admin/actions";
import { requireAdmin } from "@/features/admin/session";

export default async function AdminHome() {
  const admin = await requireAdmin();
  return (
    <AdminFrame title={`Hi, ${admin.name || "Ty"}.`} note="You're signed in. Managing entries arrives in the next update.">
      <Button href="/" variant="primary">
        View the site
      </Button>
      <form action={signOutAdmin}>
        <Button submit>Sign out</Button>
      </form>
    </AdminFrame>
  );
}
