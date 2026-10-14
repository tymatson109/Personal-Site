"use client";

import { useEffect, useRef } from "react";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { EntryVisual } from "@/components/media/EntryVisual";
import { entryHref, entryMedia } from "@/lib/content";
import { demoSrc } from "@/lib/demos";
import { pad2 } from "@/lib/format-date";
import { nameDrift, nameFill, storyReveal } from "@/lib/tour";
import styles from "./Tour.module.css";

type Stop = { entry: Entry; sectionName: string };
type Props = { stops: Stop[] };

/** The featured index: each project's name, set huge, drifts and fills with the accent as it crosses the screen. */
export function Tour({ stops }: Props) {
  const rowRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    const update = () => {
      ticking = false;
      rowRefs.current.forEach((row, i) => {
        const name = row?.querySelector<HTMLElement>("[data-name]");
        if (!row || !name) return;
        const top = name.getBoundingClientRect().top;
        const fill = reduce.matches ? 1 : nameFill(top, innerHeight);
        row.style.setProperty("--fill", String(fill));
        row.style.setProperty("--drift", `${reduce.matches ? 0 : nameDrift(top, innerHeight, i)}px`);
        row.style.setProperty("--show", String(reduce.matches ? 1 : storyReveal(fill)));
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <>
      <div className={styles.intro} data-reveal>
        <Label>The tour · {stops.length} projects</Label>
        <h2>Selected work</h2>
      </div>

      <div id="tour" className={styles.list}>
        {stops.map(({ entry, sectionName }, i) => (
          <article
            key={entry.id}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className={styles.row}
            aria-label={entry.title}
          >
            <span className={styles.num}>
              <Label>
                {pad2(i + 1)} · {sectionName}
              </Label>
            </span>
            <h3 className={styles.name} data-name>
              <span className={styles.ghost}>{entry.title}</span>
              <span className={styles.fill} aria-hidden="true">
                {entry.title}
              </span>
            </h3>
            <div className={styles.body}>
              <div className={styles.info}>
                <p className={styles.summary}>{entry.summary}</p>
                <ChipRow>
                  {entry.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </ChipRow>
                <Button href={entryHref(entry)} variant="primary">
                  {entry.blocks.some((b) => demoSrc(b)) ? "Try the live app →" : "See the project →"}
                </Button>
              </div>
              {entryMedia(entry, { live: false }).kind !== "type" && (
                <div className={styles.media}>
                  <EntryVisual entry={entry} fitHeight />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
