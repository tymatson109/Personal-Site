import { EntryList } from "@/components/entries/EntryList";
import { Hero } from "@/components/home/Hero";
import { SectionBlock } from "@/components/home/SectionBlock";
import { Tour } from "@/components/home/Tour";
import { Container } from "@/components/ui/Container";
import { getEntries, getSections } from "@/features/content/queries";
import { liveEntries, sortedSections, tourEntries } from "@/lib/content";

const LATEST_COUNT = 4;

export default async function Home() {
  const [sections, entries] = await Promise.all([getSections(), getEntries()]);
  const nameOf = new Map(sections.map((s) => [s.slug, s.name]));
  const stops = tourEntries(sections, entries).map((entry) => ({ entry, sectionName: nameOf.get(entry.section) ?? "" }));
  const lists = sortedSections(sections).filter((s) => s.layout === "list");

  return (
    <>
      <Hero hasTour={stops.length > 0} />
      <Container>
        {stops.length > 0 && <Tour stops={stops} />}
        {lists.map((section) => {
          const latest = liveEntries(entries, section.slug).slice(0, LATEST_COUNT);
          if (!latest.length) return null;
          const name = section.name.toLowerCase();
          return (
            <SectionBlock key={section.slug} title={`Latest ${name}`} more={{ href: `/${section.slug}`, label: `All ${name}` }}>
              <EntryList entries={latest} layout={section.layout} name={section.name} />
            </SectionBlock>
          );
        })}
      </Container>
    </>
  );
}
