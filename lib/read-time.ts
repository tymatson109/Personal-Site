import type { Block, BlockType } from "@/types/entry";

const WORDS_PER_MINUTE = 220;
const MEDIA_BLOCKS: readonly BlockType[] = ["image", "gallery", "demo", "video"];

/** Whole minutes to read the text blocks, never less than 1. */
export function readMinutes(blocks: readonly Block[]): number {
  const words = blocks
    .filter((b) => !MEDIA_BLOCKS.includes(b.type))
    .reduce((n, b) => n + b.text.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
