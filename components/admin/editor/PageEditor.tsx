"use client";

import { useRouter } from "next/navigation";
import type { Page } from "@/types/entry";
import { savePage } from "@/features/admin/page-actions";
import type { PageInput } from "@/lib/entry-input";
import { AutoTextarea } from "./AutoTextarea";
import type { KeyedBlock } from "./BlockEditor";
import { EditorBar } from "./EditorBar";
import { Field } from "./Field";
import { StoryEditor } from "./StoryEditor";
import { keyedBlocks, useEditorDraft } from "./useEditorDraft";
import controls from "./controls.module.css";
import styles from "./EntryEditor.module.css";

type Props = { page: Page };

type Draft = Omit<PageInput, "blocks"> & { blocks: KeyedBlock[] };

function toInput({ blocks, ...rest }: Draft): PageInput {
  return { ...rest, blocks: blocks.map((b) => b.block) };
}

/** A page's headline, opening line and story, as the site shows them; nothing is stored until Save. */
export function PageEditor({ page }: Props) {
  const router = useRouter();
  const { draft, set, updateBlock, newKey, bar, onUploading } = useEditorDraft<Draft, PageInput>({
    start: () => ({ title: page.title, intro: page.intro, blocks: keyedBlocks(page.blocks) }),
    toInput,
    save: (input) => savePage(page.slug, input),
    savedText: () => "Saved and live.",
  });

  return (
    <div className={styles.editor}>
      <div className={styles.fields}>
        <Field label="Headline">
          <input className={`${controls.input} ${styles.title}`} value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Opening line">
          <AutoTextarea className={controls.input} value={draft.intro} onChange={(e) => set("intro", e.target.value)} />
        </Field>
      </div>
      <StoryEditor blocks={draft.blocks} onChange={(blocks) => set("blocks", blocks)} update={updateBlock} newKey={newKey} onUploading={onUploading} />
      <EditorBar state={bar} onBack={() => router.push("/admin")} />
    </div>
  );
}
