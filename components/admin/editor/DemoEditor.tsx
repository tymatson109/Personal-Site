"use client";

import { isDemoUrl } from "@/lib/demos";
import { Field } from "./Field";
import controls from "./controls.module.css";
import type { BlockUpdate } from "./MediaEditor";

type Props = { address: string; update: BlockUpdate };

/** A live demo is the address of the app's demo build; the site plays it inside a phone. */
export function DemoEditor({ address, update }: Props) {
  const filled = address.trim() !== "";
  return (
    <Field
      label="Demo address"
      hint={
        filled && !isDemoUrl(address)
          ? "Use the full address, starting with https://. It stays hidden on the site until it does."
          : "The demo build's link from Vercel, such as https://roomwise-demo.vercel.app."
      }
    >
      <input
        className={controls.input}
        type="url"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="https://"
        value={address}
        onChange={(e) => {
          const text = e.target.value;
          update((b) => ({ ...b, text }));
        }}
      />
    </Field>
  );
}
