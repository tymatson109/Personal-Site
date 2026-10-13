"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import type { Block, Media } from "@/types/entry";
import { uploadMedia } from "@/features/admin/upload";
import { moveItem, removeAt, replaceAt } from "@/lib/list-ops";
import { UPLOAD_RULES, type UploadBlockType } from "@/lib/media";
import { AutoTextarea } from "./AutoTextarea";
import controls from "./controls.module.css";
import styles from "./MediaEditor.module.css";

/** Applies a change to the block as it is when the change lands, so a finished upload never undoes edits made meanwhile. */
export type BlockUpdate = (change: (block: Block) => Block) => void;

type Props = { block: Block & { type: UploadBlockType }; update: BlockUpdate; onUploading: (busy: boolean) => void };

const PICK: Record<UploadBlockType, string> = {
  image: "Choose a photo",
  gallery: "Add photos",
  video: "Choose a recording",
};

type Progress = { done: number; total: number; percent: number };

/** An image, gallery or phone recording: pick files from the phone, describe each one, add a caption. */
export function MediaEditor({ block, update, onUploading }: Props) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rule = UPLOAD_RULES[block.type];
  const media = block.media ?? [];
  const room = rule.max - media.length;
  const setMedia = (change: (media: Media[]) => Media[]) => update((b) => ({ ...b, media: change(b.media ?? []) }));

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])].slice(0, Math.max(room, 0));
    event.target.value = "";
    if (!files.length) return;
    setError(null);
    onUploading(true);
    // One at a time keeps a phone's connection steady and the progress honest
    for (const [n, file] of files.entries()) {
      setProgress({ done: n, total: files.length, percent: 0 });
      try {
        const uploaded = await uploadMedia(block.type, file, (percent) => setProgress({ done: n, total: files.length, percent }));
        setMedia((list) => [...list, uploaded].slice(0, rule.max));
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "Upload failed."}`);
      }
    }
    setProgress(null);
    onUploading(false);
  }

  return (
    <div className={styles.media}>
      {media.length > 0 && (
        <ul className={styles.items}>
          {media.map((m, i) => (
            <li key={m.url} className={styles.item}>
              <div className={styles.thumb}>
                {block.type === "video" ? (
                  <video className={styles.file} src={m.url} muted playsInline preload="metadata" aria-label="Recording" />
                ) : (
                  <Image className={styles.file} src={m.url} alt={m.alt} width={m.width} height={m.height} sizes="160px" />
                )}
              </div>
              <div className={styles.about}>
                {block.type !== "video" && (
                  <AutoTextarea
                    className={controls.input}
                    value={m.alt}
                    placeholder="Describe the photo for people who can't see it"
                    aria-label="Photo description"
                    onChange={(e) => setMedia((list) => replaceAt(list, i, { ...list[i], alt: e.target.value }))}
                  />
                )}
                {block.type !== "video" && !m.alt.trim() && <p className={styles.hint}>Add a description so screen readers can share it.</p>}
                <div className={styles.row}>
                  {block.type === "gallery" && i > 0 && (
                    <button type="button" className={controls.quiet} onClick={() => setMedia((list) => moveItem(list, i, i - 1))}>
                      Move earlier
                    </button>
                  )}
                  <button type="button" className={`${controls.quiet} ${styles.remove}`} onClick={() => setMedia((list) => removeAt(list, i))}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {progress ? (
        <p className={styles.progress} role="status">
          Uploading{progress.total > 1 ? ` ${progress.done + 1} of ${progress.total}` : ""} · {Math.round(progress.percent)}%
        </p>
      ) : (
        room > 0 && (
          <label className={styles.pick}>
            {PICK[block.type]}
            <input className={styles.input} type="file" accept={rule.types.join(",")} multiple={rule.max > 1} onChange={onPick} />
          </label>
        )
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <AutoTextarea
        className={controls.input}
        value={block.text}
        placeholder="Caption (optional)"
        aria-label="Caption"
        onChange={(e) => {
          const text = e.target.value;
          update((b) => ({ ...b, text }));
        }}
      />
    </div>
  );
}
