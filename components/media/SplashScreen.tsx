"use client";

import { useState, type ReactNode } from "react";
import styles from "./PhoneFrame.module.css";

type Props = { src: string; fallback: ReactNode; className?: string };

/** The app's own splash screen, served by its demo build; an app that doesn't publish one shows the fallback instead. */
export function SplashScreen({ src, fallback, className = styles.video }: Props) {
  const [missing, setMissing] = useState(false);
  if (missing) return fallback;
  // The splash is an SVG from the app's own site, which next/image won't optimize or allow without opening SVG up site-wide
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt="" loading="lazy" onError={() => setMissing(true)} />;
}
