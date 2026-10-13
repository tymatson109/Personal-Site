import type { Block, BlockType } from "@/types/entry";

export const MEDIA_BLOCKS: readonly BlockType[] = ["image", "gallery", "demo", "video"];

/** Demos and recordings play inside a phone frame. */
export function isPhoneBlock(block: Block): boolean {
  return block.type === "demo" || block.type === "video";
}

export function isMediaBlock(block: Block): boolean {
  return MEDIA_BLOCKS.includes(block.type);
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

/** The block types a "/" command offers, narrowed by what follows the slash. */
export function blockMenu(command: string): TextBlockType[] {
  const query = command.replace(/^\//, "").trim().toLowerCase();
  return TEXT_BLOCKS.filter((t) => BLOCK_LABELS[t].toLowerCase().startsWith(query));
}

/** Text that is a "/" command in progress: a slash and at most one word, nothing else. */
export function isSlashCommand(text: string): boolean {
  return /^\/\w*$/.test(text);
}
