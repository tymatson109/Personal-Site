import type { ReactNode } from "react";
import styles from "./Container.module.css";

type Props = { children: ReactNode; className?: string };

/** The single editorial column every page sits in. */
export function Container({ children, className }: Props) {
  return <div className={className ? `${styles.col} ${className}` : styles.col}>{children}</div>;
}
