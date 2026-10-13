"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string };

/** A textarea that grows with its text, so long blocks never scroll inside a box on a phone. */
export const AutoTextarea = forwardRef<HTMLTextAreaElement, Props>(function AutoTextarea(props, ref) {
  const inner = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLTextAreaElement);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return <textarea ref={inner} rows={1} {...props} />;
});
