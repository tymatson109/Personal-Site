import { Button } from "@/components/ui/Button";
import { IconLink } from "@/components/ui/IconLink";
import { Label } from "@/components/ui/Label";
import { mailto, SITE_LINKS } from "@/lib/links";
import { DotField } from "./DotField";
import styles from "./Hero.module.css";

type Props = { hasTour: boolean };

export function Hero({ hasTour }: Props) {
  return (
    <section className={styles.hero}>
      <DotField />
      <div className={styles.inner}>
        <h1 className={styles.name}>
          <span className={styles.word}>Ty</span> <span className={styles.word}>Matson</span>
        </h1>
        <span className={styles.role}>
          <Label>Developer and writer</Label>
        </span>
        <div className={styles.actions}>
          {hasTour && (
            <Button href="#tour" variant="primary" size="lg">
              Take the tour ↓
            </Button>
          )}
          <Button href="/about#contact" variant="onImage" size="lg">
            Get in touch
          </Button>
          <IconLink icon="github" href={SITE_LINKS.github} label="GitHub" />
          {SITE_LINKS.linkedin && <IconLink icon="linkedin" href={SITE_LINKS.linkedin} label="LinkedIn" />}
          <IconLink icon="mail" href={mailto(SITE_LINKS.email)} label="Email" />
        </div>
      </div>
      <span className={styles.cue} aria-hidden="true">
        <Label>Scroll</Label>
        <i />
      </span>
    </section>
  );
}
