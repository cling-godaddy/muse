import type { TestimonialsBlock as TestimonialsBlockType, Quote } from "@muse/core";
import { useAutoResize } from "../../hooks";
import { ImageWithSkeleton } from "../../ux";
import styles from "./Single.module.css";

interface Props {
  block: TestimonialsBlockType
  onUpdate: (data: Partial<TestimonialsBlockType>) => void
  isPending?: boolean
}

export function Single({ block, onUpdate, isPending }: Props) {
  const quote = block.quotes[0];
  const headlineRef = useAutoResize(block.headline ?? "");

  const updateQuote = (data: Partial<Quote>) => {
    const quotes = block.quotes.map((q, i) =>
      i === 0 ? { ...q, ...data } : q,
    );
    onUpdate({ quotes });
  };

  if (!quote) return null;

  return (
    <section className={styles.section}>
      {block.headline !== undefined && (
        <div className={styles.header}>
          <textarea
            ref={headlineRef}
            className={styles.headline}
            rows={1}
            value={block.headline}
            onChange={e => onUpdate({ headline: e.target.value || undefined })}
            placeholder="Section headline..."
          />
        </div>
      )}
      <figure className={styles.card}>
        <svg className={styles.icon} fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <blockquote>
          <textarea
            className={styles.quote}
            value={quote.text}
            onChange={e => updateQuote({ text: e.target.value })}
            placeholder="Quote text..."
            rows={4}
          />
        </blockquote>
        <figcaption className={styles.author}>
          <div className={styles.avatar}>
            {isPending || quote.avatar
              ? <ImageWithSkeleton image={quote.avatar} isPending={!!isPending && !quote.avatar} variant="circle" />
              : quote.author.charAt(0)}
          </div>
          <div>
            <input
              type="text"
              className={styles.name}
              value={quote.author}
              onChange={e => updateQuote({ author: e.target.value })}
              placeholder="Author name"
            />
            <input
              type="text"
              className={styles.role}
              value={[quote.role, quote.company].filter(Boolean).join(", ")}
              onChange={(e) => {
                const parts = e.target.value.split(", ");
                updateQuote({
                  role: parts[0] || undefined,
                  company: parts[1] || undefined,
                });
              }}
              placeholder="Role, Company"
            />
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
