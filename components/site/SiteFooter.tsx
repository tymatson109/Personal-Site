import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.foot}>
      <Container className={styles.row}>
        <Label>© {new Date().getFullYear()} Ty Matson</Label>
      </Container>
    </footer>
  );
}
