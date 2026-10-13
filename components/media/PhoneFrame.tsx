import type { Block } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import styles from "./PhoneFrame.module.css";

type Props = { block: Block; caption?: boolean; fitHeight?: boolean };

const KIND: Record<"demo" | "video", { title: string; sub: string }> = {
  demo: { title: "Live demo", sub: "Built from the app’s own code" },
  video: { title: "Screen recording", sub: "Looping video" },
};

/**
 * A phone frame for an app's live demo or screen recording.
 * A recording plays when its block holds a video URL; demos are wired to the app's web build in PR 11, so until then the screen is a labeled slot.
 */
export function PhoneFrame({ block, caption = true, fitHeight }: Props) {
  const kind = KIND[block.type === "demo" ? "demo" : "video"];
  const src = block.type === "video" && /^(https:\/\/|\/)/.test(block.text) ? block.text : null;
  const frame = (
    <div className={fitHeight ? `${styles.phone} ${styles.fitHeight}` : styles.phone}>
      <div className={styles.screen}>
        {src ? (
          <video className={styles.video} src={src} autoPlay muted loop playsInline aria-label={kind.title} />
        ) : (
          <div className={styles.slot}>
            <Label>{kind.title}</Label>
          </div>
        )}
      </div>
    </div>
  );
  if (!caption) return frame;
  return (
    <figure className={styles.figure}>
      {frame}
      <figcaption className={styles.caption}>
        <b>{kind.title}</b>
        <Label>{kind.sub}</Label>
      </figcaption>
    </figure>
  );
}
