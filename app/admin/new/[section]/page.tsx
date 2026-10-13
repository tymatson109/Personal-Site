import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewEntryFlow } from "@/components/admin/new/NewEntryFlow";
import { requireAdmin } from "@/features/admin/session";
import { getSections } from "@/features/content/queries";

export const metadata: Metadata = { title: "New" };

export default async function NewEntryPage(props: PageProps<"/admin/new/[section]">) {
  await requireAdmin();
  const [{ section: slug }, sections] = await Promise.all([props.params, getSections()]);
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();
  return <NewEntryFlow section={section} />;
}
