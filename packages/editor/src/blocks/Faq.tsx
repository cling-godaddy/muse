import type { FaqBlock as FaqBlockType, FaqItem } from "@muse/core";

interface Props {
  block: FaqBlockType
  onUpdate: (data: Partial<FaqBlockType>) => void
}

export function Faq({ block, onUpdate }: Props) {
  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  return (
    <div className="muse-block-faq">
      {block.headline !== undefined && (
        <input
          type="text"
          className="muse-block-faq-headline"
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <input
          type="text"
          className="muse-block-faq-subheadline"
          value={block.subheadline}
          onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
          placeholder="Subheadline..."
        />
      )}
      <div className="muse-block-faq-items">
        {block.items.map((item, i) => (
          <div key={i} className="muse-block-faq-item">
            <input
              type="text"
              className="muse-block-faq-question"
              value={item.question}
              onChange={e => updateItem(i, { question: e.target.value })}
              placeholder="Question?"
            />
            <textarea
              className="muse-block-faq-answer"
              value={item.answer}
              onChange={e => updateItem(i, { answer: e.target.value })}
              placeholder="Answer..."
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
