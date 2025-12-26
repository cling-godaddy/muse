import type { TestimonialsBlock as TestimonialsBlockType, Quote } from "@muse/core";
import styles from "./Grid.module.css";

interface Props {
  block: TestimonialsBlockType
  onUpdate: (data: Partial<TestimonialsBlockType>) => void
}

export function Grid({ block, onUpdate }: Props) {
  const updateQuote = (index: number, data: Partial<Quote>) => {
    const quotes = block.quotes.map((q, i) =>
      i === index ? { ...q, ...data } : q,
    );
    onUpdate({ quotes });
  };

  return (
    <section className={styles.section}>
      {block.headline !== undefined && (
        <div className={styles.header}>
          <input
            type="text"
            className={styles.headline}
            value={block.headline}
            onChange={e => onUpdate({ headline: e.target.value || undefined })}
            placeholder="Section headline..."
          />
        </div>
      )}
      <div className={styles.container}>
        {block.quotes.map((quote, i) => (
          <figure key={i} className={styles.card}>
            <blockquote>
              <textarea
                className={styles.quote}
                value={`"${quote.text}"`}
                onChange={(e) => {
                  const text = e.target.value.replace(/^"|"$/g, "");
                  updateQuote(i, { text });
                }}
                placeholder="Quote text..."
                rows={4}
              />
            </blockquote>
            <figcaption className={styles.author}>
              <div className={styles.avatar}>
                {quote.author.charAt(0)}
              </div>
              <div>
                <input
                  type="text"
                  className={styles.name}
                  value={quote.author}
                  onChange={e => updateQuote(i, { author: e.target.value })}
                  placeholder="Author name"
                />
                <input
                  type="text"
                  className={styles.role}
                  value={[quote.role, quote.company].filter(Boolean).join(", ")}
                  onChange={(e) => {
                    const parts = e.target.value.split(", ");
                    updateQuote(i, {
                      role: parts[0] || undefined,
                      company: parts[1] || undefined,
                    });
                  }}
                  placeholder="Role, Company"
                />
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
