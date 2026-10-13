"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import type { Block } from "@/types/entry";
import { Label } from "@/components/ui/Label";
import { BLOCK_LABELS, blockMenu, isSlashCommand, isTextBlock, TEXT_BLOCKS, type MenuBlockType, type TextBlockType } from "@/lib/blocks";
import { isUploadBlockType } from "@/lib/media";
import { insertAt, moveItem, removeAt, replaceAt } from "@/lib/list-ops";
import { looksLikeMarkdown, markdownToBlocks } from "@/lib/markdown";
import { AutoTextarea } from "./AutoTextarea";
import { MediaEditor, type BlockUpdate } from "./MediaEditor";
import styles from "./BlockEditor.module.css";
import controls from "./controls.module.css";

/** A block with a key that survives reordering, so React keeps each textarea's focus and caret. */
export type KeyedBlock = { key: string; block: Block };

type Props = {
  blocks: KeyedBlock[];
  onChange: (blocks: KeyedBlock[]) => void;
  /** Changes one block by key against the latest state, for uploads that finish after other edits */
  update: (key: string) => BlockUpdate;
  newKey: () => string;
  onUploading: (busy: boolean) => void;
};

type Focus = { key: string; caret: number };

const PLACEHOLDER: Record<TextBlockType, string> = {
  p: "Write, or type / for a heading, quote, code or photo",
  h: "Heading",
  quote: "Quote",
  code: "Code",
};

/** The story as a list of blocks: Enter starts a new block, / changes its type, pasted Markdown becomes blocks. */
export function BlockEditor({ blocks, onChange, update, newKey, onUploading }: Props) {
  const inputs = useRef(new Map<string, HTMLTextAreaElement>());
  const pendingFocus = useRef<Focus | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Moves the caret only after React has rendered the block it belongs to
  useEffect(() => {
    const focus = pendingFocus.current;
    if (!focus) return;
    pendingFocus.current = null;
    const el = inputs.current.get(focus.key);
    el?.focus();
    el?.setSelectionRange(focus.caret, focus.caret);
  });

  const setFocus = (focus: Focus) => {
    pendingFocus.current = focus;
  };

  const keyed = (block: Block): KeyedBlock => ({ key: newKey(), block });
  const setText = (i: number, text: string) => onChange(replaceAt(blocks, i, { ...blocks[i], block: { ...blocks[i].block, text } }));
  const setType = (i: number, type: MenuBlockType, clear: boolean) => {
    onChange(replaceAt(blocks, i, { ...blocks[i], block: { type, text: clear ? "" : blocks[i].block.text } }));
    setOpenMenu(null);
    setFocus({ key: blocks[i].key, caret: clear ? 0 : blocks[i].block.text.length });
  };
  const remove = (i: number) => {
    const before = blocks[i - 1];
    onChange(removeAt(blocks, i));
    setOpenMenu(null);
    if (before && isTextBlock(before.block)) setFocus({ key: before.key, caret: before.block.text.length });
  };
  const move = (i: number, by: number) => {
    onChange(moveItem(blocks, i, i + by));
    setOpenMenu(null);
  };
  const add = () => {
    const block = keyed({ type: "p", text: "" });
    onChange([...blocks, block]);
    setFocus({ key: block.key, caret: 0 });
  };

  function onKeyDown(i: number, event: KeyboardEvent<HTMLTextAreaElement>) {
    const { block, key } = blocks[i];
    const el = event.currentTarget;
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey && isSlashCommand(block.text)) {
      const [first] = blockMenu(block.text);
      if (first) {
        event.preventDefault();
        setType(i, first, true);
      }
      return;
    }
    // Code keeps Enter for new lines; elsewhere Enter splits the block at the caret
    if (event.key === "Enter" && !event.shiftKey && block.type !== "code") {
      event.preventDefault();
      const caret = el.selectionStart;
      const next = keyed({ type: "p", text: block.text.slice(el.selectionEnd) });
      onChange(insertAt(replaceAt(blocks, i, { key, block: { ...block, text: block.text.slice(0, caret) } }), i + 1, next));
      setFocus({ key: next.key, caret: 0 });
      return;
    }
    // Backspace at the very start joins this block onto the text block above it
    if (event.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0 && i > 0) {
      const above = blocks[i - 1];
      if (!isTextBlock(above.block)) return;
      event.preventDefault();
      const caret = above.block.text.length;
      const joined = { ...above, block: { ...above.block, text: above.block.text + block.text } };
      onChange(removeAt(replaceAt(blocks, i - 1, joined), i));
      setFocus({ key: above.key, caret });
    }
  }

  function onPaste(i: number, event: ClipboardEvent<HTMLTextAreaElement>) {
    const text = event.clipboardData.getData("text/plain");
    if (blocks[i].block.type === "code" || !looksLikeMarkdown(text)) return;
    const pasted = markdownToBlocks(text).map(keyed);
    if (!pasted.length) return;
    event.preventDefault();
    const empty = !blocks[i].block.text.trim();
    onChange(empty ? insertAt(removeAt(blocks, i), i, ...pasted) : insertAt(blocks, i + 1, ...pasted));
    const last = pasted[pasted.length - 1];
    setFocus({ key: last.key, caret: last.block.text.length });
  }

  return (
    <div className={styles.editor}>
      {blocks.map(({ key, block }, i) => {
        const menuOpen = openMenu === key;
        const slash = isTextBlock(block) && isSlashCommand(block.text) ? blockMenu(block.text) : [];
        return (
          <div key={key} className={styles.block} data-type={block.type}>
            <div className={styles.gutter}>
              <button
                type="button"
                className={`${controls.legend} ${styles.kind}`}
                aria-expanded={menuOpen}
                aria-label={`${BLOCK_LABELS[block.type]} block, options`}
                onClick={() => setOpenMenu(menuOpen ? null : key)}
              >
                {BLOCK_LABELS[block.type]}
              </button>
            </div>
            {isTextBlock(block) ? (
              <AutoTextarea
                ref={(el) => {
                  if (el) inputs.current.set(key, el);
                  else inputs.current.delete(key);
                }}
                className={styles.text}
                value={block.text}
                placeholder={PLACEHOLDER[block.type]}
                aria-label={BLOCK_LABELS[block.type]}
                spellCheck={block.type !== "code"}
                onChange={(e) => setText(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={(e) => onPaste(i, e)}
              />
            ) : isUploadBlockType(block.type) ? (
              <MediaEditor block={{ ...block, type: block.type }} update={update(key)} onUploading={onUploading} />
            ) : (
              <p className={styles.media}>
                <Label>{BLOCK_LABELS[block.type]}</Label> Shown on the page as it is. Live demos are set up with the app demos.
              </p>
            )}
            {slash.length > 0 && (
              <ul className={styles.menu} role="listbox" aria-label="Turn into">
                {slash.map((type, n) => (
                  <li key={type}>
                    <button type="button" role="option" aria-selected={n === 0} onClick={() => setType(i, type, true)}>
                      {BLOCK_LABELS[type]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {menuOpen && (
              <div className={styles.options}>
                {isTextBlock(block) && (
                  <div className={styles.row} role="group" aria-label="Turn into">
                    {TEXT_BLOCKS.map((type) => (
                      <button key={type} type="button" aria-pressed={type === block.type} onClick={() => setType(i, type, false)}>
                        {BLOCK_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
                <div className={styles.row}>
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)}>
                    Move up
                  </button>
                  <button type="button" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>
                    Move down
                  </button>
                  <button type="button" className={styles.danger} onClick={() => remove(i)}>
                    Delete block
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className={controls.quiet} onClick={add}>
        + Add block
      </button>
    </div>
  );
}
