import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { entryHref, excerpt, highlightQuote } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { readMinutes } from "@/lib/read-time";
import { HighlightQuote } from "./HighlightQuote";
import motion from "@/components/ui/motion.module.css";
import styles from "./WritingCard.module.css";

/** A post's preview: read time, its highlighted line, an excerpt and the way in. */
export function WritingCard({ entry }: { entry: Entry }) {
  return (
    <div className={`${styles.card} ${motion.rise}`}>
      <Label>
        {readMinutes(entry.blocks)} min read · {formatDate(entry.date)}
        {entry.source === "substack" && " · From Substack"}
      </Label>
      <HighlightQuote text={highlightQuote(entry)} />
      <p className={styles.excerpt}>{excerpt(entry)}</p>
      <div className={styles.foot}>
        <ChipRow>
          {entry.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </ChipRow>
        <Button href={entryHref(entry)} variant="primary">
          Read the post →
        </Button>
      </div>
    </div>
  );
}
