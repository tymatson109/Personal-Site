import Link from "next/link";
import type { Entry } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import { MediaSlot } from "@/components/media/MediaSlot";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import { TypeCover } from "@/components/media/TypeCover";
import { entryHref, entryMedia } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ entry }: { entry: Entry }) {
  const media = entryMedia(entry);
  return (
    <Link href={entryHref(entry)} className={styles.card}>
      <div className={styles.preview}>
        {media.kind === "phone" ? (
          <div className={styles.peek}>
            <PhoneFrame block={media.block} caption={false} />
          </div>
        ) : media.kind === "image" ? (
          <MediaSlot label={`Image of ${entry.title}`} shape="fill" />
        ) : (
          <TypeCover title={entry.title} fill />
        )}
        {entry.tags[0] && (
          <span className={styles.tag}>
            <Label>{entry.tags[0]}</Label>
          </span>
        )}
      </div>
      <h3 className={styles.title}>
        <span>{entry.title}</span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </h3>
      <p className={styles.summary}>{entry.summary}</p>
      <Label>{formatDate(entry.date, "month")}</Label>
    </Link>
  );
}
