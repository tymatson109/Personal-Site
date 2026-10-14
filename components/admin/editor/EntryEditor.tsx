"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Entry, Section } from "@/types/entry";
import { saveEntry } from "@/features/admin/entry-actions";
import { tagsFromText, type EntryInput } from "@/lib/entry-input";
import { slugify } from "@/lib/slug";
import { AutoTextarea } from "./AutoTextarea";
import { Choices } from "./Choices";
import choices from "./Choices.module.css";
import type { KeyedBlock } from "./BlockEditor";
import { EditorBar } from "./EditorBar";
import { FactsEditor } from "./FactsEditor";
import { QuotePicker } from "./QuotePicker";
import { StoryEditor } from "./StoryEditor";
import { Field } from "./Field";
import controls from "./controls.module.css";
import { keyedBlocks, useEditorDraft } from "./useEditorDraft";
import styles from "./EntryEditor.module.css";

type Props = { entry: Entry; sections: Section[] };

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "live", label: "Live" },
] as const;

type Draft = Omit<EntryInput, "tags" | "blocks"> & { tagsText: string; blocks: KeyedBlock[] };

function toInput({ tagsText, blocks, ...rest }: Draft): EntryInput {
  return { ...rest, tags: tagsFromText(tagsText), blocks: blocks.map((b) => b.block) };
}

/** Everything about one entry on one page; nothing is stored until Save, and leaving with changes asks first. */
export function EntryEditor({ entry, sections }: Props) {
  const router = useRouter();
  const { draft, change, set, updateBlock, newKey, bar, onUploading } = useEditorDraft<Draft, EntryInput>({
    start: () => ({
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
      blocks: keyedBlocks(entry.blocks),
    }),
    toInput,
    save: (input) => saveEntry(entry.id, input),
    savedText: (input) => (input.status === "live" ? "Saved and live." : "Saved as a draft."),
  });
  // A new entry's address follows its title until the address is edited by hand or saved
  const [slugFollows, setSlugFollows] = useState(entry.slug.startsWith("untitled-"));
  const layout = sections.find((s) => s.slug === draft.section)?.layout;

  const setTitle = (title: string) => change((d) => ({ ...d, title, slug: slugFollows && slugify(title) ? slugify(title) : d.slug }));
  const state = { ...bar, submit: (then?: () => void) => bar.submit(then, () => setSlugFollows(false)) };

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
          <QuotePicker blocks={draft.blocks.map((b) => b.block)} value={draft.quote} onChange={(quote) => set("quote", quote)} />
        )}
        {layout === "grid" && <FactsEditor facts={draft.facts} onChange={(facts) => set("facts", facts)} />}
        <div className={styles.toggles}>
          <Choices legend="Status" name="status" options={STATUS_OPTIONS} value={draft.status} onChange={(status) => set("status", status)} />
          <label className={choices.choice}>
            <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on the homepage
          </label>
        </div>
      </div>

      <StoryEditor blocks={draft.blocks} onChange={(blocks) => set("blocks", blocks)} update={updateBlock} newKey={newKey} onUploading={onUploading} />

      <EditorBar state={state} onBack={backToList} />
    </div>
  );
}
