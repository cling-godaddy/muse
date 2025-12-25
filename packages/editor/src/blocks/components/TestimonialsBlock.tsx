import type { TestimonialsBlock as TestimonialsBlockType, Quote } from "@muse/core";

interface Props {
  block: TestimonialsBlockType
  onUpdate: (data: Partial<TestimonialsBlockType>) => void
}

export function TestimonialsBlock({ block, onUpdate }: Props) {
  const updateQuote = (index: number, data: Partial<Quote>) => {
    const quotes = block.quotes.map((q, i) =>
      i === index ? { ...q, ...data } : q,
    );
    onUpdate({ quotes });
  };

  return (
    <div className="muse-block-testimonials">
      {block.headline !== undefined && (
        <input
          type="text"
          className="muse-block-testimonials-headline"
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      <div className="muse-block-testimonials-quotes">
        {block.quotes.map((quote, i) => (
          <div key={i} className="muse-block-testimonials-quote">
            <textarea
              className="muse-block-testimonials-text"
              value={quote.text}
              onChange={e => updateQuote(i, { text: e.target.value })}
              placeholder="Quote text..."
              rows={3}
            />
            <div className="muse-block-testimonials-author">
              <input
                type="text"
                value={quote.author}
                onChange={e => updateQuote(i, { author: e.target.value })}
                placeholder="Author name"
              />
              <input
                type="text"
                value={quote.role ?? ""}
                onChange={e => updateQuote(i, { role: e.target.value || undefined })}
                placeholder="Role"
              />
              <input
                type="text"
                value={quote.company ?? ""}
                onChange={e => updateQuote(i, { company: e.target.value || undefined })}
                placeholder="Company"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
