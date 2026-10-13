import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import motion from "@/components/ui/motion.module.css";
import { RiseWords } from "@/components/ui/RiseWords";
import styles from "./PageHeading.module.css";

type Props = { title: string; label?: string; action?: ReactNode };

/** The title block at the top of a page. */
export function PageHeading({ title, label, action }: Props) {
  return (
    <Container className={`${styles.block} ${motion.rise}`}>
      {label && <Label as="p">{label}</Label>}
      <h1 className={styles.title}>
        <RiseWords text={title} />
      </h1>
      {action && <div className={styles.action}>{action}</div>}
    </Container>
  );
}
