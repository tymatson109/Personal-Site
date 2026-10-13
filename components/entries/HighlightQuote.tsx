import styles from "./HighlightQuote.module.css";

type Props = { text: string; size?: "card" | "pull" };

/** A post's chosen line with a marker highlight that draws in when it appears. */
export function HighlightQuote({ text, size = "card" }: Props) {
  return (
    <blockquote className={`${styles.quote} ${styles[size]}`}>
      <mark className={styles.mark}>{text}</mark>
    </blockquote>
  );
}
