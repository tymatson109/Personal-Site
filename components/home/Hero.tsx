import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RiseWords } from "@/components/ui/RiseWords";
import { SITE_LINKS } from "@/lib/links";
import { DotField } from "./DotField";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <DotField />
      <div className={styles.inner}>
        <h1 className={styles.name}>
          <RiseWords text="Ty Matson" />
        </h1>
        <span className={styles.role}>
          <Label>Developer and writer</Label>
        </span>
        <div className={styles.actions}>
          <Button href={SITE_LINKS.substack} variant="primary" size="lg">
            Substack
          </Button>
          <Button href="/about#contact" variant="onImage" size="lg">
            Contact
          </Button>
        </div>
      </div>
      <span className={styles.cue} aria-hidden="true">
        <Label>Scroll</Label>
        <i />
      </span>
    </section>
  );
}
