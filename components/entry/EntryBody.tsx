import type { Block } from "@/types/entry";
import { HighlightQuote } from "@/components/entries/HighlightQuote";
import { MediaFigure } from "@/components/media/MediaFigure";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import { bodyPieces } from "@/lib/body";
import styles from "./EntryBody.module.css";

type Props = { blocks: Block[]; skip?: Block; pull?: string };

// Text is rendered as text nodes only, so editor and feed content can never inject markup here
function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h":
      return <h2>{block.text}</h2>;
    case "code":
      return (
        <pre>
          <code>{block.text}</code>
        </pre>
      );
    case "quote":
      return <blockquote className={styles.quote}>{block.text}</blockquote>;
    case "image":
    case "gallery":
      return <MediaFigure block={block} />;
    default:
      return <p>{block.text}</p>;
  }
}

/** An entry's story, block by block. */
export function EntryBody({ blocks, skip, pull }: Props) {
  return (
    <div className={styles.body}>
      {bodyPieces(blocks, { skip, pull }).map((piece) => {
        if (piece.kind === "pull") {
          return (
            <div key={piece.key} className={styles.pull} data-reveal>
              <HighlightQuote text={piece.text} size="pull" />
            </div>
          );
        }
        if (piece.kind === "phones") {
          return (
            <div key={piece.key} className={styles.phones} data-reveal>
              {piece.blocks.map((b, i) => (
                <PhoneFrame key={i} block={b} live />
              ))}
            </div>
          );
        }
        return <BlockView key={piece.key} block={piece.block} />;
      })}
    </div>
  );
}
