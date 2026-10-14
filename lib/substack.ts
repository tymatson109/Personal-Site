import { isTag, isText, type ChildNode as DomNode, type Element as DomElement } from "domhandler";
import { decodeHTML } from "entities";
import { DomUtils, parseDocument } from "htmlparser2";
import type { Block } from "@/types/entry";
import type { EntryInput } from "./entry-input";
import { freeSlug } from "./new-entry";

/** One post as the feed gives it, already turned into the site's blocks. */
export type SubstackPost = { url: string; title: string; summary: string; date: string; blocks: Block[] };

// The same limits the editor's saves are held to in lib/entry-input.ts
const LIMITS = { title: 200, summary: 500, blocks: 500, text: 20000 };

// Substack's own furniture inside a post: subscribe boxes, share buttons, image and embed wrappers
const SKIPPED_CLASS = /subscription-widget|button-wrapper|captioned-image|image-gallery|embed|footnote-anchor/;
const SKIPPED_TAGS = new Set(["img", "figure", "iframe", "form", "button", "input", "script", "style", "svg", "video", "audio", "hr"]);
const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Text of a node with runs of spaces collapsed, keeping line breaks from <br>. */
function inlineText(node: DomNode): string {
  if (isText(node)) return node.data.replace(/\s+/g, " ");
  if (!isTag(node)) return "";
  if (node.name === "br") return "\n";
  if (SKIPPED_TAGS.has(node.name)) return "";
  return node.children.map(inlineText).join("");
}

function cleanText(node: DomNode): string {
  return inlineText(node)
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

function isSkipped(el: DomElement): boolean {
  return SKIPPED_TAGS.has(el.name) || SKIPPED_CLASS.test(el.attribs.class ?? "");
}

function blocksOf(nodes: DomNode[]): Block[] {
  return nodes.flatMap((node): Block[] => {
    if (isText(node)) {
      const text = node.data.trim();
      return text ? [{ type: "p", text }] : [];
    }
    if (!isTag(node) || isSkipped(node)) return [];
    if (node.name === "p") return [{ type: "p", text: cleanText(node) }];
    if (HEADINGS.has(node.name)) return [{ type: "h", text: cleanText(node) }];
    if (node.name === "pre") return [{ type: "code", text: DomUtils.textContent(node).replace(/\n+$/, "") }];
    if (node.name === "blockquote") {
      const lines = blocksOf(node.children).map((b) => b.text);
      return [{ type: "quote", text: lines.length ? lines.join("\n") : cleanText(node) }];
    }
    if (node.name === "ul" || node.name === "ol") {
      const items = node.children.filter((c): c is DomElement => isTag(c) && c.name === "li");
      return items.map((li, i) => ({ type: "p", text: `${node.name === "ol" ? `${i + 1}.` : "•"} ${cleanText(li)}` }));
    }
    return blocksOf(node.children);
  });
}

/** A post's HTML as the site's blocks: text only, so nothing from the feed is ever rendered as markup. */
export function postBlocks(html: string): Block[] {
  return blocksOf(parseDocument(html).children)
    .filter((b) => b.text.trim() !== "")
    .slice(0, LIMITS.blocks)
    .map((b) => ({ ...b, text: clip(b.text, LIMITS.text) }));
}

function childText(item: DomElement, name: string): string {
  const el = DomUtils.findOne((e) => e.name === name, item.children, false);
  return el ? DomUtils.textContent(el).trim() : "";
}

// RSS titles and summaries are entity-encoded HTML whether or not they sit in CDATA, so Substack's &#8217; needs one more decode
function plainText(item: DomElement, name: string): string {
  return decodeHTML(childText(item, name));
}

/** The YYYY-MM-DD a feed's pubDate falls on in UTC, or null when it isn't a date. */
export function feedDate(pubDate: string): string | null {
  const date = new Date(pubDate);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Every usable post in a Substack RSS feed; an item missing its link, title or date is left out. */
export function parseSubstackFeed(xml: string): SubstackPost[] {
  const doc = parseDocument(xml, { xmlMode: true });
  const items = DomUtils.getElementsByTagName("item", doc.children, true);
  return items.flatMap((item): SubstackPost[] => {
    const url = childText(item, "link");
    const title = clip(plainText(item, "title"), LIMITS.title);
    const date = feedDate(childText(item, "pubDate"));
    if (!isHttps(url) || !title || !date) return [];
    const summary = clip(plainText(item, "description").replace(/\s+/g, " "), LIMITS.summary);
    return [{ url, title, summary, date, blocks: postBlocks(childText(item, "content:encoded")) }];
  });
}

/** The address a new synced post gets: Substack's own slug where it is free, numbered when it isn't. */
export function postSlug(post: SubstackPost, taken: readonly string[]): string {
  const last = new URL(post.url).pathname.split("/").filter(Boolean).at(-1) ?? "";
  return freeSlug(last.replace(/-/g, " ") || post.title, taken);
}

/** A newly synced post as an entry: published at once, with nothing Ty adds in the admin filled in yet. */
export function postEntryInput(post: SubstackPost, section: string, slug: string): EntryInput {
  return {
    section,
    slug,
    title: post.title,
    summary: post.summary,
    date: post.date,
    tags: [],
    featured: false,
    status: "live",
    quote: "",
    facts: [],
    blocks: post.blocks,
  };
}
