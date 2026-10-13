"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type KeyboardEvent } from "react";
import type { EntryStatus, Section } from "@/types/entry";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import { createEntry } from "@/features/admin/entry-actions";
import { isDemoUrl } from "@/lib/demos";
import {
  canContinue,
  demoAddress,
  emptyDraft,
  hasAnswers,
  isSkipped,
  NEW_ENTRY_STEPS,
  STEP_NAMES,
  STEP_QUESTIONS,
  type NewEntryDraft,
  type NewEntryStep,
} from "@/lib/new-entry";
import { AutoTextarea } from "../editor/AutoTextarea";
import { FactsEditor } from "../editor/FactsEditor";
import choices from "../editor/Choices.module.css";
import controls from "../editor/controls.module.css";
import { FlowProgress } from "./FlowProgress";
import styles from "./NewEntryFlow.module.css";

type Props = { section: Section };

type Answer = Exclude<NewEntryStep, "publish">;

/** What each answer reads as on the last step, where an empty optional answer reads as None. */
function answerText(step: Answer, draft: NewEntryDraft): string {
  if (step === "name") return draft.title;
  if (step === "summary") return draft.summary || "None";
  if (step === "demo") return demoAddress(draft.demo) || "None";
  const facts = draft.facts.filter(([, value]) => value.trim());
  return facts.length ? facts.map(([label, value]) => `${label}: ${value}`).join(" · ") : "None";
}

/** A new entry one question at a time: its name, its line, a project's demo and facts, then publish or keep as a draft. */
export function NewEntryFlow({ section }: Props) {
  const router = useRouter();
  const steps = NEW_ENTRY_STEPS[section.layout];
  const [at, setAt] = useState(0);
  const [draft, setDraft] = useState(() => emptyDraft(section.layout));
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const step = steps[at];
  const last = at === steps.length - 1;
  const ready = canContinue(step, draft);
  const demo = demoAddress(draft.demo);

  const set = <K extends keyof NewEntryDraft>(key: K, value: NewEntryDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  };
  const go = (to: number) => {
    setAt(to);
    setClosing(false);
    setError(null);
  };
  const next = () => {
    if (ready && !last) go(at + 1);
  };
  const leave = () => router.push(`/admin?section=${section.slug}`);
  const close = () => (hasAnswers(draft) ? setClosing(true) : leave());

  // Enter answers the question, as tapping the main button would
  const onEnter = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    next();
  };

  function finish(status: EntryStatus) {
    startTransition(async () => {
      const result = await createEntry(section.slug, draft, status);
      if (!result.ok) return setError(result.error);
      leave();
    });
  }

  return (
    <div className={styles.flow}>
      <header className={styles.head}>
        <Button size="sm" disabled={at === 0 || pending} onClick={() => go(at - 1)}>
          Back
        </Button>
        <FlowProgress step={at} steps={steps.length} />
        <Button size="sm" label="Close" disabled={pending} onClick={close}>
          ✕
        </Button>
      </header>

      <div className={styles.body}>
        <Label as="p">{`New in ${section.name}`}</Label>
        <h1 className={styles.question}>{STEP_QUESTIONS[step]}</h1>

        {step === "name" && (
          <input
            className={`${controls.input} ${styles.big}`}
            aria-label={STEP_NAMES.name}
            value={draft.title}
            maxLength={200}
            autoFocus
            onChange={(e) => set("title", e.target.value)}
            onKeyDown={onEnter}
          />
        )}

        {step === "summary" && (
          <AutoTextarea
            className={controls.input}
            aria-label={STEP_NAMES.summary}
            value={draft.summary}
            maxLength={500}
            autoFocus
            onChange={(e) => set("summary", e.target.value)}
            onKeyDown={onEnter}
          />
        )}

        {step === "demo" && (
          <>
            <input
              className={controls.input}
              aria-label={STEP_NAMES.demo}
              aria-invalid={!ready}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="https://"
              value={draft.demo}
              autoFocus
              onChange={(e) => set("demo", e.target.value)}
              // The address that will play replaces what was typed, so an added https:// is never a surprise
              onBlur={() => set("demo", demo)}
              onKeyDown={onEnter}
            />
            <div className={styles.phone}>
              <PhoneFrame key={demo} block={{ type: "demo", text: isDemoUrl(demo) ? demo : "" }} caption={false} fitHeight live />
            </div>
          </>
        )}

        {step === "facts" && <FactsEditor facts={draft.facts} onChange={(facts) => set("facts", facts)} />}

        {step === "publish" && (
          <>
            <ul className={styles.answers}>
              {steps
                .filter((s): s is Answer => s !== "publish")
                .map((s) => (
                  <li key={s}>
                    <button type="button" className={styles.answer} onClick={() => go(steps.indexOf(s))}>
                      <Label>{STEP_NAMES[s]}</Label>
                      <span className={styles.value}>{answerText(s, draft)}</span>
                    </button>
                  </li>
                ))}
            </ul>
            <label className={choices.choice}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured on the homepage
            </label>
          </>
        )}
      </div>

      <footer className={styles.bar}>
        {closing ? (
          <>
            <p className={styles.note}>Discard this entry?</p>
            <div className={styles.buttons}>
              <Button size="sm" onClick={() => setClosing(false)}>
                Keep going
              </Button>
              <Button size="sm" variant="primary" onClick={leave}>
                Discard
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <div className={styles.buttons}>
              {last ? (
                <>
                  <Button size="sm" busy={pending} onClick={() => finish("draft")}>
                    Save draft
                  </Button>
                  <Button size="sm" variant="primary" busy={pending} onClick={() => finish("live")}>
                    Publish
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="primary" disabled={!ready} onClick={next}>
                  {isSkipped(step, draft) ? "Skip" : "Next"}
                </Button>
              )}
            </div>
          </>
        )}
      </footer>
    </div>
  );
}
