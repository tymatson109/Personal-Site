import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostPage } from "@/components/entry/PostPage";
import { ProjectPage } from "@/components/entry/ProjectPage";
import { getEntries, getSections } from "@/features/content/queries";
import { findEntry, liveEntries } from "@/lib/content";

export async function generateStaticParams() {
  return liveEntries(await getEntries()).map((e) => ({ section: e.section, slug: e.slug }));
}

async function load(params: PageProps<"/[section]/[slug]">["params"]) {
  const { section: sectionSlug, slug } = await params;
  const [sections, entries] = await Promise.all([getSections(), getEntries()]);
  const section = sections.find((s) => s.slug === sectionSlug);
  const entry = findEntry(entries, sectionSlug, slug);
  return section && entry ? { section, entry } : null;
}

export async function generateMetadata(props: PageProps<"/[section]/[slug]">): Promise<Metadata> {
  const found = await load(props.params);
  return found ? { title: found.entry.title, description: found.entry.summary } : {};
}

// Grid sections hold projects shown beside their app; list sections hold posts to read
export default async function EntryPage(props: PageProps<"/[section]/[slug]">) {
  const found = await load(props.params);
  if (!found) notFound();
  return found.section.layout === "grid" ? <ProjectPage {...found} /> : <PostPage {...found} />;
}
