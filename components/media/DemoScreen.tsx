"use client";

import { useState } from "react";
import styles from "./PhoneFrame.module.css";

type Props = { src: string; title: string };

/** The app's demo build, loaded only when the visitor taps, so a project page stays light until someone wants to try it. */
export function DemoScreen({ src, title }: Props) {
  const [started, setStarted] = useState(false);
  if (started) {
    return <iframe className={styles.video} src={src} title={title} sandbox="allow-scripts allow-same-origin allow-forms" />;
  }
  return (
    <button type="button" className={`${styles.slot} ${styles.start}`} onClick={() => setStarted(true)}>
      <span className={styles.startLabel}>Tap to try</span>
    </button>
  );
}
