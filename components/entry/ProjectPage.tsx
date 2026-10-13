import type { Entry, Section } from "@/types/entry";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import { Photo } from "@/components/media/Photo";
import { entryMedia } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { BackLink } from "./BackLink";
import { EntryBody } from "./EntryBody";
import motion from "@/components/ui/motion.module.css";
import { RiseWords } from "@/components/ui/RiseWords";
import styles from "./ProjectPage.module.css";

/** What the project is beside the app itself, then the story. */
export function ProjectPage({ entry, section }: { entry: Entry; section: Section }) {
  const media = entryMedia(entry);
  const shown = media.kind === "type" ? undefined : media.block;
  return (
    <Container>
      <article>
        <header className={media.kind === "phone" ? styles.head : `${styles.head} ${styles.solo}`}>
          <div className={`${styles.about} ${motion.rise}`}>
            <BackLink href={`/${section.slug}`} label={section.name} />
            <h1 className={styles.title}>
              <RiseWords text={entry.title} />
            </h1>
            <p className={styles.lede}>{entry.summary}</p>
            {entry.facts.length > 0 && (
              <dl className={styles.facts}>
                {entry.facts.map(([label, value]) => (
                  <div key={label} className={styles.fact}>
                    <dt>
                      <Label>{label}</Label>
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Label>
              {formatDate(entry.date, "month")} · {entry.tags.join(" · ")}
            </Label>
          </div>
          {media.kind === "phone" && <PhoneFrame block={media.block} />}
        </header>
        {media.kind === "image" && (
          <div className={styles.cover}>
            <Photo media={media.image} sizes="(max-width: 1040px) 100vw, 1040px" eager />
          </div>
        )}
        <div className={styles.story}>
          <EntryBody blocks={entry.blocks} skip={shown} />
        </div>
      </article>
    </Container>
  );
}
