import type { ReactNode } from "react";
import type { Block } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import { demoSrc, splashSrc } from "@/lib/demos";
import { SplashScreen } from "./SplashScreen";
import styles from "./PhoneFrame.module.css";

type Props = { block: Block; caption?: boolean; fitHeight?: boolean; live?: boolean };

const KIND: Record<"demo" | "video", { title: string; sub: string }> = {
  demo: { title: "Live demo", sub: "Built from the app’s own code" },
  video: { title: "Screen recording", sub: "Looping video" },
};

type ShellProps = { fitHeight?: boolean; children: ReactNode };

/** The phone's body and screen, holding whatever the screen shows. */
function PhoneShell({ fitHeight, children }: ShellProps) {
  return (
    <div className={fitHeight ? `${styles.phone} ${styles.fitHeight}` : styles.phone}>
      <div className={styles.screen}>{children}</div>
    </div>
  );
}

/** What an app block puts on a phone's screen: its recording, its live demo where `live`, the splash screen its app publishes in previews, or its label. */
function PhoneScreen({ block, live }: Pick<Props, "block" | "live">) {
  const kind = KIND[block.type === "demo" ? "demo" : "video"];
  const video = block.type === "video" ? block.media?.[0]?.url : undefined;
  const demo = live ? demoSrc(block) : null;
  const splash = live ? null : splashSrc(block);
  const slot = (
    <div className={styles.slot}>
      <Label>{kind.title}</Label>
    </div>
  );
  if (video) return <video className={styles.video} src={video} autoPlay muted loop playsInline aria-label={kind.title} />;
  if (demo) return <iframe className={styles.video} src={demo} title={kind.title} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms" />;
  if (splash) return <SplashScreen src={splash} fallback={slot} />;
  return slot;
}

/**
 * A phone frame for an app's live demo or screen recording.
 * A recording plays its uploaded file; a demo loads and plays where it is `live`, and elsewhere (cards, the home index) shows its splash screen.
 */
export function PhoneFrame({ block, caption = true, fitHeight, live }: Props) {
  const kind = KIND[block.type === "demo" ? "demo" : "video"];
  const frame = (
    <PhoneShell fitHeight={fitHeight}>
      <PhoneScreen block={block} live={live} />
    </PhoneShell>
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
