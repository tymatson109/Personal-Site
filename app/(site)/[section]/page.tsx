import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionEntries } from "@/components/entries/SectionEntries";
import { PageHeading } from "@/components/site/PageHeading";
import { Container } from "@/components/ui/Container";
import { getEntries, getSections } from "@/features/content/queries";
import { liveEntries } from "@/lib/content";
import styles from "./page.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getSections()).map((s) => ({ section: s.slug }));
}

async function findSection(slug: string) {
  return (await getSections()).find((s) => s.slug === slug);
}

export async function generateMetadata(props: PageProps<"/[section]">): Promise<Metadata> {
  const { section } = await props.params;
  return { title: (await findSection(section))?.name };
}

export default async function SectionPage(props: PageProps<"/[section]">) {
  const { section: slug } = await props.params;
  const section = await findSection(slug);
  if (!section) notFound();
  const entries = liveEntries(await getEntries(), section.slug);
  return (
    <>
      <PageHeading title={section.name} label={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`} />
      <Container className={styles.list}>
        <SectionEntries entries={entries} layout={section.layout} name={section.name} />
      </Container>
    </>
  );
}
