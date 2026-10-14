"use client";

import { useId, useState } from "react";
import type { Block } from "@/types/entry";
import { QUOTE_MAX } from "@/lib/entry-input";
import { quotablePassages } from "@/lib/sentences";
import { AutoTextarea } from "./AutoTextarea";
import controls from "./controls.module.css";
import { Field } from "./Field";
import styles from "./QuotePicker.module.css";

type Props = { blocks: readonly Block[]; value: string; onChange: (quote: string) => void };

/** The highlight quote: tap a sentence of the post to mark it, tap it again to clear, or type a line by hand. */
export function QuotePicker({ blocks, value, onChange }: Props) {
  const name = useId();
  const passages = quotablePassages(blocks, QUOTE_MAX);
  const chosen = value.trim();
  // Starts open while no quote is chosen; after that only Ty opens or closes it
  const [startOpen] = useState(!chosen);

  return (
    <div className={styles.picker}>
      <Field label="Highlight quote" hint="Shown in the preview and as a pull quote. Leave empty to use the first quote block.">
        <AutoTextarea className={controls.input} value={value} onChange={(e) => onChange(e.target.value)} />
      </Field>
      {passages.length > 0 && (
        <details className={styles.post} open={startOpen}>
          <summary className={controls.quiet}>Pick a sentence from the post</summary>
          <fieldset className={styles.passages}>
            <legend className={styles.hint}>Tap a sentence to make it the quote. Tap it again to clear.</legend>
            {passages.map((passage) => (
              <p key={passage.key} className={styles.passage}>
                {passage.sentences.map((sentence, i) => (
                  <label key={i} className={styles.sentence}>
                    <input
                      type="radio"
                      name={name}
                      checked={sentence === chosen}
                      readOnly
                      onClick={() => onChange(sentence === chosen ? "" : sentence)}
                    />
                    {sentence}
                  </label>
                ))}
              </p>
            ))}
          </fieldset>
        </details>
      )}
    </div>
  );
}
