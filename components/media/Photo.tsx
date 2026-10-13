import Image from "next/image";
import type { Media } from "@/types/entry";
import styles from "./Photo.module.css";

type Props = { media: Media; shape?: "natural" | "fill" | "contain"; sizes: string; eager?: boolean };

/** An uploaded photo at its own shape, cropped to fill its frame, or fitted inside it; its size is known, so the page never jumps as it loads. */
export function Photo({ media, shape = "natural", sizes, eager }: Props) {
  return (
    <Image
      className={`${styles.photo} ${styles[shape]}`}
      src={media.url}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
    />
  );
}
