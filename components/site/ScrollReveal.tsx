"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { holdsForReveal, revealDelay } from "@/lib/motion";

// Lets elements count as seen a little before their bottom edge clears the screen
const ROOT_MARGIN = "0px 0px -8% 0px";

/** Holds every [data-reveal] element below the first screen until it scrolls into view, then lets it rise in. */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          delete (e.target as HTMLElement).dataset.held;
          seen.unobserve(e.target);
        }),
      { rootMargin: ROOT_MARGIN },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
      if (!holdsForReveal(el.getBoundingClientRect().top, innerHeight)) return;
      el.dataset.held = "";
      el.style.transitionDelay = `${revealDelay(i)}ms`;
      seen.observe(el);
    });
    return () => {
      seen.disconnect();
      document.querySelectorAll<HTMLElement>("[data-held]").forEach((el) => delete el.dataset.held);
    };
  }, [pathname]);

  return null;
}
