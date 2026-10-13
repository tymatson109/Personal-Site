import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import styles from "./AdminFrame.module.css";

type Props = { title: string; note: string; error?: string; actions?: ReactNode; children?: ReactNode };

/** The admin's plain page: a title, a line about where you are, any error, the actions, then the page's body. */
export function AdminFrame({ title, note, error, actions, children }: Props) {
  return (
    <Container className={styles.frame}>
      <Label as="p">Admin</Label>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>{note}</p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </Container>
  );
}
