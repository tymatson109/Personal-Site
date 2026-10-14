import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { PageEditor } from "@/components/admin/editor/PageEditor";
import { requireAdmin } from "@/features/admin/session";
import { getPage } from "@/features/content/queries";

export const metadata: Metadata = { title: "About page" };

export default async function EditAboutPage() {
  await requireAdmin();
  const page = await getPage("about");
  if (!page) notFound();
  return (
    <AdminFrame title="About page" note="Changes are kept only when you tap Save.">
      <PageEditor page={page} />
    </AdminFrame>
  );
}
