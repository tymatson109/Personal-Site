import type { Block } from "@/types/entry";

/** One paragraph or quote of a post, split into the sentences that can become its highlight quote. */
export type Passage = { key: number; sentences: string[] };

const QUOTABLE = new Set<Block["type"]>(["p", "quote"]);

function splitSentences(text: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  return text
    .split("\n")
    .flatMap((line) => Array.from(segmenter.segment(line), (s) => s.segment.trim()))
    .filter(Boolean);
}

/** A post's paragraphs and quotes as pickable sentences, leaving out any sentence too long to save as a quote. */
export function quotablePassages(blocks: readonly Block[], max: number): Passage[] {
  return blocks.flatMap((block, key): Passage[] => {
    if (!QUOTABLE.has(block.type)) return [];
    const sentences = splitSentences(block.text).filter((s) => s.length <= max);
    return sentences.length ? [{ key, sentences }] : [];
  });
}
