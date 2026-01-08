import type { TestimonialsSection as TestimonialsSectionType, Quote } from "@muse/core";
import { useIsEditable } from "../../context/EditorMode";
import { Avatar, EditableText, Skeleton } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  section: TestimonialsSectionType
  onUpdate: (data: Partial<TestimonialsSectionType>) => void
  isPending?: boolean
}

export function Grid({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  // Show section-level skeleton when empty array during generation
  if (isPending && section.quotes.length === 0) {
    return (
      <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
        {section.headline !== undefined && (
          <div className={styles.header}>
            <Skeleton variant="text" height="2em" width="40%" className={styles.headline} />
          </div>
        )}
        <div className={styles.container}>
          {[0, 1, 2].map(i => (
            <figure key={i} className={styles.card}>
              <blockquote>
                <Skeleton variant="text" height="1em" width="100%" className={styles.quote} />
                <Skeleton variant="text" height="1em" width="90%" />
                <Skeleton variant="text" height="1em" width="95%" />
              </blockquote>
              <figcaption className={styles.author}>
                <Skeleton variant="circle" width="48px" height="48px" className={styles.avatar} />
                <div>
                  <Skeleton variant="text" height="1em" width="120px" />
                  <Skeleton variant="text" height="0.9em" width="150px" />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const updateQuote = (index: number, data: Partial<Quote>) => {
    const quotes = section.quotes.map((q, i) =>
      i === index ? { ...q, ...data } : q,
    );
    onUpdate({ quotes });
  };

  return (
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
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
              {isPending
                ? (
                  <>
                    <Skeleton variant="text" height="1em" width="100%" className={styles.quote} />
                    <Skeleton variant="text" height="1em" width="90%" />
                    <Skeleton variant="text" height="1em" width="95%" />
                  </>
                )
                : (
                  <EditableText
                    value={quote.text}
                    onChange={v => updateQuote(i, { text: v })}
                    as="p"
                    className={styles.quote}
                    placeholder="Quote text..."
                  />
                )}
            </blockquote>
            <figcaption className={styles.author}>
              <Avatar image={quote.avatar} name={quote.author} isPending={isPending} className={styles.avatar} />
              <div>
                {isPending
                  ? (
                    <>
                      <Skeleton variant="text" height="1em" width="120px" />
                      <Skeleton variant="text" height="0.9em" width="150px" />
                    </>
                  )
                  : isEditable
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
