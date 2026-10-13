"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrent, type NavLink } from "@/lib/nav";
import styles from "./SiteNav.module.css";

export function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Main">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.link}
          aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
