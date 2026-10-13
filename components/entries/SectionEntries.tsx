"use client";

import { useState } from "react";
import type { Entry, SectionLayout } from "@/types/entry";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { tagsOf } from "@/lib/content";
import { EntryList } from "./EntryList";
import styles from "./SectionEntries.module.css";

type Props = { entries: Entry[]; layout: SectionLayout; name: string };

/** A section's entries with tag chips to narrow them, shown once there is more than one tag. */
export function SectionEntries({ entries, layout, name }: Props) {
  const [tag, setTag] = useState<string | null>(null);
  const tags = tagsOf(entries);
  const shown = tag ? entries.filter((e) => e.tags.includes(tag)) : entries;
  return (
    <>
      {tags.length > 1 && (
        <div className={styles.filters}>
          <ChipRow>
            <Chip pressed={!tag} onClick={() => setTag(null)}>
              All
            </Chip>
            {tags.map((t) => (
              <Chip key={t} pressed={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </ChipRow>
        </div>
      )}
      <EntryList key={tag ?? "all"} entries={shown} layout={layout} name={name} />
    </>
  );
}
