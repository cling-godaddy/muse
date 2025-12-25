import { useEffect, useRef } from "react";
import type { CtaBlock as CtaBlockType } from "@muse/core";

interface Props {
  block: CtaBlockType
  onUpdate: (data: Partial<CtaBlockType>) => void
}

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

export function CtaBlock({ block, onUpdate }: Props) {
  const variant = block.variant ?? "primary";
  const headlineRef = useAutoResize(block.headline);

  return (
    <div className={`muse-block-cta muse-block-cta--${variant}`}>
      <textarea
        ref={headlineRef}
        className="muse-block-cta-headline"
        rows={1}
        value={block.headline}
        onChange={e => onUpdate({ headline: e.target.value })}
        placeholder="CTA headline..."
      />
      <textarea
        className="muse-block-cta-description"
        value={block.description ?? ""}
        onChange={e => onUpdate({ description: e.target.value || undefined })}
        placeholder="Description..."
        rows={2}
      />
      <div className="muse-block-cta-button">
        <input
          type="text"
          value={block.buttonText}
          onChange={e => onUpdate({ buttonText: e.target.value })}
          placeholder="Button text..."
        />
        <input
          type="text"
          value={block.buttonHref}
          onChange={e => onUpdate({ buttonHref: e.target.value })}
          placeholder="Button link..."
        />
      </div>
      <select
        value={variant}
        onChange={e => onUpdate({ variant: e.target.value as "primary" | "secondary" })}
        className="muse-block-cta-variant"
      >
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
      </select>
    </div>
  );
}
