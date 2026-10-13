import Link from "next/link";
import styles from "./BackLink.module.css";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.back}>
      ← {label}
    </Link>
  );
}
