"use client";

import { useState } from "react";
import styles from "./PhoneFrame.module.css";

type Props = { src: string; title: string; startable: boolean };

/**
 * The app's demo build, loading as it nears the screen so visitors see it start up.
 * Where `startable` it waits behind "Tap to try"; elsewhere (inside a card's link) it only plays, and taps go to the link.
 */
export function DemoScreen({ src, title, startable }: Props) {
  const [started, setStarted] = useState(false);
  return (
    <>
      <iframe
        className={startable ? styles.video : `${styles.video} ${styles.preview}`}
        src={src}
        title={title}
        loading="lazy"
        inert={!started}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      {startable && !started && (
        <button type="button" className={styles.start} onClick={() => setStarted(true)}>
          <span className={styles.startLabel}>Tap to try</span>
        </button>
      )}
    </>
  );
}
