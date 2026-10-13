"use client";

import Link from "next/link";
import { useState } from "react";
import type { Entry } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import { entryHref } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { readMinutes } from "@/lib/read-time";
import { WritingCard } from "./WritingCard";
import styles from "./WritingList.module.css";

// Matches the CSS that hides the side preview, so taps expand a row in place instead
const TOUCH_UI = "(max-width: 860px), (hover: none)";

/** Posts as dated rows with a live preview beside them; on touch screens a tap opens the preview inline. */
export function WritingList({ entries }: { entries: Entry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const [openId, setOpenId] = useState<string | null>(null);
  const active = entries.find((e) => e.id === activeId) ?? entries[0];
  if (!active) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.rows}>
        {entries.map((entry) => {
          const open = openId === entry.id;
          return (
            <div key={entry.id} className={styles.item}>
              <Link
                href={entryHref(entry)}
                className={styles.row}
                aria-current={entry.id === active.id ? "true" : undefined}
                aria-expanded={open}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActiveId(entry.id)}
                onFocus={() => !matchMedia(TOUCH_UI).matches && setActiveId(entry.id)}
                onClick={(e) => {
                  if (!matchMedia(TOUCH_UI).matches) return;
                  e.preventDefault();
                  setOpenId(open ? null : entry.id);
                }}
              >
                <Label>{formatDate(entry.date)}</Label>
                <span className={styles.title}>
                  {entry.title}
                  <span className={styles.sub}>{entry.summary}</span>
                </span>
                <span className={styles.mins}>
                  <Label>{readMinutes(entry.blocks)} min</Label>
                </span>
              </Link>
              {open && (
                <div className={styles.inline}>
                  <WritingCard entry={entry} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <aside className={styles.preview} aria-live="polite">
        <WritingCard key={active.id} entry={active} />
      </aside>
    </div>
  );
}
