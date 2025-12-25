import { useEffect, useRef } from "react";
import type { HeroBlock as HeroBlockType } from "@muse/core";

interface Props {
  block: HeroBlockType
  onUpdate: (data: Partial<HeroBlockType>) => void
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

export function HeroBlock({ block, onUpdate }: Props) {
  const alignment = block.alignment ?? "center";
  const headlineRef = useAutoResize(block.headline);
  const subheadlineRef = useAutoResize(block.subheadline ?? "");

  return (
    <div className={`muse-block-hero muse-block-hero--${alignment}`}>
      <textarea
        ref={headlineRef}
        className="muse-block-hero-headline"
        rows={1}
        value={block.headline}
        onChange={e => onUpdate({ headline: e.target.value })}
        placeholder="Headline..."
      />
      <textarea
        ref={subheadlineRef}
        className="muse-block-hero-subheadline"
        rows={1}
        value={block.subheadline ?? ""}
        onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
        placeholder="Subheadline..."
      />
      <div className="muse-block-hero-ctas">
        <div className="muse-block-hero-cta">
          <input
            type="text"
            value={block.cta?.text ?? ""}
            onChange={e => onUpdate({
              cta: { text: e.target.value, href: block.cta?.href ?? "#" },
            })}
            placeholder="CTA text..."
          />
          <input
            type="text"
            value={block.cta?.href ?? ""}
            onChange={e => onUpdate({
              cta: { text: block.cta?.text ?? "", href: e.target.value },
            })}
            placeholder="CTA link..."
          />
        </div>
      </div>
    </div>
  );
}
