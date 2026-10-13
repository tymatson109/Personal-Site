"use client";

import { insertAt, removeAt, replaceAt } from "@/lib/list-ops";
import controls from "./controls.module.css";
import styles from "./FactsEditor.module.css";

type Fact = [label: string, value: string];
type Props = { facts: Fact[]; onChange: (facts: Fact[]) => void };

/** The label and value rows a project page shows beside its app, like Role or Platform. */
export function FactsEditor({ facts, onChange }: Props) {
  const set = (i: number, at: 0 | 1, text: string) => {
    const next: Fact = [...facts[i]];
    next[at] = text;
    onChange(replaceAt(facts, i, next));
  };
  return (
    <fieldset className={styles.facts}>
      <legend className={controls.legend}>Facts</legend>
      {facts.map(([label, value], i) => (
        <div key={i} className={styles.row}>
          <input className={controls.input} aria-label={`Fact ${i + 1} label`} placeholder="Label, like Platform" value={label} onChange={(e) => set(i, 0, e.target.value)} />
          <input className={controls.input} aria-label={`Fact ${i + 1} value`} placeholder="Value, like iPhone" value={value} onChange={(e) => set(i, 1, e.target.value)} />
          <button type="button" className={styles.remove} aria-label={`Remove fact ${i + 1}`} onClick={() => onChange(removeAt(facts, i))}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className={controls.quiet} onClick={() => onChange(insertAt(facts, facts.length, ["", ""]))}>
        + Add fact
      </button>
    </fieldset>
  );
}
