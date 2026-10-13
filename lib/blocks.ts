import type { Block, BlockType } from "@/types/entry";

export const MEDIA_BLOCKS: readonly BlockType[] = ["image", "gallery", "demo", "video"];

/** Demos and recordings play inside a phone frame. */
export function isPhoneBlock(block: Block): boolean {
  return block.type === "demo" || block.type === "video";
}

export function isMediaBlock(block: Block): boolean {
  return MEDIA_BLOCKS.includes(block.type);
}
