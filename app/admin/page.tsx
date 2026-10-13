import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { EntryRows } from "@/components/admin/EntryRows";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { signOutAdmin } from "@/features/admin/actions";
import { listAdminEntries } from "@/features/admin/content";
import { requireAdmin } from "@/features/admin/session";
import { getSections } from "@/features/content/queries";
import { adminView, RESTORE_DAYS, sectionFilter } from "@/lib/admin-entries";
import { sortedSections } from "@/lib/content";
import { entryCount } from "@/lib/sections";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Content" };

export default async function AdminContent(props: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const [sections, items, { section: param }] = await Promise.all([
    getSections(),
    listAdminEntries(admin),
    props.searchParams,
  ]);
  const section = sectionFilter(sections, param);
  const { current, deleted } = adminView(items, section, new Date(), sections);
  const names = new Map(sections.map((s) => [s.slug, s.name]));
  const count = entryCount(current.length);

  return (
    <AdminFrame
      title="Content"
      note={section ? `${count} in ${names.get(section)}.` : `${count}.`}
      actions={
        <>
          {sortedSections(sections)
            .filter((s) => !section || s.slug === section)
            .map((s) => (
              <Button key={s.slug} href={`/admin/new/${s.slug}`} variant="primary" size="sm">
                {`New in ${s.name}`}
              </Button>
            ))}
          <Button href="/admin/sections" size="sm">
            Sections
          </Button>
          <Button href="/" size="sm">
            View the site
          </Button>
          <form action={signOutAdmin}>
            <Button submit size="sm">
              Sign out
            </Button>
          </form>
        </>
      }
    >
      <nav aria-label="Sections" className={styles.filters}>
        <ChipRow>
          <Chip href="/admin" pressed={!section}>
            All
          </Chip>
          {sortedSections(sections).map((s) => (
            <Chip key={s.slug} href={`/admin?section=${s.slug}`} pressed={section === s.slug}>
              {s.name}
            </Chip>
          ))}
        </ChipRow>
      </nav>
      {current.length > 0 ? (
        <EntryRows entries={current} sectionNames={names} />
      ) : (
        <p className={styles.empty}>No entries yet. Start one with a New button above.</p>
      )}
      {deleted.length > 0 && (
        <section className={styles.deleted}>
          <h2 className={styles.subtitle}>Recently deleted</h2>
          <p className={styles.empty}>Deleted entries can be restored for {RESTORE_DAYS} days.</p>
          <EntryRows entries={deleted} sectionNames={names} deleted />
        </section>
      )}
    </AdminFrame>
  );
}
