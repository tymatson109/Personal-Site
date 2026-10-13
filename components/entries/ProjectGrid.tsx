import type { Entry } from "@/types/entry";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

export function ProjectGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className={styles.grid}>
      {entries.map((e) => (
        <ProjectCard key={e.id} entry={e} />
      ))}
    </div>
  );
}
