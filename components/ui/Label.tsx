import type { ReactNode } from "react";
import styles from "./Label.module.css";

type Props = { children: ReactNode; as?: "span" | "p" };

/** Small mono uppercase text for metadata: dates, tags, read time. */
export function Label({ children, as: Tag = "span" }: Props) {
  return <Tag className={styles.label}>{children}</Tag>;
}
