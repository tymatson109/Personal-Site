import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { SectionManager } from "@/components/admin/SectionManager";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { restoreSection } from "@/features/admin/section-actions";
import { listAdminSections } from "@/features/admin/sections";
import { requireAdmin } from "@/features/admin/session";
import { RESTORE_DAYS } from "@/lib/admin-entries";
import { entryCount, sectionView } from "@/lib/sections";
import rows from "@/components/admin/Rows.module.css";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Sections" };

export default async function AdminSections() {
  const admin = await requireAdmin();
  const { current, removed } = sectionView(await listAdminSections(admin), new Date());

  return (
    <AdminFrame
      title="Sections"
      note="Each section is a page on the site and a link in its menu, in this order."
      actions={
        <Button href="/admin" size="sm">
          Back to content
        </Button>
      }
    >
      <SectionManager sections={current} />
      {removed.length > 0 && (
        <section className={styles.deleted}>
          <h2 className={styles.subtitle}>Recently removed</h2>
          <p className={styles.empty}>Removed sections come back with their entries for {RESTORE_DAYS} days.</p>
          <ul className={rows.rows}>
            {removed.map((s) => (
              <li key={s.slug} className={rows.row}>
                <div className={rows.main}>
                  <span className={rows.title}>{s.name}</span>
                  <p className={rows.meta}>
                    <Label>{`/${s.slug}`}</Label>
                    <Label>{entryCount(s.entries)}</Label>
                  </p>
                </div>
                <div className={rows.actions}>
                  <form action={restoreSection.bind(null, s.slug)}>
                    <SubmitButton variant="primary">Restore</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AdminFrame>
  );
}
