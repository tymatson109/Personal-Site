"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SectionLayout } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { createSection, removeSection, reorderSections, updateSection } from "@/features/admin/section-actions";
import type { SaveResult } from "@/features/admin/entry-actions";
import { moveItem } from "@/lib/list-ops";
import { entryCount, type AdminSection } from "@/lib/sections";
import { RESTORE_DAYS } from "@/lib/admin-entries";
import { Choices } from "./editor/Choices";
import { Field } from "./editor/Field";
import controls from "./editor/controls.module.css";
import rows from "./Rows.module.css";
import styles from "./SectionManager.module.css";

const LAYOUTS = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
] as const;

const LAYOUT_LABELS: Record<SectionLayout, string> = { grid: "Grid", list: "List" };

type Mode = { kind: "edit"; slug: string } | { kind: "remove"; slug: string } | null;

/** A section's name and layout, for adding one or editing one in place. */
function SectionForm({
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: { name: string; layout: SectionLayout };
  submitLabel: string;
  busy: boolean;
  onSubmit: (value: { name: string; layout: SectionLayout }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [layout, setLayout] = useState<SectionLayout>(initial.layout);
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, layout });
      }}
    >
      <Field label="Name">
        <input className={controls.input} value={name} maxLength={40} placeholder="Talks" onChange={(e) => setName(e.target.value)} />
      </Field>
      <Choices legend="Layout" name={`layout-${initial.name || "new"}`} options={LAYOUTS} value={layout} onChange={setLayout} />
      <div className={rows.actions}>
        <Button submit size="sm" variant="primary" busy={busy}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

/** Sections in nav order: add, rename, change layout, move and remove, each saved at once. */
export function SectionManager({ sections }: { sections: AdminSection[] }) {
  const [mode, setMode] = useState<Mode>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(0);
  const [pending, startTransition] = useTransition();

  // Every change runs through here, so one message line reports the last problem and a success closes the open form
  function run(action: () => Promise<SaveResult | void>, then?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) return setError(result.error);
      setMode(null);
      then?.();
    });
  }

  const move = (i: number, by: number) => run(() => reorderSections(moveItem(sections, i, i + by).map((s) => s.slug)));

  return (
    <div className={styles.manager}>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <ul className={rows.rows}>
        {sections.map((section, i) => {
          const editing = mode?.kind === "edit" && mode.slug === section.slug;
          const removing = mode?.kind === "remove" && mode.slug === section.slug;
          return (
            <li key={section.slug} className={rows.row}>
              <div className={rows.main}>
                <Link className={rows.title} href={`/admin?section=${section.slug}`}>
                  {section.name}
                </Link>
                <p className={rows.meta}>
                  <Label>{`/${section.slug}`}</Label>
                  <Label>{LAYOUT_LABELS[section.layout]}</Label>
                  <Label>{entryCount(section.entries)}</Label>
                </p>
              </div>
              {editing ? (
                <SectionForm
                  initial={section}
                  submitLabel="Save"
                  busy={pending}
                  onSubmit={(value) => run(() => updateSection(section.slug, value))}
                  onCancel={() => setMode(null)}
                />
              ) : removing ? (
                <div className={styles.confirm} role="alertdialog" aria-label={`Remove ${section.name}`}>
                  <p>
                    {section.entries > 0
                      ? `Remove ${section.name} and its ${entryCount(section.entries)}? `
                      : `Remove ${section.name}? `}
                    You can restore {section.entries > 0 ? "them" : "it"} for {RESTORE_DAYS} days.
                  </p>
                  <div className={rows.actions}>
                    <Button size="sm" variant="primary" busy={pending} onClick={() => run(() => removeSection(section.slug))}>
                      Remove
                    </Button>
                    <Button size="sm" onClick={() => setMode(null)}>
                      Keep it
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={rows.actions}>
                  <Button size="sm" disabled={pending || i === 0} label={`Move ${section.name} up`} onClick={() => move(i, -1)}>
                    Up
                  </Button>
                  <Button
                    size="sm"
                    disabled={pending || i === sections.length - 1}
                    label={`Move ${section.name} down`}
                    onClick={() => move(i, 1)}
                  >
                    Down
                  </Button>
                  <Button size="sm" label={`Edit ${section.name}`} onClick={() => setMode({ kind: "edit", slug: section.slug })}>
                    Edit
                  </Button>
                  <Button size="sm" label={`Remove ${section.name}`} onClick={() => setMode({ kind: "remove", slug: section.slug })}>
                    Remove
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className={styles.add} aria-label="New section">
        <h2 className={styles.subtitle}>New section</h2>
        <p className={styles.note}>It appears in the site&rsquo;s menu as soon as it&rsquo;s added. Its address comes from the name.</p>
        {/* A new key after each add clears the form */}
        <SectionForm
          key={adding}
          initial={{ name: "", layout: "grid" }}
          submitLabel="Add section"
          busy={pending}
          onSubmit={(value) => run(() => createSection(value), () => setAdding((n) => n + 1))}
        />
      </section>
    </div>
  );
}
