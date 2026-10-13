import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "outline" | "onImage";
export type ButtonSize = "sm" | "md" | "lg";

type Common = { children: ReactNode; variant?: ButtonVariant; size?: ButtonSize; label?: string };
type Props = Common & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

/** The one pill button: a link when it has an href, a button when it has an action. */
export function Button({ children, variant = "outline", size = "md", label, href, onClick }: Props) {
  const className = `${styles.btn} ${styles[variant]} ${styles[size]}`;
  if (href === undefined) {
    return (
      <button type="button" className={className} onClick={onClick} aria-label={label}>
        {children}
      </button>
    );
  }
  if (/^(https?:|mailto:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a className={className} href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href} aria-label={label}>
      {children}
    </Link>
  );
}
