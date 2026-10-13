"use client";

import { useEffect, useRef, useState } from "react";
import { follow } from "@/lib/motion";
import styles from "./RingCursor.module.css";

const TOUCHABLE = "a, button, [role='button'], summary, label";

/** A blue ring that trails the mouse and grows over anything clickable; never on touch screens or with reduced motion. */
export function RingCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const ring = ringRef.current;
    if (!enabled || !ring) return;
    const at = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let frame = 0;

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      ring.dataset.big = String(!!(e.target as Element).closest?.(TOUCHABLE));
    };
    const tick = () => {
      at.x = follow(at.x, target.x);
      at.y = follow(at.y, target.y);
      ring.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return enabled ? <div ref={ringRef} className={styles.ring} aria-hidden="true" /> : null;
}
