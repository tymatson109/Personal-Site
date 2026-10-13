import styles from "./FlowProgress.module.css";

type Props = { step: number; steps: number };

/** One segment per step, filled up to the current one; the same marker on every step of a flow. */
export function FlowProgress({ step, steps }: Props) {
  return (
    <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${steps}`}>
      {Array.from({ length: steps }, (_, i) => (
        <span key={i} className={styles.segment} data-done={i <= step || undefined} />
      ))}
    </div>
  );
}
