import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ENTRY_SOURCES, ENTRY_STATUSES, SECTION_LAYOUTS } from "@/types/entry";

const DIR = join(__dirname, "migrations");
const SQL = readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(DIR, f), "utf8"))
  .join("\n");

/** The values a column's latest `check (column in (...))` allows. */
function allowed(column: string): string[] {
  const matches = [...SQL.matchAll(new RegExp(`check \\(${column} in \\(([^)]*)\\)\\)`, "g"))];
  const last = matches.at(-1);
  if (!last) throw new Error(`No check constraint found for ${column}`);
  return [...last[1].matchAll(/'([^']*)'/g)].map((m) => m[1]);
}

describe("database checks match the content contract", () => {
  it("allows exactly the section layouts the site renders", () => {
    expect(allowed("layout")).toEqual([...SECTION_LAYOUTS]);
  });

  it("allows exactly the entry statuses the site knows", () => {
    expect(allowed("status")).toEqual([...ENTRY_STATUSES]);
  });

  it("allows exactly the entry sources the site knows", () => {
    expect(allowed("source")).toEqual([...ENTRY_SOURCES]);
  });
});

describe("migrations", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".sql"));

  it("are named with a 14-digit timestamp so they apply in order", () => {
    expect(files.filter((f) => !/^\d{14}_[a-z0-9_]+\.sql$/.test(f))).toEqual([]);
  });

  it("let the reader role read every table they create", () => {
    const tables = [...SQL.matchAll(/create table (public\.\w+)/g)].map((m) => m[1]);
    const readable = new Set([...SQL.matchAll(/grant select on (public\.\w+) to site_reader/g)].map((m) => m[1]));
    expect(tables.filter((t) => !readable.has(t))).toEqual([]);
  });

  it("turn on row-level security for every table they create", () => {
    const tables = [...SQL.matchAll(/create table (public\.\w+)/g)].map((m) => m[1]);
    const secured = new Set([...SQL.matchAll(/alter table (public\.\w+) enable row level security/g)].map((m) => m[1]));
    expect(tables.filter((t) => !secured.has(t))).toEqual([]);
  });
});
