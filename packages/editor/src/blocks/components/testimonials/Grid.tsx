import type { TestimonialsBlock as TestimonialsBlockType, Quote } from "@muse/core";

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
    <section className="muse-block-testimonials-grid">
      {block.headline !== undefined && (
        <div className="muse-block-testimonials-grid-header">
          <input
            type="text"
            className="muse-block-testimonials-grid-headline"
            value={block.headline}
            onChange={e => onUpdate({ headline: e.target.value || undefined })}
            placeholder="Section headline..."
          />
        </div>
      )}
      <div className="muse-block-testimonials-grid-container">
        {block.quotes.map((quote, i) => (
          <figure key={i} className="muse-block-testimonials-grid-card">
            <blockquote>
              <textarea
                className="muse-block-testimonials-grid-quote"
                value={`"${quote.text}"`}
                onChange={(e) => {
                  const text = e.target.value.replace(/^"|"$/g, "");
                  updateQuote(i, { text });
                }}
                placeholder="Quote text..."
                rows={4}
              />
            </blockquote>
            <figcaption className="muse-block-testimonials-grid-author">
              <div className="muse-block-testimonials-grid-avatar">
                {quote.author.charAt(0)}
              </div>
              <div>
                <input
                  type="text"
                  className="muse-block-testimonials-grid-name"
                  value={quote.author}
                  onChange={e => updateQuote(i, { author: e.target.value })}
                  placeholder="Author name"
                />
                <input
                  type="text"
                  className="muse-block-testimonials-grid-role"
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
