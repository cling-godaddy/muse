import type { HeroBlock as HeroBlockType } from "@muse/core";

interface Props {
  block: HeroBlockType
  onUpdate: (data: Partial<HeroBlockType>) => void
}

export function HeroBlock({ block, onUpdate }: Props) {
  const alignment = block.alignment ?? "center";

  return (
    <div className={`muse-block-hero muse-block-hero--${alignment}`}>
      <input
        className="muse-block-hero-headline"
        type="text"
        value={block.headline}
        onChange={e => onUpdate({ headline: e.target.value })}
        placeholder="Headline..."
      />
      <input
        className="muse-block-hero-subheadline"
        type="text"
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
