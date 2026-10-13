import Link from "next/link";
import type { Entry } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { deleteEntry, restoreEntry, setEntryFeatured, setEntryStatus } from "@/features/admin/entry-actions";
import { adminMeta } from "@/lib/admin-entries";
import { entryHref } from "@/lib/content";
import { SubmitButton } from "./SubmitButton";
import styles from "./Rows.module.css";

type Props = { entries: Entry[]; sectionNames: ReadonlyMap<string, string>; deleted?: boolean };

// Each action is its own small form, so it works before the page's JavaScript loads
function CurrentActions({ entry }: { entry: Entry }) {
  const live = entry.status === "live";
  return (
    <>
      {live && (
        <Button href={entryHref(entry)} size="sm">
          View
        </Button>
      )}
      <form action={setEntryStatus.bind(null, entry.id, live ? "draft" : "live")}>
        <SubmitButton variant={live ? "outline" : "primary"}>{live ? "Unpublish" : "Publish"}</SubmitButton>
      </form>
      <form action={setEntryFeatured.bind(null, entry.id, !entry.featured)}>
        <SubmitButton>{entry.featured ? "Unfeature" : "Feature"}</SubmitButton>
      </form>
      <form action={deleteEntry.bind(null, entry.id)}>
        <SubmitButton label={`Delete ${entry.title || "untitled entry"}`}>Delete</SubmitButton>
      </form>
    </>
  );
}

/** The admin's rows of entries with their actions; deleted rows offer only Restore. */
export function EntryRows({ entries, sectionNames, deleted = false }: Props) {
  return (
    <ul className={styles.rows}>
      {entries.map((entry) => {
        const title = entry.title || "Untitled";
        return (
          <li key={entry.id} className={styles.row}>
            <div className={styles.main}>
              {deleted ? (
                <span className={styles.title}>{title}</span>
              ) : (
                <Link className={styles.title} href={`/admin/entries/${entry.id}`}>
                  {title}
                </Link>
              )}
              <p className={styles.meta}>
                {adminMeta(entry, sectionNames.get(entry.section) ?? entry.section).map((part) => (
                  <Label key={part}>{part}</Label>
                ))}
              </p>
            </div>
            <div className={styles.actions}>
              {deleted ? (
                <form action={restoreEntry.bind(null, entry.id)}>
                  <SubmitButton variant="primary">Restore</SubmitButton>
                </form>
              ) : (
                <CurrentActions entry={entry} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
