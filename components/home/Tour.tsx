"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { EntryVisual } from "@/components/media/EntryVisual";
import { entryHref } from "@/lib/content";
import { pad2 } from "@/lib/format-date";
import { activeStop, stopFrame, stopProgress, tourTarget, type TourMove } from "@/lib/tour";
import styles from "./Tour.module.css";

type Stop = { entry: Entry; sectionName: string };
type Props = { stops: Stop[] };

function headerHeight() {
  return document.querySelector("header")?.offsetHeight ?? 0;
}

/** The scroll story: each featured project pins, its app grows in, then its story; a bar steps through them. */
export function Tour({ stops }: Props) {
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const segRefs = useRef<(HTMLElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    const update = () => {
      ticking = false;
      const head = headerHeight();
      const els = stopRefs.current.filter((el): el is HTMLElement => !!el);
      const rects = els.map((el) => el.getBoundingClientRect());
      els.forEach((el, i) => {
        const stick = el.firstElementChild as HTMLElement;
        const progress = stopProgress(rects[i].top, head, el.offsetHeight, stick.offsetHeight);
        const frame = stopFrame(reduce.matches ? 1 : progress);
        const media = el.querySelector<HTMLElement>("[data-media]");
        const text = el.querySelector<HTMLElement>("[data-text]");
        if (media) media.style.transform = `translateY(${frame.mediaY}px) scale(${frame.mediaScale})`;
        if (text) {
          text.style.opacity = String(frame.textOpacity);
          text.style.transform = `translateY(${frame.textY}px)`;
        }
        el.querySelectorAll<HTMLElement>("[data-tags] > *").forEach((tag, k) => {
          tag.style.opacity = String(frame.tagOpacity(k));
        });
        const seg = segRefs.current[i];
        if (seg) seg.style.transform = `scaleX(${rects[i].top <= head + 2 ? progress : 0})`;
      });
      setActive(activeStop(rects, head, innerHeight));
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

  const go = (move: TourMove) => {
    const target = tourTarget(move, active, stops.length);
    const head = headerHeight();
    const topOf = (el: Element | null | undefined) => (el ? el.getBoundingClientRect().top + scrollY : 0);
    const y =
      target.kind === "top"
        ? 0
        : target.kind === "intro"
          ? topOf(introRef.current) - head
          : target.kind === "after"
            ? topOf(afterRef.current) - head
            : topOf(stopRefs.current[target.index]) - head + 2;
    window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const count = pad2(stops.length);

  return (
    <>
      <div ref={introRef} className={styles.intro}>
        <div className={styles.introTitle}>
          <Label>The tour · {stops.length} projects</Label>
          <h2>Selected work</h2>
        </div>
        <Label>Scroll to walk through</Label>
      </div>

      {stops.map(({ entry, sectionName }, i) => (
        <section
          key={entry.id}
          id={i === 0 ? "tour" : undefined}
          ref={(el) => {
            stopRefs.current[i] = el;
          }}
          className={styles.stop}
          aria-label={entry.title}
        >
          <div className={styles.stick}>
            <div className={styles.text} data-text>
              <Label>
                {pad2(i + 1)} / {count} · {sectionName}
              </Label>
              <h3 className={styles.title}>{entry.title}</h3>
              <p className={styles.summary}>{entry.summary}</p>
              <div data-tags>
                <ChipRow>
                  {entry.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </ChipRow>
              </div>
              <Button href={entryHref(entry)} variant="primary">
                {entry.blocks.some((b) => b.type === "demo") ? "Try the live app →" : "See the project →"}
              </Button>
            </div>
            <div className={styles.media} data-media>
              <EntryVisual entry={entry} fitHeight />
            </div>
          </div>
        </section>
      ))}

      <div ref={afterRef} />

      <nav className={styles.bar} data-show={active >= 0} aria-label="Tour" aria-hidden={active < 0} inert={active < 0}>
        <Button size="sm" onClick={() => go("prev")} label="Previous project">
          ↑ Back
        </Button>
        <span className={styles.segs} aria-hidden="true">
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
        <span className={styles.count}>
          <Label>
            {pad2(Math.max(active, 0) + 1)}/{count}
          </Label>
        </span>
        <Button size="sm" onClick={() => go("next")} label="Next project">
          Next ↓
        </Button>
        <Button size="sm" onClick={() => go("exit")} label="Exit the tour">
          ✕ Exit
        </Button>
      </nav>
    </>
  );
}
