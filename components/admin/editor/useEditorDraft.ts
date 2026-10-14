"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Block } from "@/types/entry";
import type { SaveResult } from "@/features/admin/entry-actions";
import type { KeyedBlock } from "./BlockEditor";

export type EditorMessage = { kind: "error" | "saved"; text: string };

type Options<D, I> = {
  start: () => D;
  toInput: (draft: D) => I;
  save: (input: I) => Promise<SaveResult>;
  savedText: (input: I) => string;
};

/** Gives an editor's opening blocks stable keys for the block editor. */
export function keyedBlocks(blocks: Block[]): KeyedBlock[] {
  return (blocks.length ? blocks : [{ type: "p" as const, text: "" }]).map((block, i) => ({ key: `start-${i}`, block }));
}

/** An editor's draft of something with a story: nothing is stored until Save, and leaving with changes asks first. */
export function useEditorDraft<D extends { blocks: KeyedBlock[] }, I>({ start, toInput, save, savedText }: Options<D, I>) {
  const nextKey = useRef(0);
  // Called only from event handlers, after the first render has used the start-n keys
  const newKey = () => `b${nextKey.current++}`;
  const [draft, setDraft] = useState<D>(start);
  const [saved, setSaved] = useState(() => JSON.stringify(toInput(draft)));
  const [message, setMessage] = useState<EditorMessage | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploads, setUploads] = useState(0);
  const dirty = JSON.stringify(toInput(draft)) !== saved;

  // The browser's own prompt covers closing the tab, reloading and the back gesture
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = (next: (d: D) => D) => {
    setDraft(next);
    setMessage(null);
  };
  const set = <K extends keyof D>(key: K, value: D[K]) => change((d) => ({ ...d, [key]: value }));
  const updateBlock = (key: string) => (edit: (block: Block) => Block) =>
    change((d) => ({ ...d, blocks: d.blocks.map((b) => (b.key === key ? { ...b, block: edit(b.block) } : b)) }));

  function submit(then?: () => void, onSaved?: () => void) {
    const input = toInput(draft);
    startTransition(async () => {
      const result = await save(input);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        setLeaving(false);
        return;
      }
      setSaved(JSON.stringify(input));
      setMessage({ kind: "saved", text: savedText(input) });
      onSaved?.();
      then?.();
    });
  }

  return {
    draft,
    change,
    set,
    updateBlock,
    newKey,
    dirty,
    bar: { dirty, pending, uploads, message, leaving, setLeaving, submit },
    onUploading: (busy: boolean) => setUploads((n) => n + (busy ? 1 : -1)),
  };
}

export type EditorBarState = ReturnType<typeof useEditorDraft>["bar"];
