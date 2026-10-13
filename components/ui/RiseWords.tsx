import { Fragment } from "react";
import { words } from "@/lib/motion";
import motion from "./motion.module.css";

/** A headline whose words rise in one after another on load. */
export function RiseWords({ text }: { text: string }) {
  return words(text).map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className={motion.word} style={{ "--i": i } as React.CSSProperties}>
        {word}
      </span>
    </Fragment>
  ));
}
