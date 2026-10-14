"use client";

import { Button } from "@/components/ui/Button";
import type { EditorBarState } from "./useEditorDraft";
import styles from "./EditorBar.module.css";

type Props = { state: EditorBarState; onBack: () => void };

/** An editor's Save and Back, kept under the thumb; Back with unsaved changes asks Save or Discard first. */
export function EditorBar({ state, onBack }: Props) {
  const { dirty, pending, uploads, message, leaving, setLeaving, submit } = state;
  return (
    <div className={styles.bar}>
      {leaving ? (
        <div className={styles.leave} role="alertdialog" aria-label="Unsaved changes">
          <p>You have unsaved changes.</p>
          <div className={styles.buttons}>
            <Button size="sm" variant="primary" busy={pending} disabled={uploads > 0} onClick={() => submit(onBack)}>
              Save
            </Button>
            <Button size="sm" onClick={onBack}>
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
            <Button size="sm" onClick={() => (dirty ? setLeaving(true) : onBack())}>
              Back
            </Button>
            <Button size="sm" variant="primary" busy={pending} disabled={!dirty || uploads > 0} onClick={() => submit()}>
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
