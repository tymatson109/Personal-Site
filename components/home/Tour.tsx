"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { SplashScreen } from "@/components/media/SplashScreen";
import { entryHref } from "@/lib/content";
import { pad2 } from "@/lib/format-date";
import { channels, type Ink } from "@/lib/splash";
import { blendFlood, floodAmount, floodStep, INK_SWITCH } from "@/lib/tour";
import styles from "./Tour.module.css";

type Stop = { entry: Entry; sectionName: string; splash: string | null; flood: { color: string; ink: Ink } | null };
type Props = { stops: Stop[] };

const INK: Record<Ink, string> = { light: "var(--on-image)", dark: "var(--app-fg)" };

/** The featured tour: one backdrop pours out from the leading project's logo and glides from each app's color into the next as you scroll. */
export function Tour({ stops }: Props) {
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const colors = stops.map((s) => (s.flood ? channels(s.flood.color) : null));
    let ticking = false;

    const update = () => {
      ticking = false;
      const amounts = stopRefs.current.map((stop) => {
        if (!stop) return 0;
        const box = stop.getBoundingClientRect();
        const pour = floodAmount(box.top, box.height, innerHeight);
        const amount = reduce.matches ? floodStep(pour) : pour;
        stop.style.setProperty("--amount", String(amount));
        stop.toggleAttribute("data-flooded", stop.dataset.ink !== undefined && amount >= INK_SWITCH);
        return amount;
      });

      const backdrop = backdropRef.current;
      if (!backdrop) return;
      const blend = blendFlood(amounts.map((amount, i) => ({ rgb: colors[i], amount })));
      const logo = stopRefs.current[blend.lead]?.querySelector("[data-logo]")?.getBoundingClientRect();
      backdrop.style.setProperty("--coverage", String(blend.coverage));
      if (blend.rgb) backdrop.style.setProperty("--flood", `rgb(${blend.rgb.join(", ")})`);
      if (logo) {
        const box = backdrop.getBoundingClientRect();
        backdrop.style.setProperty("--cx", `${logo.left + logo.width / 2 - box.left}px`);
        backdrop.style.setProperty("--cy", `${logo.top + logo.height / 2 - box.top}px`);
      }
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
  }, [stops]);

  return (
    <section id="tour" className={styles.tour} aria-label="Selected work">
      {stops.some((s) => s.flood) && <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />}

      {stops.map(({ entry, sectionName, splash, flood }, i) => (
        <article
          key={entry.id}
          ref={(el) => {
            stopRefs.current[i] = el;
          }}
          className={styles.stop}
          aria-label={entry.title}
          data-ink={flood?.ink}
          style={flood ? ({ "--ink": INK[flood.ink] } as CSSProperties) : undefined}
        >
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
