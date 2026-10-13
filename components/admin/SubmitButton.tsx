"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "@/components/ui/Button";

type Props = { children: ReactNode; variant?: ButtonVariant; label?: string };

/** A small form button that dims while its server action runs, so a tap on a phone visibly registers. */
export function SubmitButton({ children, variant, label }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button submit size="sm" variant={variant} label={label} busy={pending}>
      {children}
    </Button>
  );
}
