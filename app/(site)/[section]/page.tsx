import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/site/PageHeading";
import { SAMPLE_SECTIONS } from "@/lib/sample/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return SAMPLE_SECTIONS.map((s) => ({ section: s.slug }));
}

function findSection(slug: string) {
  return SAMPLE_SECTIONS.find((s) => s.slug === slug);
}

export async function generateMetadata(props: PageProps<"/[section]">): Promise<Metadata> {
  const { section } = await props.params;
  return { title: findSection(section)?.name };
}

// Entries for each section arrive in PR 3
export default async function SectionPage(props: PageProps<"/[section]">) {
  const { section } = await props.params;
  const found = findSection(section);
  if (!found) notFound();
  return <PageHeading title={found.name} />;
}
