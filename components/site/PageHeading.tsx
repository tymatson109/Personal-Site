import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import motion from "@/components/ui/motion.module.css";
import styles from "./PageHeading.module.css";

type Props = { title: string; label?: string };

/** The title block at the top of a page. */
export function PageHeading({ title, label }: Props) {
  return (
    <Container className={`${styles.block} ${motion.rise}`}>
      {label && <Label as="p">{label}</Label>}
      <h1 className={styles.title}>{title}</h1>
    </Container>
  );
}
