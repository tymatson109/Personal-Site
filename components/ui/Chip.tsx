import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type Props = { children: ReactNode; pressed?: boolean; onClick?: () => void };

/** A small mono tag; pressable when it filters. */
export function Chip({ children, pressed, onClick }: Props) {
  if (!onClick) {
    return (
      <span className={styles.chip}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
