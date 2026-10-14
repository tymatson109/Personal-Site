"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { EntryScreen } from "@/components/media/EntryVisual";
import { PhoneShell } from "@/components/media/PhoneFrame";
import { entryHref } from "@/lib/content";
import { demoSrc } from "@/lib/demos";
import { pad2 } from "@/lib/format-date";
import { activeStory, STORY_LINE, storyProgress } from "@/lib/tour";
import styles from "./Tour.module.css";

type Stop = { entry: Entry; sectionName: string };
type Props = { stops: Stop[] };

/** The scroll story: one phone stays in view and slides to each project as its story scrolls past. */
export function Tour({ stops }: Props) {
  const storyRefs = useRef<(HTMLElement | null)[]>([]);
  const segRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const line = innerHeight * STORY_LINE;
      const rects = storyRefs.current.flatMap((el) => (el ? [el.getBoundingClientRect()] : []));
      rects.forEach((r, i) => {
        const seg = segRefs.current[i];
        if (seg) seg.style.transform = `scaleX(${storyProgress(r.top, r.height, line)})`;
      });
      setActive(activeStory(rects.map((r) => r.top), line));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const count = pad2(stops.length);

  return (
    <>
      <div className={styles.intro} data-reveal>
        <Label>The tour · {stops.length} projects</Label>
        <h2>Selected work</h2>
      </div>

      <div id="tour" className={styles.stage}>
        <div className={styles.phoneCol}>
          <div className={styles.phone}>
            <PhoneShell fitHeight>
              <div className={styles.track} style={{ "--active": active } as CSSProperties}>
                {stops.map(({ entry }, i) => (
                  <div key={entry.id} className={styles.slide} inert={i !== active} aria-hidden={i !== active}>
                    <EntryScreen entry={entry} />
                  </div>
                ))}
              </div>
            </PhoneShell>
          </div>
          <span className={styles.rail} aria-hidden="true">
            {stops.map((s, i) => (
              <span key={s.entry.id} className={styles.seg}>
                <i
                  ref={(el) => {
                    segRefs.current[i] = el;
                  }}
                />
              </span>
            ))}
          </span>
        </div>

        <div className={styles.stories}>
          {stops.map(({ entry, sectionName }, i) => (
            <article
              key={entry.id}
              ref={(el) => {
                storyRefs.current[i] = el;
              }}
              className={styles.story}
              data-active={i === active}
              aria-label={entry.title}
            >
              <Label>
                {pad2(i + 1)} / {count} · {sectionName}
              </Label>
              <h3 className={styles.title}>{entry.title}</h3>
              <p className={styles.summary}>{entry.summary}</p>
              <ChipRow>
                {entry.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </ChipRow>
              <Button href={entryHref(entry)} variant="primary">
                {entry.blocks.some((b) => demoSrc(b)) ? "Try the live app →" : "See the project →"}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
