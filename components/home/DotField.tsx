"use client";

import { useEffect, useRef } from "react";
import { dotAt, dotGap, pointerReach, type Pointer } from "@/lib/dot-field";
import styles from "./DotField.module.css";

const MAX_PIXEL_RATIO = 2;

function readToken(el: Element, name: string) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** The hero backdrop: draws the dot field each frame, or one still frame under reduced motion. */
export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const bg = readToken(canvas, "--image-bg");
    const cool = readToken(canvas, "--hero-dot-rgb");
    const hot = readToken(canvas, "--hero-dot-hot-rgb");
    let pointer: Pointer = null;
    let frame = 0;
    let width = 0;
    let height = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w !== width || h !== height) {
        const ratio = Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO);
        width = w;
        height = h;
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      const t = (now - start) / 1000;
      const gap = dotGap(w);
      const reach = pointerReach(w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dot = dotAt(x, y, t, pointer, reach);
          ctx.fillStyle = `rgb(${dot.hot ? hot : cool} / ${dot.alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const run = () => {
      cancelAnimationFrame(frame);
      if (reduce.matches) draw(start);
      else frame = requestAnimationFrame(loop);
    };

    // Draw only while the hero is on screen, to spare the phone's battery further down the page
    const visible = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) run();
      else cancelAnimationFrame(frame);
    });
    visible.observe(canvas);

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (reduce.matches) draw(start);
    };
    const leave = () => {
      pointer = null;
      if (reduce.matches) draw(start);
    };
    const resize = () => reduce.matches && draw(start);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerdown", move);
    host.addEventListener("pointerleave", leave);
    reduce.addEventListener("change", run);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      visible.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", move);
      host.removeEventListener("pointerleave", leave);
      reduce.removeEventListener("change", run);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
