import type { Entry, Section } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { formatDate } from "@/lib/format-date";
import { SITE_LINKS, substackSubscribe } from "@/lib/links";
import { readMinutes } from "@/lib/read-time";
import { BackLink } from "./BackLink";
import { EntryBody } from "./EntryBody";
import motion from "@/components/ui/motion.module.css";
import { RiseWords } from "@/components/ui/RiseWords";
import styles from "./PostPage.module.css";

/** A post to read: title, lede, the story with its highlighted line pulled out, and Substack's subscribe for synced posts. */
export function PostPage({ entry, section }: { entry: Entry; section: Section }) {
  const fromSubstack = entry.source === "substack";
  return (
    <Container>
      <article className={styles.article}>
        <BackLink href={`/${section.slug}`} label={section.name} />
        <header className={`${styles.head} ${motion.rise}`}>
          <Label as="p">
            {formatDate(entry.date)} · {entry.tags.join(" · ")}
          </Label>
          <h1 className={styles.title}>
            <RiseWords text={entry.title} />
          </h1>
          <p className={styles.lede}>{entry.summary}</p>
          <Label as="p">
            {readMinutes(entry.blocks)} min read{fromSubstack && " · First published on Substack"}
          </Label>
        </header>
        <EntryBody blocks={entry.blocks} pull={entry.quote || undefined} />
        {fromSubstack && (
          <aside className={styles.subscribe}>
            <span>Get new posts by email when they come out.</span>
            <Button href={substackSubscribe(SITE_LINKS.substack)} variant="primary">
              Subscribe on Substack ↗
            </Button>
          </aside>
        )}
      </article>
    </Container>
  );
}
