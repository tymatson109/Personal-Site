import styles from "./BrandMark.module.css";

// Same 3x3 dot field as app/icon.svg, without the tile, so it takes the page's own colors
const DOTS = [-1, 0, 1].flatMap((row) => [-1, 0, 1].map((col) => ({ row, col, ring: Math.abs(row) + Math.abs(col) })));
const RADIUS = [7, 4.6, 3.4];
const KIND = [styles.core, styles.edge, styles.corner];

export function BrandMark() {
  return (
    <svg className={styles.mark} viewBox="-21 -21 42 42" aria-hidden="true">
      {DOTS.map(({ row, col, ring }) => (
        <circle key={`${row}${col}`} cx={col * 14} cy={row * 14} r={RADIUS[ring]} className={KIND[ring]} />
      ))}
    </svg>
  );
}
