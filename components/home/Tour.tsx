"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { SplashScreen } from "@/components/media/SplashScreen";
import { entryHref } from "@/lib/content";
import { pad2 } from "@/lib/format-date";
import type { Ink } from "@/lib/splash";
import { floodAmount, floodStep, INK_SWITCH } from "@/lib/tour";
import styles from "./Tour.module.css";

type Stop = { entry: Entry; sectionName: string; splash: string | null; flood: { color: string; ink: Ink } | null };
type Props = { stops: Stop[] };

const INK: Record<Ink, string> = { light: "var(--on-image)", dark: "var(--app-fg)" };

/** The featured tour: as each project nears the middle of the screen, its app's color pours over the page from its logo. */
export function Tour({ stops }: Props) {
  const stopRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    const update = () => {
      ticking = false;
      stopRefs.current.forEach((stop) => {
        if (!stop) return;
        const box = stop.getBoundingClientRect();
        const pour = floodAmount(box.top, box.height, innerHeight);
        const amount = reduce.matches ? floodStep(pour) : pour;
        const logo = stop.querySelector("[data-logo]")?.getBoundingClientRect();
        stop.style.setProperty("--amount", String(amount));
        stop.style.setProperty("--cx", `${logo ? logo.left + logo.width / 2 - box.left : box.width / 2}px`);
        stop.style.setProperty("--cy", `${logo ? logo.top + logo.height / 2 - box.top : box.height / 2}px`);
        stop.toggleAttribute("data-flooded", stop.dataset.ink !== undefined && amount >= INK_SWITCH);
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
    <section id="tour" className={styles.tour}>
      <Container>
        <div className={styles.intro} data-reveal>
          <Label>The tour · {stops.length} projects</Label>
          <h2>Selected work</h2>
        </div>
      </Container>

      {stops.map(({ entry, sectionName, splash, flood }, i) => (
        <article
          key={entry.id}
          ref={(el) => {
            stopRefs.current[i] = el;
          }}
          className={styles.stop}
          aria-label={entry.title}
          data-ink={flood?.ink}
          data-flooded={flood ? "" : undefined}
          style={flood ? ({ "--flood": flood.color, "--ink": INK[flood.ink] } as CSSProperties) : undefined}
        >
          {flood && <div className={styles.flood} aria-hidden="true" />}
          <div className={styles.inner}>
            <Label>
              {pad2(i + 1)} · {sectionName}
            </Label>
            {splash && (
              <div className={styles.logo} data-logo>
                <SplashScreen src={splash} fallback={null} className={styles.splash} />
              </div>
            )}
            <h3 className={styles.name}>{entry.title}</h3>
            <p className={styles.summary}>{entry.summary}</p>
            <Button href={entryHref(entry)} variant="primary">
              See the project →
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
