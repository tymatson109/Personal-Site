import { Label } from "@/components/ui/Label";
import styles from "./MediaSlot.module.css";

type Props = { label: string; shape?: "wide" | "fill" };

/** An honest empty slot where real media will go, labeled with what belongs there. */
export function MediaSlot({ label, shape = "wide" }: Props) {
  return (
    <div className={`${styles.slot} ${styles[shape]}`}>
      <Label>{label}</Label>
    </div>
  );
}
