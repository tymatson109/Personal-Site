import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { NavLink } from "@/lib/nav";
import { BrandMark } from "./BrandMark";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ links }: { links: NavLink[] }) {
  return (
    <header className={styles.head}>
      <Container className={styles.row}>
        <Link href="/" className={styles.logo}>
          <BrandMark />
          Ty Matson
        </Link>
        <SiteNav links={links} />
      </Container>
    </header>
  );
}
