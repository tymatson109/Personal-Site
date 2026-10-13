import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import motion from "@/components/ui/motion.module.css";
import { RiseWords } from "@/components/ui/RiseWords";
import { mailto, SITE_LINKS } from "@/lib/links";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "About" };

type Contact = { kind: string; name: string; href: string; shown: string };

const CONTACTS: Contact[] = [
  { kind: "Email", name: "Email", href: mailto(SITE_LINKS.email), shown: SITE_LINKS.email },
  { kind: "Code", name: "GitHub", href: SITE_LINKS.github, shown: "tymatson109" },
  ...(SITE_LINKS.linkedin ? [{ kind: "Work", name: "LinkedIn", href: SITE_LINKS.linkedin, shown: "LinkedIn" }] : []),
];

// Sample text until About becomes an editable page in the admin
export default function AboutPage() {
  return (
    <Container>
      <article className={styles.article}>
        <header className={`${styles.head} ${motion.rise}`}>
          <Label as="p">About</Label>
          <h1 className={styles.title}>
            <RiseWords text="Hi, I’m Ty." />
          </h1>
          <p className={styles.lede}>I build iPhone apps and the web tools around them. This site holds everything I make and write.</p>
        </header>
        <p>Sample about text. It becomes editable from the admin like any other page.</p>
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
