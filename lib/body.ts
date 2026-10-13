import type { Block } from "@/types/entry";
import { isPhoneBlock } from "./blocks";

export type BodyPiece =
  | { kind: "block"; block: Block; key: number }
  | { kind: "phones"; blocks: Block[]; key: number }
  | { kind: "pull"; text: string; key: number };

/**
 * Lays out an entry's blocks for reading: side-by-side phones share one row,
 * the pull quote sits after the first block, and the block already shown at the top is skipped.
 */
export function bodyPieces(blocks: readonly Block[], options: { skip?: Block; pull?: string } = {}): BodyPiece[] {
  const pieces: BodyPiece[] = [];
  blocks.forEach((block, i) => {
    if (options.pull && i === 1) pieces.push({ kind: "pull", text: options.pull, key: -1 });
    if (block === options.skip) return;
    const last = pieces[pieces.length - 1];
    if (isPhoneBlock(block) && last?.kind === "phones") last.blocks.push(block);
    else if (isPhoneBlock(block)) pieces.push({ kind: "phones", blocks: [block], key: i });
    else pieces.push({ kind: "block", block, key: i });
  });
  return pieces;
}
