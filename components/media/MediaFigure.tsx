import type { Block } from "@/types/entry";
import { Photo } from "./Photo";
import styles from "./MediaFigure.module.css";

// The story column is at most --measure wide, so photos never need more than that
const STORY_SIZES = "(max-width: 760px) 100vw, 680px";
const PAIR_SIZES = "(max-width: 760px) 50vw, 340px";

/** An image or gallery block in a story: its photos at their own shape, with the caption under them. */
export function MediaFigure({ block }: { block: Block }) {
  const media = block.media ?? [];
  if (!media.length) return null;
  const gallery = block.type === "gallery" && media.length > 1;
  return (
    <figure className={styles.figure} data-reveal>
      {gallery ? (
        <div className={styles.gallery}>
          {media.map((m) => (
            <Photo key={m.url} media={m} sizes={PAIR_SIZES} />
          ))}
        </div>
      ) : (
        <Photo media={media[0]} sizes={STORY_SIZES} />
      )}
      {block.text && <figcaption className={styles.caption}>{block.text}</figcaption>}
    </figure>
  );
}
