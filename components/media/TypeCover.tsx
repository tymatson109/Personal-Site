import styles from "./TypeCover.module.css";

type Props = { title: string; fill?: boolean };

/** A project's name set large, standing in when it has no app or image yet. */
export function TypeCover({ title, fill }: Props) {
  return (
    <div className={fill ? `${styles.cover} ${styles.fill}` : styles.cover}>
      <b className={styles.name}>{title}</b>
    </div>
  );
}
