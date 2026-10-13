import type { Section } from "@/types/entry";

export type NavLink = { href: string; label: string };

/** Sections in their admin order, then About, which every site has. */
export function navLinks(sections: Section[]): NavLink[] {
  const ordered = [...sections].sort((a, b) => a.order - b.order);
  return [...ordered.map((s) => ({ href: `/${s.slug}`, label: s.name })), { href: "/about", label: "About" }];
}

/** A link is current on its own page and on any page beneath it. */
export function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
