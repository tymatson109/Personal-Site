import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { EntryEditor } from "@/components/admin/editor/EntryEditor";
import { getAdminEntry } from "@/features/admin/content";
import { requireAdmin } from "@/features/admin/session";
import { getSections } from "@/features/content/queries";
import { isEntryId } from "@/lib/admin-entries";
import { sortedSections } from "@/lib/content";

export const metadata: Metadata = { title: "Edit" };

export default async function EditEntryPage(props: PageProps<"/admin/entries/[id]">) {
  const admin = await requireAdmin();
  const { id } = await props.params;
  if (!isEntryId(id)) notFound();
  const [found, sections] = await Promise.all([getAdminEntry(admin, id), getSections()]);
  if (!found || found.deletedAt) notFound();
  const { entry } = found;
  return (
    <AdminFrame title={entry.title || "Untitled"} note="Changes are kept only when you tap Save.">
      <EntryEditor entry={entry} sections={sortedSections(sections)} />
    </AdminFrame>
  );
}
