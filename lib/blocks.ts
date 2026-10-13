import type { Block, BlockType } from "@/types/entry";
import { demoSrc } from "./demos";
import { isUploadBlockType } from "./media";

export const MEDIA_BLOCKS: readonly BlockType[] = ["image", "gallery", "demo", "video"];

/** Demos and recordings play inside a phone frame. */
export function isPhoneBlock(block: Block): boolean {
  return block.type === "demo" || block.type === "video";
}

export function isMediaBlock(block: Block): boolean {
  return MEDIA_BLOCKS.includes(block.type);
}

/** An image, gallery or recording appears once it has a file, and a live demo once it has an address; until then they live only in the editor. */
export function isShown(block: Block): boolean {
  if (block.type === "demo") return demoSrc(block) !== null;
  return !isUploadBlockType(block.type) || Boolean(block.media?.length);
}

/** Blocks the editor writes as text; media blocks get their own controls. */
export const TEXT_BLOCKS = ["p", "h", "quote", "code"] as const satisfies readonly BlockType[];
export type TextBlockType = (typeof TEXT_BLOCKS)[number];

export const BLOCK_LABELS: Record<BlockType, string> = {
  p: "Text",
  h: "Heading",
  quote: "Quote",
  code: "Code",
  image: "Image",
  gallery: "Gallery",
  demo: "Live demo",
  video: "Phone recording",
};

export function isTextBlock(block: Block): block is Block & { type: TextBlockType } {
  return TEXT_BLOCKS.some((t) => t === block.type);
}

/** What a "/" command can turn a block into: the text kinds, then the kinds that hold files or a demo. */
export const MENU_BLOCKS = [...TEXT_BLOCKS, "image", "gallery", "video", "demo"] as const satisfies readonly BlockType[];
export type MenuBlockType = (typeof MENU_BLOCKS)[number];

/** The block types a "/" command offers, narrowed by what follows the slash. */
export function blockMenu(command: string): MenuBlockType[] {
  const query = command.replace(/^\//, "").trim().toLowerCase();
  return MENU_BLOCKS.filter((t) => BLOCK_LABELS[t].toLowerCase().startsWith(query));
}

/** Text that is a "/" command in progress: a slash and at most one word, nothing else. */
export function isSlashCommand(text: string): boolean {
  return /^\/\w*$/.test(text);
}
