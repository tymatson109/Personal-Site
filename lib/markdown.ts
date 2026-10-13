import type { Block } from "@/types/entry";

// Pasted Markdown becomes plain-text blocks; inline formatting is dropped because blocks hold text only

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^#{1,6}\s+(.*?)\s*#*\s*$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;

/** Inline Markdown to its plain words: links keep their text, images and emphasis marks go. */
export function stripInline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])[*_](\S(?:.*?\S)?)[*_](?=[^\w*]|$)/g, "$1$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when pasted text should become several blocks rather than land in one. */
export function looksLikeMarkdown(text: string): boolean {
  return /\n/.test(text.trim()) || [FENCE, HEADING, QUOTE, BULLET, NUMBERED].some((re) => re.test(text));
}

export function markdownToBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];

  const push = (type: Block["type"], raw: string) => {
    const text = type === "code" ? raw : stripInline(raw);
    if (text) blocks.push({ type, text });
  };
  const flush = () => {
    if (paragraph.length) push("p", paragraph.join(" "));
    if (quote.length) push("quote", quote.join(" "));
    paragraph = [];
    quote = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(FENCE);
    if (fence) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith(fence[1])) code.push(lines[i]);
      push("code", code.join("\n"));
      continue;
    }
    const quoted = line.match(QUOTE);
    if (quoted) {
      if (paragraph.length) flush();
      quote.push(quoted[1]);
      continue;
    }
    if (quote.length) flush();
    if (!line.trim() || RULE.test(line)) {
      flush();
      continue;
    }
    const heading = line.match(HEADING);
    const bullet = line.match(BULLET);
    const numbered = line.match(NUMBERED);
    if (heading || bullet || numbered) flush();
    if (heading) push("h", heading[1]);
    else if (bullet) push("p", `• ${bullet[1]}`);
    else if (numbered) push("p", `${numbered[1]}. ${numbered[2]}`);
    else paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
