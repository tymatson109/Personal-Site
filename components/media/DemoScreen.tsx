"use client";

import { useState } from "react";
import styles from "./PhoneFrame.module.css";

type Props = { src: string; title: string };

/** The app's demo build, loading behind "Tap to try" as it nears the screen, so visitors see it start up before they take control. */
export function DemoScreen({ src, title }: Props) {
  const [started, setStarted] = useState(false);
  return (
    <>
      <iframe
        className={styles.video}
        src={src}
        title={title}
        loading="lazy"
        inert={!started}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
      {!started && (
        <button type="button" className={styles.start} onClick={() => setStarted(true)}>
          <span className={styles.startLabel}>Tap to try</span>
        </button>
      )}
    </>
  );
}
