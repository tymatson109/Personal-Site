import type { Metadata } from "next";
import { EntryBody } from "@/components/entry/EntryBody";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import motion from "@/components/ui/motion.module.css";
import { RiseWords } from "@/components/ui/RiseWords";
import { getPage } from "@/features/content/queries";
import { mailto, SITE_LINKS } from "@/lib/links";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "About" };

type Contact = { kind: string; name: string; href: string; shown: string };

const CONTACTS: Contact[] = [
  { kind: "Email", name: "Email", href: mailto(SITE_LINKS.email), shown: SITE_LINKS.email },
  { kind: "Code", name: "GitHub", href: SITE_LINKS.github, shown: "tymatson109" },
  ...(SITE_LINKS.linkedin ? [{ kind: "Work", name: "LinkedIn", href: SITE_LINKS.linkedin, shown: "LinkedIn" }] : []),
];

// The headline, opening line and story are the About page's row, edited in the admin
export default async function AboutPage() {
  const page = await getPage("about");
  return (
    <Container>
      <article className={styles.article}>
        <header className={`${styles.head} ${motion.rise}`}>
          <Label as="p">About</Label>
          {page?.title && (
            <h1 className={styles.title}>
              <RiseWords text={page.title} />
            </h1>
          )}
          {page?.intro && <p className={styles.lede}>{page.intro}</p>}
        </header>
        {page && page.blocks.length > 0 && <EntryBody blocks={page.blocks} />}
        <section id="contact" className={styles.contact} data-reveal>
          <h2 className={styles.subtitle}>Get in touch</h2>
          <ul className={styles.rows}>
            {CONTACTS.map((c) => (
              <li key={c.name}>
                <a
                  className={styles.row}
                  href={c.href}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                >
                  <Label>{c.kind}</Label>
                  <span className={styles.name}>
                    {c.name}
                    <span className={styles.shown}>{c.shown}</span>
                  </span>
                  <Label>↗</Label>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Container>
  );
}
