"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Block, Entry, Section } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { saveEntry } from "@/features/admin/entry-actions";
import { tagsFromText, type EntryInput } from "@/lib/entry-input";
import { slugify } from "@/lib/slug";
import { AutoTextarea } from "./AutoTextarea";
import { BlockEditor, type KeyedBlock } from "./BlockEditor";
import { FactsEditor } from "./FactsEditor";
import { Field } from "./Field";
import controls from "./controls.module.css";
import styles from "./EntryEditor.module.css";

type Props = { entry: Entry; sections: Section[] };

type Draft = Omit<EntryInput, "tags" | "blocks"> & { tagsText: string; blocks: KeyedBlock[] };

function toInput({ tagsText, blocks, ...rest }: Draft): EntryInput {
  return { ...rest, tags: tagsFromText(tagsText), blocks: blocks.map((b) => b.block) };
}

/** Everything about one entry on one page; nothing is stored until Save, and leaving with changes asks first. */
export function EntryEditor({ entry, sections }: Props) {
  const router = useRouter();
  const nextKey = useRef(0);
  // Called only from event handlers, after the first render has used the start-n keys
  const newKey = () => `b${nextKey.current++}`;
  const [draft, setDraft] = useState<Draft>(() => ({
    section: entry.section,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    date: entry.date,
    tagsText: entry.tags.join(", "),
    featured: entry.featured,
    status: entry.status,
    quote: entry.quote,
    facts: entry.facts,
    blocks: (entry.blocks.length ? entry.blocks : [{ type: "p" as const, text: "" }]).map((block, i) => ({ key: `start-${i}`, block })),
  }));
  const [saved, setSaved] = useState(() => JSON.stringify(toInput(draft)));
  // A new entry's address follows its title until the address is edited by hand
  const [slugFollows, setSlugFollows] = useState(entry.slug.startsWith("untitled-"));
  const [message, setMessage] = useState<{ kind: "error" | "saved"; text: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploads, setUploads] = useState(0);

  const dirty = JSON.stringify(toInput(draft)) !== saved;
  const layout = sections.find((s) => s.slug === draft.section)?.layout;

  // The browser's own prompt covers closing the tab, reloading and the back gesture
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setMessage(null);
  };
  const updateBlock = (key: string) => (change: (block: Block) => Block) => {
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (b.key === key ? { ...b, block: change(b.block) } : b)) }));
    setMessage(null);
  };
  const setTitle = (title: string) => {
    setDraft((d) => ({ ...d, title, slug: slugFollows && slugify(title) ? slugify(title) : d.slug }));
    setMessage(null);
  };

  function save(then?: () => void) {
    const input = toInput(draft);
    startTransition(async () => {
      const result = await saveEntry(entry.id, input);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        setLeaving(false);
        return;
      }
      setSaved(JSON.stringify(input));
      setSlugFollows(false);
      setMessage({ kind: "saved", text: input.status === "live" ? "Saved and live." : "Saved as a draft." });
      then?.();
    });
  }

  const backToList = () => router.push("/admin");

  return (
    <div className={styles.editor}>
      <div className={styles.fields}>
        <Field label="Title">
          <input className={`${controls.input} ${styles.title}`} value={draft.title} placeholder="Untitled" onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className={styles.pair}>
          <Field label="Section">
            <select className={controls.input} value={draft.section} onChange={(e) => set("section", e.target.value)}>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input className={controls.input} type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
        </div>
        <Field label="Address" hint={`/${draft.section}/${draft.slug}`}>
          <input
            className={controls.input}
            value={draft.slug}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              setSlugFollows(false);
              set("slug", e.target.value);
            }}
          />
        </Field>
        <Field label="Summary" hint="One or two lines shown on cards and in search results.">
          <AutoTextarea className={controls.input} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>
        <Field label="Tags" hint="Separate with commas.">
          <input className={controls.input} value={draft.tagsText} placeholder="iOS, Expo" onChange={(e) => set("tagsText", e.target.value)} />
        </Field>
        {layout === "list" && (
          <Field label="Highlight quote" hint="Shown in the preview and as a pull quote. Leave empty to use the first quote block.">
            <AutoTextarea className={controls.input} value={draft.quote} onChange={(e) => set("quote", e.target.value)} />
          </Field>
        )}
        {layout === "grid" && <FactsEditor facts={draft.facts} onChange={(facts) => set("facts", facts)} />}
        <div className={styles.toggles}>
          <fieldset className={styles.status}>
            <legend className={controls.legend}>Status</legend>
            {(["draft", "live"] as const).map((status) => (
              <label key={status} className={styles.choice}>
                <input type="radio" name="status" checked={draft.status === status} onChange={() => set("status", status)} />
                {status === "draft" ? "Draft" : "Live"}
              </label>
            ))}
          </fieldset>
          <label className={styles.choice}>
            <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on the homepage
          </label>
        </div>
      </div>

      <section className={styles.story} aria-label="Story">
        <p className={controls.legend}>Story</p>
        <BlockEditor
          blocks={draft.blocks}
          onChange={(blocks) => set("blocks", blocks)}
          update={updateBlock}
          newKey={newKey}
          onUploading={(busy) => setUploads((n) => n + (busy ? 1 : -1))}
        />
      </section>

      <div className={styles.bar}>
        {leaving ? (
          <div className={styles.leave} role="alertdialog" aria-label="Unsaved changes">
            <p>You have unsaved changes.</p>
            <div className={styles.buttons}>
              <Button size="sm" variant="primary" busy={pending} disabled={uploads > 0} onClick={() => save(backToList)}>
                Save
              </Button>
              <Button size="sm" onClick={backToList}>
                Discard
              </Button>
              <Button size="sm" onClick={() => setLeaving(false)}>
                Keep editing
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className={message?.kind === "error" ? styles.error : styles.note} role="status">
              {uploads > 0 ? "Uploading…" : (message?.text ?? (dirty ? "Unsaved changes" : "All changes saved"))}
            </p>
            <div className={styles.buttons}>
              <Button size="sm" onClick={() => (dirty ? setLeaving(true) : backToList())}>
                Back
              </Button>
              <Button size="sm" variant="primary" busy={pending} disabled={!dirty || uploads > 0} onClick={() => save()}>
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
