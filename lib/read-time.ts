import type { Block } from "@/types/entry";
import { isMediaBlock } from "./blocks";

const WORDS_PER_MINUTE = 220;

/** Whole minutes to read the text blocks, never less than 1. */
export function readMinutes(blocks: readonly Block[]): number {
  const words = blocks
    .filter((b) => !isMediaBlock(b))
    .reduce((n, b) => n + b.text.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
