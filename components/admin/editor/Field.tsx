import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";
import styles from "./Field.module.css";

type Props = { label: string; hint?: string; children: ReactNode };

/** A labeled form control; the label wraps the control so tapping it focuses the input. */
export function Field({ label, hint, children }: Props) {
  return (
    <label className={styles.field}>
      <Label>{label}</Label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}
