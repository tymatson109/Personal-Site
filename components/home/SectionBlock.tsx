import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./SectionBlock.module.css";

type Props = { title: string; more?: { href: string; label: string }; children: ReactNode };

/** A titled band on the home page, divided from what comes before it. */
export function SectionBlock({ title, more, children }: Props) {
  return (
    <section className={styles.block} data-reveal>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {more && (
          <Link href={more.href} className={styles.more}>
            {more.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
