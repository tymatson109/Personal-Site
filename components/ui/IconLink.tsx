import { Icon, type IconName } from "./icons";
import styles from "./IconLink.module.css";

type Props = { icon: IconName; href: string; label: string };

/** A round icon link at the same height as large buttons, for socials on the hero. */
export function IconLink({ icon, href, label }: Props) {
  const external = href.startsWith("http");
  return (
    <a className={styles.link} href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
      <Icon name={icon} className={styles.icon} />
    </a>
  );
}
