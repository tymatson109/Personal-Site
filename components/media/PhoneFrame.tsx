import type { Block } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import { demoSrc } from "@/lib/demos";
import { DemoScreen } from "./DemoScreen";
import styles from "./PhoneFrame.module.css";

type Props = { block: Block; caption?: boolean; fitHeight?: boolean; live?: boolean };

const KIND: Record<"demo" | "video", { title: string; sub: string }> = {
  demo: { title: "Live demo", sub: "Built from the app’s own code" },
  video: { title: "Screen recording", sub: "Looping video" },
};

/**
 * A phone frame for an app's live demo or screen recording.
 * A recording plays its uploaded file; a demo starts on tap where it is `live`, and elsewhere (cards, the tour, which are links) shows its label.
 */
export function PhoneFrame({ block, caption = true, fitHeight, live }: Props) {
  const kind = KIND[block.type === "demo" ? "demo" : "video"];
  const video = block.type === "video" ? block.media?.[0]?.url : undefined;
  const demo = live ? demoSrc(block) : null;
  const frame = (
    <div className={fitHeight ? `${styles.phone} ${styles.fitHeight}` : styles.phone}>
      <div className={styles.screen}>
        {video ? (
          <video className={styles.video} src={video} autoPlay muted loop playsInline aria-label={kind.title} />
        ) : demo ? (
          <DemoScreen src={demo} title={kind.title} />
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
