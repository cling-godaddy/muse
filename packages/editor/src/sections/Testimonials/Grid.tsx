import type { TestimonialsSection as TestimonialsSectionType, Quote } from "@muse/core";
import { useIsEditable } from "../../context/EditorMode";
import { Avatar, EditableText } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  section: TestimonialsSectionType
  onUpdate: (data: Partial<TestimonialsSectionType>) => void
  isPending?: boolean
}

export function Grid({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  const updateQuote = (index: number, data: Partial<Quote>) => {
    const quotes = section.quotes.map((q, i) =>
      i === index ? { ...q, ...data } : q,
    );
    onUpdate({ quotes });
  };

  return (
    <section className={styles.section}>
      {section.headline !== undefined && (
        <div className={styles.header}>
          <EditableText
            value={section.headline}
            onChange={v => onUpdate({ headline: v || undefined })}
            as="h2"
            className={styles.headline}
            placeholder="Section headline..."
          />
        </div>
      )}
      <div className={styles.container}>
        {section.quotes.map((quote, i) => (
          <figure key={i} className={styles.card}>
            <blockquote>
              <EditableText
                value={quote.text}
                onChange={v => updateQuote(i, { text: v })}
                as="p"
                className={styles.quote}
                placeholder="Quote text..."
              />
            </blockquote>
            <figcaption className={styles.author}>
              <Avatar image={quote.avatar} name={quote.author} isPending={isPending} className={styles.avatar} />
              <div>
                {isEditable
                  ? (
                    <>
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
                    </>
                  )
                  : (
                    <>
                      <span className={styles.name}>{quote.author}</span>
                      <span className={styles.role}>
                        {[quote.role, quote.company].filter(Boolean).join(", ")}
                      </span>
                    </>
                  )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
