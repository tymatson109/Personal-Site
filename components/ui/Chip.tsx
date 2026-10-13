import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type Props = { children: ReactNode; pressed?: boolean; onClick?: () => void; href?: string };

/** A small mono tag; pressable when it filters, a link when the filter lives in the URL. */
export function Chip({ children, pressed, onClick, href }: Props) {
  if (href !== undefined) {
    return (
      <Link className={styles.chip} href={href} aria-current={pressed ? "page" : undefined}>
        {children}
      </Link>
    );
  }
  if (!onClick) {
    return <span className={styles.chip}>{children}</span>;
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
