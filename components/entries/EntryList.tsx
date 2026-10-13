import type { Entry, SectionLayout } from "@/types/entry";
import { ProjectGrid } from "./ProjectGrid";
import { WritingList } from "./WritingList";
import styles from "./EntryList.module.css";

type Props = { entries: Entry[]; layout: SectionLayout; name: string };

/** A section's entries in its own layout: a card grid or dated rows with previews. */
export function EntryList({ entries, layout, name }: Props) {
  if (!entries.length) return <p className={styles.empty}>Nothing published in {name} yet.</p>;
  return layout === "grid" ? <ProjectGrid entries={entries} /> : <WritingList entries={entries} />;
}
