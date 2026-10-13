import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");
const TOKENS = readFileSync(join(__dirname, "tokens.css"), "utf8");
const DEFINED = new Set([...TOKENS.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

// Every stylesheet outside the token file, so new components are checked without being listed
function stylesheets(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return stylesheets(path);
    return e.name.endsWith(".css") && path !== join(__dirname, "tokens.css") ? [path] : [];
  });
}

const FILES = [...stylesheets(join(ROOT, "app")), ...stylesheets(join(ROOT, "components"))];
// A color literal, or a non-zero number with a unit; zero and unitless numbers (opacity, z-order) are fine
const HARDCODED = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|(?<![\w-])(?:\d*\.)?[1-9]\d*(?:\.\d+)?(?:px|rem|em|ms|s|vh|vw|svh)\b/gi;

const BREAKPOINTS = ["760px", "860px"];
const MEDIA_PRELUDE = /@media[^{]*/g;

function withoutComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Media queries can't read variables, so their sizes are checked against the breakpoint list instead
function withoutMediaPreludes(css: string) {
  return css.replace(MEDIA_PRELUDE, "@media");
}

describe("design tokens", () => {
  it("finds stylesheets to check", () => {
    expect(FILES.length).toBeGreaterThan(0);
  });

  it.each(FILES.map((f) => [f.slice(ROOT.length + 1), f]))("%s uses no hardcoded colors or sizes", (_, file) => {
    expect(withoutMediaPreludes(withoutComments(readFileSync(file, "utf8"))).match(HARDCODED) ?? []).toEqual([]);
  });

  it.each(FILES.map((f) => [f.slice(ROOT.length + 1), f]))("%s only uses the shared breakpoints", (_, file) => {
    const preludes = withoutComments(readFileSync(file, "utf8")).match(MEDIA_PRELUDE) ?? [];
    const sizes = preludes.flatMap((p) => p.match(/\d+px/g) ?? []);
    expect(sizes.filter((s) => !BREAKPOINTS.includes(s))).toEqual([]);
  });

  it.each(FILES.map((f) => [f.slice(ROOT.length + 1), f]))("%s only reads tokens that exist", (_, file) => {
    // A var with a fallback, like var(--i, 0), is a per-element input set inline, not a token
    const used = [...readFileSync(file, "utf8").matchAll(/var\((--[\w-]+)\s*\)/g)].map((m) => m[1]);
    expect(used.filter((name) => !DEFINED.has(name))).toEqual([]);
  });
});
