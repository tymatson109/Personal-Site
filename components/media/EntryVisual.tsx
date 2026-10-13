import type { Entry } from "@/types/entry";
import { entryMedia } from "@/lib/content";
import { PhoneFrame } from "./PhoneFrame";
import { Photo } from "./Photo";
import { TypeCover } from "./TypeCover";

type Props = { entry: Entry; fill?: boolean; fitHeight?: boolean; live?: boolean };

/** Shows an entry by its real media: the app in a phone, its photo, or its name in type. */
export function EntryVisual({ entry, fill, fitHeight, live }: Props) {
  const media = entryMedia(entry);
  if (media.kind === "phone") return <PhoneFrame block={media.block} caption={false} fitHeight={fitHeight} live={live} />;
  if (media.kind === "image") return <Photo media={media.image} shape={fill ? "fill" : fitHeight ? "contain" : "natural"} sizes="(max-width: 760px) 100vw, 50vw" />;
  return <TypeCover title={entry.title} fill={fill} />;
}
