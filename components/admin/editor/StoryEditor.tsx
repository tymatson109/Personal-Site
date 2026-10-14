"use client";

import type { ComponentProps } from "react";
import { BlockEditor } from "./BlockEditor";
import controls from "./controls.module.css";
import styles from "./EntryEditor.module.css";

/** The labeled story an editor builds from blocks, shared by entries and pages. */
export function StoryEditor(props: ComponentProps<typeof BlockEditor>) {
  return (
    <section className={styles.story} aria-label="Story">
      <p className={controls.legend}>Story</p>
      <BlockEditor {...props} />
    </section>
  );
}
