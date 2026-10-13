import type { Entry } from "@/types/entry";
import { entryMedia } from "@/lib/content";
import { MediaSlot } from "./MediaSlot";
import { PhoneFrame } from "./PhoneFrame";
import { TypeCover } from "./TypeCover";

type Props = { entry: Entry; fill?: boolean; fitHeight?: boolean };

/** Shows an entry by its real media: the app in a phone, its image slot, or its name in type. */
export function EntryVisual({ entry, fill, fitHeight }: Props) {
  const media = entryMedia(entry);
  if (media.kind === "phone") return <PhoneFrame block={media.block} caption={false} fitHeight={fitHeight} />;
  if (media.kind === "image") return <MediaSlot label={`Image of ${entry.title}`} shape={fill ? "fill" : "wide"} />;
  return <TypeCover title={entry.title} fill={fill} />;
}
